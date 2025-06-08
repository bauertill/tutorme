import { paymentAdapter } from "@/core/adapters/paymentAdapter";
import { handleCheckoutSessionUpdate } from "@/core/subscription/subscription.domain";
import { db } from "@/server/db";
import { redirect } from "next/navigation";

export default async function PaymentCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  if (session_id) {
    await handleCheckoutSessionUpdate(session_id, db, paymentAdapter);
  }
  redirect("/");
}
