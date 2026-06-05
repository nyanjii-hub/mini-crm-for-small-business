"use client";

type BadgeProps = {
  status: string;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  // Inquiry
  unreplied: { label: "未返信", className: "bg-red-100 text-red-700" },
  replied:   { label: "返信済", className: "bg-yellow-100 text-yellow-700" },
  done:      { label: "完了",   className: "bg-green-100 text-green-700" },
  // Invoice
  unpaid:    { label: "未支払い", className: "bg-orange-100 text-orange-700" },
  paid:      { label: "支払済",   className: "bg-green-100 text-green-700" },
  // Appointment
  pending:   { label: "未確定",   className: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "確定",     className: "bg-blue-100 text-blue-700" },
  cancelled: { label: "キャンセル", className: "bg-gray-100 text-gray-500" },
};

export default function StatusBadge({ status }: BadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
