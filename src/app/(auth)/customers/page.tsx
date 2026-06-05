import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Customer } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import { MdAdd, MdPerson } from "react-icons/md";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const customers = (data ?? []) as Customer[];

  return (
    <div>
      <PageHeader
        title="顧客管理"
        description={`${customers.length} 件`}
        action={
          <Link href="/customers/new">
            <Button size="sm">
              <MdAdd size={18} />
              新規追加
            </Button>
          </Link>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {customers.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <MdPerson size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">顧客がまだ登録されていません</p>
            <Link href="/customers/new" className="mt-3 inline-block">
              <Button size="sm" variant="secondary">最初の顧客を追加</Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {customers.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/customers/${c.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {[c.phone, c.email].filter(Boolean).join(" / ") || "連絡先未登録"}
                    </p>
                  </div>
                  <span className="text-gray-300 text-lg">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
