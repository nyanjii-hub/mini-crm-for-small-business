"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, InvoiceFormValues } from "@/lib/validations";
import type { Customer } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import PageHeader from "@/components/layout/PageHeader";
import Link from "next/link";

export default function NewInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then(setCustomers);
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { issued_at: today },
  });

  const onSubmit = async (values: InvoiceFormValues) => {
    const payload = { ...values, customer_id: values.customer_id || null };
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/invoices");
      router.refresh();
    }
  };

  return (
    <div>
      <PageHeader title="請求を作成" />

      <div className="bg-white rounded-2xl border border-gray-200 p-5 max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="顧客"
            {...register("customer_id")}
            placeholder="顧客を選択（任意）"
            options={customers.map((c) => ({ value: c.id, label: c.name }))}
            error={errors.customer_id?.message}
          />
          <Textarea
            label="内容"
            {...register("description")}
            required
            placeholder="請求内容の説明"
            error={errors.description?.message}
          />
          <Input
            label="金額（円）"
            {...register("amount")}
            type="number"
            required
            min="0"
            placeholder="10000"
            error={errors.amount?.message}
          />
          <Input
            label="発行日"
            {...register("issued_at")}
            type="date"
            required
            error={errors.issued_at?.message}
          />
          <Input
            label="支払期限"
            {...register("payment_due_at")}
            type="date"
            error={errors.payment_due_at?.message}
          />

          <div className="flex gap-3 pt-2">
            <Link href="/invoices" className="flex-1">
              <Button type="button" variant="secondary" className="w-full">キャンセル</Button>
            </Link>
            <Button type="submit" loading={isSubmitting} className="flex-1">保存</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
