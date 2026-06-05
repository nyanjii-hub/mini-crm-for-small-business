import { redirect } from "next/navigation";

// ルート (/) へアクセスしたら /dashboard へリダイレクト
export default function RootPage() {
  redirect("/dashboard");
}
