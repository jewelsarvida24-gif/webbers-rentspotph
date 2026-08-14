// app/auth/actions.ts
'use server';

import { Resend } from 'resend';
import { createClient } from '@/lib/supabase_server';
import { createAdminClient } from '@/lib/supabase_admin';
import { sendEmailVerification } from '@/lib/email';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? 'RentSpot.ph <noreply@rentspotph.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function registerUser({
  fullName,
  email,
  password,
}: {
  fullName: string;
  email: string;
  password: string;
}) {
  try {
    const adminSupabase = createAdminClient();

    const nameParts = fullName.trim().split(/\s+/);
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    const { data, error } = await adminSupabase.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: {
        redirectTo: `${APP_URL}/auth/login`,
        data: {
          first_name,
          last_name,
          phone_number: '',
        },
      },
    });

    if (error || !data) {
      console.error('Signup generateLink error:', error);
      return {
        error: error?.message ?? 'Failed to create account',
      };
    }

    if (data.user) {
      const { error: upsertError } = await adminSupabase
        .from('tbl_users')
        .upsert({
          user_id: data.user.id,
          first_name,
          last_name,
          email,
          phone_number: '',
          role: 'customer',
        });

      if (upsertError) {
        console.error('User profile upsert error:', upsertError);
      }
    }

    const verificationUrl = data.properties.action_link;

    const emailResult = await sendEmailVerification(
      email,
      first_name || 'there',
      verificationUrl
    );

    if (emailResult.error) {
      console.error(
        'Resend verification error:',
        emailResult.error
      );

      return {
        error: 'Failed to send verification email',
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Registration error:', error);

    return {
      error: error.message || 'An error occurred',
    };
  }
}

export async function registerAdminUser({
  first_name,
  last_name,
  email,
  phone_number,
  password,
  invitation_code,
}: {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  invitation_code: string;
}) {
  try {
    const adminSupabase = createAdminClient();

    if (!invitation_code) {
      return { error: 'Invitation code is required' };
    }

    const { data: invitation, error: invitationError } = await adminSupabase
      .from('tbl_admin_invitations')
      .select('*')
      .eq('code', invitation_code)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      return { error: 'Invalid or expired invitation code' };
    }

    const { data, error } = await adminSupabase.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: {
        redirectTo: `${APP_URL}/admin/auth/login`,
        data: {
          first_name,
          last_name,
          phone_number,
          role: 'admin',
        },
      },
    });

    if (error || !data) {
      console.error('Admin signup generateLink error:', error);
      return { error: error?.message ?? 'Failed to create admin account' };
    }

    if (data.user) {
      const { error: upsertError } = await adminSupabase.from('tbl_users').upsert({
        user_id: data.user.id,
        first_name,
        last_name,
        email,
        phone_number,
        role: 'admin',
      });

      if (upsertError) {
        console.error('Admin profile upsert error:', upsertError);
      }

      await adminSupabase
        .from('tbl_admin_invitations')
        .update({ status: 'used', used_by: data.user.id, used_at: new Date().toISOString() })
        .eq('id', invitation.id);
    }

    const verificationUrl = data.properties.action_link;
    const emailResult = await sendEmailVerification(email, first_name || 'there', verificationUrl);

    if (emailResult.error) {
      console.error('Resend admin verification error:', emailResult.error);
      return { error: 'Failed to send verification email' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Admin registration error:', error);
    return { error: error.message || 'An error occurred' };
  }
}

export async function sendPasswordResetEmail(email: string) {
  try {
    // Get Supabase client
    const supabase = await createClient();

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('tbl_users')
      .select('user_id, first_name')
      .eq('email', email)
      .single();

    if (userError || !user) {
      // Don't reveal if email exists (security best practice)
      return { success: true, message: 'If email exists, reset link will be sent' };
    }

    // Generate reset token (32 bytes = 64 hex characters)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours

    // Store token in database
    const { error: tokenError } = await supabase
      .from('tbl_password_reset_tokens')
      .insert({
        user_id: user.user_id,
        email: email,
        token: token,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error('Token storage error:', tokenError);
      return { error: 'Failed to create reset link' };
    }

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    // Send email via Resend
    const result = await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Reset Your RentSpot.ph Password',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
          <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">Hello ${user.first_name || 'there'},</p>
            
            <p style="color: #4b5563; line-height: 1.6;">We received a request to reset your password for RentSpot.ph. Click the button below to create a new password:</p>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${resetLink}" style="background-color: #5B21B6; color: white; padding: 12px 40px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 600;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">Or copy and paste this link in your browser:</p>
            <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; color: #1f2937; font-size: 12px;">${resetLink}</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This link expires in 24 hours. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </p>
            
            <p style="color: #9ca3af; font-size: 12px; margin-top: 10px;">
              Best regards,<br>RentSpot.ph Team
            </p>
          </div>
        </div>
      `,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return { error: 'Failed to send email' };
    }

    return { success: true, message: 'Password reset link sent to your email' };
  } catch (error: any) {
    console.error('Password reset error:', error);
    return { error: error.message || 'An error occurred' };
  }
}

export async function verifyPasswordResetToken(token: string) {
  try {
    const supabase = await createClient();

    // Get token from database
    const { data: resetToken, error } = await supabase
      .from('tbl_password_reset_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !resetToken) {
      return { error: 'Invalid reset link' };
    }

    // Check if expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return { error: 'Reset link has expired' };
    }

    // Check if already used
    if (resetToken.used) {
      return { error: 'Reset link has already been used' };
    }

    return { success: true, email: resetToken.email, token_id: resetToken.id };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // Verify token
    const { data: resetToken, error: tokenError } = await supabase
      .from('tbl_password_reset_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !resetToken) {
      return { error: 'Invalid reset link' };
    }

    // Check if expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return { error: 'Reset link has expired' };
    }

    // Check if already used
    if (resetToken.used) {
      return { error: 'Reset link has already been used' };
    }

    // Get user
    const { data: user } = await supabase
      .from('tbl_users')
      .select('user_id')
      .eq('user_id', resetToken.user_id)
      .single();

    if (!user) {
      return { error: 'User not found' };
    }

    // Update password in Supabase Auth
    const { error: authError } = await adminSupabase.auth.admin.updateUserById(user.user_id, {
      password: newPassword,
    });

    if (authError) {
      return { error: authError.message };
    }

    // Mark token as used
    await supabase
      .from('tbl_password_reset_tokens')
      .update({ used: true })
      .eq('id', resetToken.id);

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
