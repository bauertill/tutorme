import { dbAdapter, type DBAdapter } from "@/core/adapters/dbAdapter";
import assert from "assert";
import { type PaymentAdapter } from "../adapters/paymentAdapter";
import { type User } from "../user/user.types";
import {
  type StripeEvent,
  type StripeSubscription,
} from "./subscription.types";

export async function getSubscription(userId: string, dbAdapter: DBAdapter) {
  return await dbAdapter.getSubscriptionByUserId(userId);
}

export async function createCheckoutUrl(
  user: User,
  paymentAdapter: PaymentAdapter,
) {
  const subscription = await getSubscription(user.id, dbAdapter);
  if (subscription) {
    // URL to Stripe portal if user already has a subscription (which may be cancelled)
    const { url } = await paymentAdapter.createPortalSession(
      subscription.stripeSubscriptionId,
    );
    assert(url, "No portal URL provided by Stripe");
    return url;
  } else {
    // Otherwise, URL to new checkout session
    assert(user.email, "User email is required");
    const { url } = await paymentAdapter.createCheckoutSession(user.email);
    assert(url, "No checkout URL provided by Stripe");
    return url;
  }
}

export async function createPortalUrl(
  user: User,
  dbAdapter: DBAdapter,
  paymentAdapter: PaymentAdapter,
) {
  const subscription = await getSubscription(user.id, dbAdapter);
  assert(subscription, "No subscription found for user");
  const { url } = await paymentAdapter.createPortalSession(
    subscription.stripeSubscriptionId,
  );
  assert(url, "No portal URL provided by Stripe");
  return url;
}

export async function handleSubscriptionUpdate(
  subscription: StripeSubscription,
  dbAdapter: DBAdapter,
  paymentAdapter: PaymentAdapter,
) {
  const email =
    await paymentAdapter.getCustomerEmailFromSubscription(subscription);
  const user = await dbAdapter.getUserByEmail(email);
  await dbAdapter.upsertSubscriptionByUserId(user.id, {
    status: paymentAdapter.getSubscriptionStatus(subscription),
    stripeSubscriptionId: subscription.id,
    cancelAt: subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000)
      : null,
  });
}

export async function handleCheckoutSessionUpdate(
  checkoutSessionId: string,
  dbAdapter: DBAdapter,
  paymentAdapter: PaymentAdapter,
) {
  const subscription =
    await paymentAdapter.getSubscriptionFromCheckoutSessionId(
      checkoutSessionId,
    );
  await handleSubscriptionUpdate(subscription, dbAdapter, paymentAdapter);
}

export async function handleEvent(
  event: StripeEvent,
  dbAdapter: DBAdapter,
  paymentAdapter: PaymentAdapter,
) {
  const subscription = paymentAdapter.getSubscriptionFromEvent(event);
  if (!subscription) {
    return;
  }
  await handleSubscriptionUpdate(subscription, dbAdapter, paymentAdapter);
}

export async function isSubscribed(userId: string, dbAdapter: DBAdapter) {
  const subscription = await getSubscription(userId, dbAdapter);
  return subscription?.status === "ACTIVE";
}
