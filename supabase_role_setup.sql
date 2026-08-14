-- Database Setup: User Roles and Permissions
-- This SQL migration handles the role-based system setup

-- ============================================
-- 1. ENSURE tbl_users TABLE HAS ROLE COLUMN
-- ============================================
-- If this column doesn't exist, add it:
ALTER TABLE tbl_users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'sysadmin'));
ALTER TABLE tbl_users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
ALTER TABLE tbl_users ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES tbl_users(user_id) ON DELETE SET NULL;
ALTER TABLE tbl_users ADD COLUMN IF NOT EXISTS assigned_properties jsonb;

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_tbl_users_role ON tbl_users(role);

-- ============================================
-- 2. CREATE SYSADMIN ROLE CHECKLIST
-- ============================================
-- 
-- Prerequisites:
-- 1. You must have Supabase admin access
-- 2. Have the user's email and their auth UUID (from Supabase Auth)
--
-- HOW TO FIND USER'S AUTH UUID (user_id):
-- 1. Go to your Supabase Dashboard → Authentication → Users
-- 2. Find the user and copy their UID
--
-- Option A: Using Supabase SQL Editor (Recommended)
-- =========================================
-- INSERT INTO tbl_users (
--   user_id,
--   first_name,
--   last_name,
--   email,
--   phone_number,
--   role,
--   status
-- ) VALUES (
--   'PASTE_AUTH_UUID_HERE',           -- Get from Supabase Auth > Users > UID column
--   'John',                            -- Sysadmin first name
--   'Admin',                           -- Sysadmin last name
--   'sysadmin@rentspot.ph',           -- Sysadmin email
--   '09XXXXXXXXX',                    -- Phone number
--   'sysadmin',                       -- Role: sysadmin
--   'active'                          -- Status
-- )
-- ON CONFLICT (user_id) DO UPDATE
--   SET role = 'sysadmin', status = 'active';
--
-- Option B: Update existing user to sysadmin
-- ==========================================
-- UPDATE tbl_users
-- SET role = 'sysadmin', status = 'active'
-- WHERE email = 'existing@email.com';
--
-- Verify the sysadmin was created:
-- SELECT user_id, email, first_name, role FROM tbl_users WHERE role = 'sysadmin';

-- ============================================
-- 3. CREATE ADMIN FROM SYSADMIN DASHBOARD
-- ============================================
--
-- This is typically done via the sysadmin UI panel where:
--
-- Step 1: Sysadmin goes to /sysadmin/manage-admins
-- Step 2: Click "Create New Admin" button
-- Step 3: Fill in the form:
--   - Email
--   - First Name
--   - Last Name
--   - Phone Number
--   - Password
-- Step 4: System automatically:
--   a) Creates Supabase auth account
--   b) Creates tbl_users record with role='admin'
--   c) Marks created_by = current_sysadmin.user_id
--   d) Sends verification email
--
-- Manual Database Insert (if needed):
-- ===================================
-- INSERT INTO tbl_users (
--   user_id,              -- From Supabase Auth UUID
--   first_name,
--   last_name,
--   email,
--   phone_number,
--   role,
--   status,
--   created_by            -- UUID of the sysadmin who created this
-- ) VALUES (
--   'NEW_ADMIN_AUTH_UUID',
--   'Jane',
--   'Manager',
--   'admin@rentspot.ph',
--   '09XXXXXXXXX',
--   'admin',
--   'active',
--   'SYSADMIN_USER_ID'     -- The sysadmin's user_id
-- );

-- ============================================
-- 4. CREATE ADMIN AUDIT TRAIL TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tbl_admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES tbl_users(user_id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_action CHECK (action IN ('kyc_reviewed', 'user_suspended', 'booking_cancelled', 'report_generated'))
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON tbl_admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON tbl_admin_audit_log(created_at DESC);

-- ============================================
-- 5. CREATE SYSADMIN AUDIT LOG
-- ============================================
CREATE TABLE IF NOT EXISTS tbl_sysadmin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sysadmin_id uuid NOT NULL REFERENCES tbl_users(user_id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_user_id uuid REFERENCES tbl_users(user_id) ON DELETE SET NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_sysadmin_action CHECK (action IN ('admin_created', 'admin_removed', 'user_suspended', 'system_config_changed'))
);

CREATE INDEX IF NOT EXISTS idx_sysadmin_audit_log_sysadmin_id ON tbl_sysadmin_audit_log(sysadmin_id);
CREATE INDEX IF NOT EXISTS idx_sysadmin_audit_log_created_at ON tbl_sysadmin_audit_log(created_at DESC);

-- ============================================
-- 6. VERIFY YOUR SETUP
-- ============================================
-- Run these queries to verify everything is set up:

-- Check all sysadmins:
-- SELECT user_id, email, first_name, last_name, role, status, created_at 
-- FROM tbl_users 
-- WHERE role = 'sysadmin' 
-- ORDER BY created_at DESC;

-- Check all admins and their creator:
-- SELECT 
--   a.user_id, a.email, a.first_name, a.last_name, a.role, a.status,
--   s.first_name as created_by_name, a.created_at
-- FROM tbl_users a
-- LEFT JOIN tbl_users s ON a.created_by = s.user_id
-- WHERE a.role = 'admin'
-- ORDER BY a.created_at DESC;

-- Check total users by role:
-- SELECT role, COUNT(*) as count 
-- FROM tbl_users 
-- GROUP BY role;

-- Check admin audit log:
-- SELECT * FROM tbl_admin_audit_log ORDER BY created_at DESC LIMIT 10;
