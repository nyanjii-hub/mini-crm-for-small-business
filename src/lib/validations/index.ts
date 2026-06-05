import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "顧客名は必須です"),
  phone: z.string().optional(),
  email: z.string().email("正しいメールアドレスを入力してください").optional().or(z.literal("")),
  notes: z.string().optional(),
});
export type CustomerFormValues = z.infer<typeof customerSchema>;

export const inquirySchema = z.object({
  customer_id: z.string().uuid("顧客を選択してください").optional().or(z.literal("")),
  subject: z.string().min(1, "件名は必須です"),
  body: z.string().optional(),
});
export type InquiryFormValues = z.infer<typeof inquirySchema>;

export const invoiceSchema = z.object({
  customer_id: z.string().uuid("顧客を選択してください").optional().or(z.literal("")),
  description: z.string().min(1, "内容は必須です"),
  amount: z.coerce.number().min(0, "金額は0以上で入力してください"),
  issued_at: z.string().min(1, "発行日は必須です"),
  payment_due_at: z.string().optional(),
});
export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export const appointmentSchema = z.object({
  customer_id: z.string().uuid("顧客を選択してください").optional().or(z.literal("")),
  date: z.string().min(1, "日付は必須です"),
  time: z.string().optional(),
  service: z.string().optional(),
});
export type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export const publicBookingSchema = z.object({
  name: z.string().min(1, "お名前は必須です"),
  phone: z.string().optional(),
  email: z.string().email("正しいメールアドレスを入力してください").optional().or(z.literal("")),
  date: z.string().min(1, "希望日は必須です"),
  time: z.string().optional(),
  service: z.string().optional(),
});
export type PublicBookingFormValues = z.infer<typeof publicBookingSchema>;

export const setupSchema = z.object({
  company: z.string().min(1, "会社名・屋号は必須です"),
  owner_name: z.string().min(1, "代表者名は必須です"),
});
export type SetupFormValues = z.infer<typeof setupSchema>;
