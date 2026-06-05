"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MdDashboard,
  MdPeople,
  MdChat,
  MdReceipt,
  MdCalendarMonth,
  MdLogout,
} from "react-icons/md";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard",    label: "ダッシュボード", icon: MdDashboard },
  { href: "/customers",    label: "顧客",           icon: MdPeople },
  { href: "/inquiries",    label: "問い合わせ",     icon: MdChat },
  { href: "/invoices",     label: "請求",           icon: MdReceipt },
  { href: "/appointments", label: "予約",           icon: MdCalendarMonth },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* デスクトップ用サイドバー */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-gray-900 text-white">
        <div className="px-4 py-5 border-b border-gray-700">
          <p className="text-lg font-bold tracking-tight">MiniCRM</p>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-2 py-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <MdLogout size={20} />
            ログアウト
          </button>
        </div>
      </aside>

      {/* モバイル用ボトムナビゲーション */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors
                ${active ? "text-blue-600" : "text-gray-500 hover:text-gray-800"}`}
            >
              <Icon size={22} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
