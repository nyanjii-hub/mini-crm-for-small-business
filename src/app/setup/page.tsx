"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { setupSchema, SetupFormValues } from "@/lib/validations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SetupPage() {
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetupFormValues>({ resolver: zodResolver(setupSchema) });

  const onSubmit = async (values: SetupFormValues) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...values });

    if (!error) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">初回セットアップ</h1>
          <p className="text-sm text-gray-500 mt-1">事業者情報を入力してください</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="会社名・屋号"
              {...register("company")}
              required
              placeholder="株式会社〇〇 / 個人事業名"
              error={errors.company?.message}
            />
            <Input
              label="代表者名"
              {...register("owner_name")}
              required
              placeholder="山田 太郎"
              error={errors.owner_name?.message}
            />

            <Button type="submit" loading={isSubmitting} className="w-full mt-2">
              保存して開始
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
