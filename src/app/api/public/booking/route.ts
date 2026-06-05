import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 公開予約フォーム用 API — サービスロールキーでRLSをバイパス
// このAPIはサーバーサイドのみで実行されるため秘密鍵の使用は安全

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await request.json();
  const { name, phone, email, date, time, service } = body;

  if (!name || !date) {
    return NextResponse.json({ error: "お名前と希望日は必須です" }, { status: 400 });
  }

  // 1. 同じメールアドレスの顧客が存在するかチェック
  let customerId: string | null = null;

  if (email) {
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      customerId = existing.id;
    }
  }

  // 2. 顧客が存在しない場合は新規作成
  if (!customerId) {
    const { data: newCustomer, error: customerError } = await supabase
      .from("customers")
      .insert({ name, phone: phone || null, email: email || null })
      .select("id")
      .single();

    if (customerError) {
      console.error("customer insert error:", customerError);
      return NextResponse.json({ error: "顧客の登録に失敗しました: " + customerError.message }, { status: 500 });
    }
    customerId = newCustomer.id;
  }

  // 3. 予約を pending で作成（user_id は NULL — 事業者が後で確認）
  const { error: aptError } = await supabase
    .from("appointments")
    .insert({
      customer_id: customerId,
      date,
      time: time || null,
      service: service || null,
      status: "pending",
      user_id: null,
    });

  if (aptError) {
    console.error("appointment insert error:", aptError);
    return NextResponse.json({ error: "予約の登録に失敗しました: " + aptError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "予約を受け付けました" }, { status: 201 });
}
