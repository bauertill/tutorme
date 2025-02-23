import { requireSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  await requireSession();

  redirect("/dashboard");
}
