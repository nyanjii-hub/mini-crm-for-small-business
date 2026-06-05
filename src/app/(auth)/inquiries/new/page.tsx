"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inquirySchema, InquiryFormValues } from "@/lib/validations";
import type { Customer } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import PageHeader from "@/components/layout/PageHeader";
import Link from "next/link";

export default function NewInquiryPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then(setCustomers);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({ resolver: zodResolver(inquirySchema) });

  const onSubmit = async (values: InquiryFormValues) => {
    const payload = { ...values, customer_id: values.customer_id || null };
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/inquiries");
      router.refresh();
    }
  };

  return (
    <div>
      <PageHeader title="問い合わせを追加" />

      <div className="bg-white rounded-2xl border border-gray-200 p-5 max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="顧客"
            {...register("customer_id")}
            placeholder="顧客を選択（任意）"
            options={customers.map((c) => ({ value: c.id, label: c.name }))}
            error={errors.customer_id?.message}
          />
          <Input
            label="件名"
            {...register("subject")}
            required
            placeholder="問い合わせ内容の要点"
            error={errors.subject?.message}
          />
          <Textarea
            label="本文"
            {...register("body")}
            placeholder="詳細な内容"
            error={errors.body?.message}
          />

          <div className="flex gap-3 pt-2">
            <Link href="/inquiries" className="flex-1">
              <Button type="button" variant="secondary" className="w-full">キャンセル</Button>
            </Link>
            <Button type="submit" loading={isSubmitting} className="flex-1">保存</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
