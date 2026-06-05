// ============================================================
// MiniCRM 共通型定義
// ============================================================

export type Profile = {
  id: string;
  company: string;
  owner_name: string;
  created_at: string;
};

export type Customer = {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
};

export type InquiryStatus = "unreplied" | "replied" | "done";

export type Inquiry = {
  id: string;
  user_id: string;
  customer_id: string | null;
  subject: string;
  body: string | null;
  status: InquiryStatus;
  replied_at: string | null;
  created_at: string;
  customers?: Pick<Customer, "id" | "name"> | null;
};

export type InvoiceStatus = "unpaid" | "paid";

export type Invoice = {
  id: string;
  user_id: string;
  customer_id: string | null;
  description: string;
  amount: number;
  issued_at: string;
  payment_due_at: string | null;
  status: InvoiceStatus;
  paid_at: string | null;
  created_at: string;
  customers?: Pick<Customer, "id" | "name"> | null;
};

export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

export type Appointment = {
  id: string;
  user_id: string;
  customer_id: string | null;
  date: string;
  time: string | null;
  service: string | null;
  status: AppointmentStatus;
  created_at: string;
  customers?: Pick<Customer, "id" | "name"> | null;
};
