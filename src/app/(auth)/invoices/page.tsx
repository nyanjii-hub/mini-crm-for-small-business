"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Invoice, InvoiceStatus } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import { MdAdd, MdWarning } from "react-icons/md";

const statusOptions: { value: InvoiceStatus | "all"; label: string }[] = [
  { value: "all",    label: "すべて" },
  { value: "unpaid", label: "未支払い" },
  { value: "paid",   label: "支払済" },
];

function isReminderFlag(invoice: Invoice): boolean {
  if (invoice.status !== "unpaid" || !invoice.payment_due_at) return false;
  const due = new Date(invoice.payment_due_at);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 7;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<InvoiceStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    const url = filter === "all" ? "/api/invoices" : `/api/invoices?status=${filter}`;
    const res = await fetch(url);
    const data = await res.json();
    setInvoices(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleMarkPaid = async (id: string) => {
    await fetch(`/api/invoices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid", paid_at: new Date().toISOString() }),
    });
    fetchInvoices();
  };

  return (
    <div>
      <PageHeader
        title="請求管理"
        action={
          <Link href="/invoices/new">
            <Button size="sm"><MdAdd size={18} />新規作成</Button>
          </Link>
        }
      />

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${filter === opt.value
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">読み込み中...</div>
        ) : invoices.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">請求はありません</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {invoices.map((inv) => {
              const reminder = isReminderFlag(inv);
              return (
                <li
                  key={inv.id}
                  className={`px-4 py-3 ${reminder ? "bg-orange-50" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <StatusBadge status={inv.status} />
                        {reminder && (
                          <span className="inline-flex items-center gap-0.5 text-xs text-orange-600 font-medium">
                            <MdWarning size={14} />
                            支払期限まもなく
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-sm text-gray-900">{inv.description}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {inv.customers?.name ?? "顧客未設定"} —{" "}
                        <span className="font-semibold">¥{inv.amount.toLocaleString()}</span>
                      </p>
                      {inv.payment_due_at && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          支払期限: {new Date(inv.payment_due_at).toLocaleDateString("ja-JP")}
                        </p>
                      )}
                    </div>
                    {inv.status === "unpaid" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMarkPaid(inv.id)}
                        className="shrink-0 text-xs"
                      >
                        支払済にする
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
