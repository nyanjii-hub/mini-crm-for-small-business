"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Inquiry, InquiryStatus } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import { MdAdd } from "react-icons/md";

const statusOptions: { value: InquiryStatus | "all"; label: string }[] = [
  { value: "all",       label: "すべて" },
  { value: "unreplied", label: "未返信" },
  { value: "replied",   label: "返信済" },
  { value: "done",      label: "完了" },
];

const nextStatus: Record<InquiryStatus, InquiryStatus | null> = {
  unreplied: "replied",
  replied:   "done",
  done:      null,
};

const nextStatusLabel: Record<InquiryStatus, string> = {
  unreplied: "返信済にする",
  replied:   "完了にする",
  done:      "",
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState<InquiryStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    const url = filter === "all" ? "/api/inquiries" : `/api/inquiries?status=${filter}`;
    const res = await fetch(url);
    const data = await res.json();
    setInquiries(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchInquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
    await fetch(`/api/inquiries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchInquiries();
  };

  return (
    <div>
      <PageHeader
        title="問い合わせ管理"
        action={
          <Link href="/inquiries/new">
            <Button size="sm"><MdAdd size={18} />新規追加</Button>
          </Link>
        }
      />

      {/* フィルタータブ */}
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
        ) : inquiries.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">問い合わせはありません</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {inquiries.map((inq) => {
              const next = nextStatus[inq.status];
              return (
                <li key={inq.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <StatusBadge status={inq.status} />
                        <span className="text-xs text-gray-400">
                          {inq.customers?.name ?? "顧客未設定"}
                        </span>
                      </div>
                      <p className="font-medium text-sm text-gray-900 truncate">{inq.subject}</p>
                      {inq.body && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{inq.body}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(inq.created_at).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                    {next && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatusChange(inq.id, next)}
                        className="shrink-0 text-xs"
                      >
                        {nextStatusLabel[inq.status]}
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
