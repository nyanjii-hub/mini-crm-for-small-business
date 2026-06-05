import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/appointments?date=YYYY-MM-DD&status=pending
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date   = searchParams.get("date");
  const status = searchParams.get("status");

  // user_id が自分のもの、または公開フォームから来た NULL のものを取得
  let query = supabase
    .from("appointments")
    .select("*, customers(id, name)")
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  if (date)   query = query.eq("date", date);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/appointments — 予約作成（管理画面から）
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const { data, error } = await supabase
    .from("appointments")
    .insert({ ...body, user_id: user.id, status: "pending" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
