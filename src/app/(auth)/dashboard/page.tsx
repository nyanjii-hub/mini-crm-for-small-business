import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Appointment } from "@/types";
import StatusBadge from "@/components/ui/StatusBadge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().split("T")[0];

  // 未返信の問い合わせ件数
  const { count: unrepliedCount } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "unreplied");

  // 未支払い請求件数
  const { count: unpaidCount } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "unpaid");

  // 今日の予約（確定・未確定）
  const { data: todayAppointments } = await supabase
    .from("appointments")
    .select("*, customers(id, name)")
    .eq("user_id", user.id)
    .eq("date", today)
    .neq("status", "cancelled")
    .order("time", { ascending: true });

  const appointments = (todayAppointments ?? []) as Appointment[];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">ダッシュボード</h1>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/inquiries?status=unreplied"
          className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
        >
          <p className="text-xs text-gray-500 mb-1">未返信の問い合わせ</p>
          <p className={`text-3xl font-bold ${(unrepliedCount ?? 0) > 0 ? "text-red-600" : "text-gray-900"}`}>
            {unrepliedCount ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">件</p>
        </Link>

        <Link
          href="/invoices?status=unpaid"
          className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
        >
          <p className="text-xs text-gray-500 mb-1">未支払い請求</p>
          <p className={`text-3xl font-bold ${(unpaidCount ?? 0) > 0 ? "text-orange-600" : "text-gray-900"}`}>
            {unpaidCount ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">件</p>
        </Link>

        <Link
          href="/appointments"
          className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-sm transition-shadow col-span-2 md:col-span-1"
        >
          <p className="text-xs text-gray-500 mb-1">今日の予約</p>
          <p className={`text-3xl font-bold ${appointments.length > 0 ? "text-blue-600" : "text-gray-900"}`}>
            {appointments.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">件</p>
        </Link>
      </div>

      {/* 今日の予約一覧 */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">今日の予約</h2>
        </div>
        {appointments.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            今日の予約はありません
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {appointments.map((apt) => (
              <li key={apt.id} className="px-4 py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {apt.customers?.name ?? "顧客未設定"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {apt.time ?? "時間未定"} {apt.service ? `— ${apt.service}` : ""}
                  </p>
                </div>
                <StatusBadge status={apt.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
