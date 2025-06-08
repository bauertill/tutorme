import { dbAdapter } from "@/core/adapters/dbAdapter";
import { paymentAdapter } from "@/core/adapters/paymentAdapter";
import { handleEvent } from "@/core/subscription/subscription.domain";
import assert from "assert";
import { type NextRequest } from "next/server";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  let event: Stripe.Event;
  try {
    const signature = request.headers.get("stripe-signature");
    assert(signature, "No signature provided");
    const body = await request.text();
    event = paymentAdapter.parseEvent(body, signature);
  } catch (err) {
    console.log(
      `⚠️  Webhook signature verification failed.`,
      err instanceof Error ? err.message : err,
    );
    return new Response("Bad Request", { status: 400 });
  }

  try {
    await handleEvent(event, dbAdapter, paymentAdapter);
  } catch (err) {
    console.log(
      `⚠️  Webhook handling failed.`,
      err instanceof Error ? err.message : err,
    );
    return new Response("Internal Server Error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
