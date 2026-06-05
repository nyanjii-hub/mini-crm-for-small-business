"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { publicBookingSchema, PublicBookingFormValues } from "@/lib/validations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function PublicBookingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PublicBookingFormValues>({ resolver: zodResolver(publicBookingSchema) });

  const onSubmit = async (values: PublicBookingFormValues) => {
    setError("");
    const res = await fetch("/api/public/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json();
      setError(data.error ?? "送信に失敗しました");
    }
  };


  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">予約を受け付けました</h2>
          <p className="text-sm text-gray-500">
            ご予約ありがとうございます。確認後にご連絡いたします。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">予約フォーム</h1>
          <p className="text-sm text-gray-500 mt-1">以下の項目をご記入の上、送信してください</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="お名前"
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
              placeholder="your@email.com"
              error={errors.email?.message}
            />
            <Input
              label="希望日"
              {...register("date")}
              type="date"
              required
              error={errors.date?.message}
            />
            <Input
              label="希望時間"
              {...register("time")}
              type="time"
              error={errors.time?.message}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">サービス内容・ご要望</label>
              <textarea
                {...register("service")}
                rows={4}
                placeholder="ご希望のサービス内容や質問などをご記入ください"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" loading={isSubmitting} className="w-full mt-2">
              予約を申し込む
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
