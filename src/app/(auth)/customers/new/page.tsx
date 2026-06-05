"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema, CustomerFormValues } from "@/lib/validations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import PageHeader from "@/components/layout/PageHeader";
import Link from "next/link";

export default function NewCustomerPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({ resolver: zodResolver(customerSchema) });

  const onSubmit = async (values: CustomerFormValues) => {
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      router.push("/customers");
      router.refresh();
    }
  };

  return (
    <div>
      <PageHeader title="顧客を追加" />

      <div className="bg-white rounded-2xl border border-gray-200 p-5 max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="顧客名"
            {...register("name")}
            required
            placeholder="山田 太郎"
            error={errors.name?.message}
          />
          <Input
            label="電話番号"
            {...register("phone")}
            type="tel"
            placeholder="090-1234-5678"
            error={errors.phone?.message}
          />
          <Input
            label="メールアドレス"
            {...register("email")}
            type="email"
            placeholder="customer@example.com"
            error={errors.email?.message}
          />
          <Textarea
            label="メモ"
            {...register("notes")}
            placeholder="特記事項など"
            error={errors.notes?.message}
          />

          <div className="flex gap-3 pt-2">
            <Link href="/customers" className="flex-1">
              <Button type="button" variant="secondary" className="w-full">キャンセル</Button>
            </Link>
            <Button type="submit" loading={isSubmitting} className="flex-1">
              保存
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
