"use client";

import { useEffect, useState } from "react";
import type { Appointment, AppointmentStatus } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";

const statusOptions: { value: AppointmentStatus | "all" | "today"; label: string }[] = [
  { value: "today",     label: "今日" },
  { value: "pending",   label: "未確定" },
  { value: "confirmed", label: "確定" },
  { value: "all",       label: "すべて" },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<AppointmentStatus | "all" | "today">("today");
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    let url = "/api/appointments";
    if (filter === "today") {
      const today = new Date().toISOString().split("T")[0];
      url = `/api/appointments?date=${today}`;
    } else if (filter !== "all") {
      url = `/api/appointments?status=${filter}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    setAppointments(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchAppointments();
  };

  return (
    <div>
      <PageHeader title="予約管理" />

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
        ) : appointments.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">予約はありません</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {appointments.map((apt) => (
              <li key={apt.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <StatusBadge status={apt.status} />
                      <span className="text-xs text-gray-400">
                        {new Date(apt.date).toLocaleDateString("ja-JP")}
                        {apt.time ? ` ${apt.time.slice(0, 5)}` : ""}
                      </span>
                    </div>
                    <p className="font-medium text-sm text-gray-900">
                      {apt.customers?.name ?? "顧客未設定"}
                    </p>
                    {apt.service && (
                      <p className="text-xs text-gray-500 mt-0.5">{apt.service}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {apt.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(apt.id, "confirmed")}
                        className="text-xs"
                      >
                        確定する
                      </Button>
                    )}
                    {apt.status !== "cancelled" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusChange(apt.id, "cancelled")}
                        className="text-xs text-gray-500"
                      >
                        キャンセル
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
