// types/index.ts — WEBBERS shared types

export type UserRole = 'admin' | 'sysadmin' | 'customer';

export interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type UnitCategory = 'camera' | 'smartphone' | 'vehicle';
export type UnitStatus = 'available' | 'maintenance' | 'Rented';

export interface RentalUnit {
  unit_id: string;
  unit_name: string;
  category: UnitCategory;
  description: string;
  daily_rate: number;
  status: UnitStatus;
  image_url: string;
  created_at: string;
  // computed
  avg_rating?: number;
  total_bookings?: number;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'active'
  | 'ready_for_return'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface Booking {
  booking_id: string;
  user_id: string;
  unit_id: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: BookingStatus;
  created_at: string;
  // joined
  user?: User;
  unit?: RentalUnit;
  payment?: Payment;
  kyc_documents?: KYCDocument[];
}

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface KYCDocument {
  document_id: string;
  user_id: string;
  booking_id: string | null;
  document_type: 'government_id' | 'selfie_with_id' | 'signed_agreement' | 'drivers_license' | 'lto_record';
  file_url: string;
  verification_status: VerificationStatus;
  submitted_at: string;
  reviewed_at: string | null;
}

export type PaymentMethod = 'GCash' | 'Maya' | 'card';
export type PaymentStatus = 'pending' | 'confirmed' | 'failed';
export type PaymentType = 'Reservation fee' | 'Whole Amount';

export interface Payment {
  payment_id: string;
  booking_id: string;
  amount_paid: number;
  payment_method: PaymentMethod;
  proof_of_payment_url: string | null;
  payment_status: PaymentStatus;
  paid_at: string;
}

export type NotificationType =
  | 'booking_confirmation'
  | 'return_reminder'
  | 'payment_update'
  | 'availability_alert'
  | 'email_verification'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'kyc_resubmit';

export interface Notification {
  notification_id: string;
  user_id: string;
  booking_id: string | null;
  subject: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  sent_at: string;
}

export interface Feedback {
  feedback_id: string;
  user_id: string;
  booking_id: string;
  rating: number;
  comment: string;
  created_at: string;
  // joined
  user?: User;
  booking?: Booking;
}

// Analytics / Reports
export interface RevenueReport {
  month: string;
  revenue: number;
  bookings: number;
}

export interface UnitPerformance {
  unit_id: string;
  unit_name: string;
  category: UnitCategory;
  total_bookings: number;
  total_revenue: number;
  avg_rating: number;
}

export interface DashboardMetrics {
  total_revenue: number;
  active_rentals: number;
  total_users: number;
  pending_approvals: number;
  avg_booking_value: number;
  total_bookings: number;
}