"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema, CustomerFormValues } from "@/lib/validations";
import type { Customer } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import PageHeader from "@/components/layout/PageHeader";
import Link from "next/link";
import { MdArrowBack } from "react-icons/md";

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({ resolver: zodResolver(customerSchema) });

  useEffect(() => {
    fetch(`/api/customers/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setCustomer(data);
        reset({ name: data.name, phone: data.phone ?? "", email: data.email ?? "", notes: data.notes ?? "" });
        setLoading(false);
      });
  }, [params.id, reset]);

  const onSubmit = async (values: CustomerFormValues) => {
    const res = await fetch(`/api/customers/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      router.push("/customers");
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!confirm("この顧客を削除しますか？関連する問い合わせ・請求・予約の顧客情報も削除されます。")) return;
    setDeleting(true);
    await fetch(`/api/customers/${params.id}`, { method: "DELETE" });
    router.push("/customers");
    router.refresh();
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-gray-400">読み込み中...</div>;
  }

  if (!customer) {
    return <div className="py-12 text-center text-sm text-gray-500">顧客が見つかりません</div>;
  }

  return (
    <div>
      <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4">
        <MdArrowBack size={16} />
        顧客一覧に戻る
      </Link>
      <PageHeader title={customer.name} />

      <div className="bg-white rounded-2xl border border-gray-200 p-5 max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="顧客名"
            {...register("name")}
            required
            error={errors.name?.message}
          />
          <Input
            label="電話番号"
            {...register("phone")}
            type="tel"
            error={errors.phone?.message}
          />
          <Input
            label="メールアドレス"
            {...register("email")}
            type="email"
            error={errors.email?.message}
          />
          <Textarea
            label="メモ"
            {...register("notes")}
            error={errors.notes?.message}
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={deleting}
            >
              削除
            </Button>
            <div className="flex-1" />
            <Link href="/customers">
              <Button type="button" variant="secondary">キャンセル</Button>
            </Link>
            <Button type="submit" loading={isSubmitting}>
              保存
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
