import { type PrismaClient } from "@prisma/client";
import assert from "assert";
import { type PaymentAdapter } from "../adapters/paymentAdapter";
import { UserRepository } from "../user/user.repository";
import { type User } from "../user/user.types";
import { SubscriptionRepository } from "./subscription.repository";
import {
  type StripeEvent,
  type StripeSubscription,
} from "./subscription.types";

export async function getSubscription(userId: string, db: PrismaClient) {
  const subscriptionRepository = new SubscriptionRepository(db);
  return await subscriptionRepository.getSubscriptionByUserId(userId);
}

export async function createCheckoutUrl(
  user: User,
  db: PrismaClient,
  paymentAdapter: PaymentAdapter,
) {
  const subscription = await getSubscription(user.id, db);
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
  db: PrismaClient,
  paymentAdapter: PaymentAdapter,
) {
  const subscription = await getSubscription(user.id, db);
  assert(subscription, "No subscription found for user");
  const { url } = await paymentAdapter.createPortalSession(
    subscription.stripeSubscriptionId,
  );
  assert(url, "No portal URL provided by Stripe");
  return url;
}

export async function handleSubscriptionUpdate(
  subscription: StripeSubscription,
  db: PrismaClient,
  paymentAdapter: PaymentAdapter,
) {
  const subscriptionRepository = new SubscriptionRepository(db);
  const userRepository = new UserRepository(db);
  const email =
    await paymentAdapter.getCustomerEmailFromSubscription(subscription);
  const user = await userRepository.getUserByEmail(email);
  await subscriptionRepository.upsertSubscriptionByUserId(user.id, {
    status: paymentAdapter.getSubscriptionStatus(subscription),
    stripeSubscriptionId: subscription.id,
    cancelAt: subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000)
      : null,
  });
}

export async function handleCheckoutSessionUpdate(
  checkoutSessionId: string,
  db: PrismaClient,
  paymentAdapter: PaymentAdapter,
) {
  const subscription =
    await paymentAdapter.getSubscriptionFromCheckoutSessionId(
      checkoutSessionId,
    );
  await handleSubscriptionUpdate(subscription, db, paymentAdapter);
}

export async function handleEvent(
  event: StripeEvent,
  db: PrismaClient,
  paymentAdapter: PaymentAdapter,
) {
  const subscription = paymentAdapter.getSubscriptionFromEvent(event);
  if (!subscription) {
    return;
  }
  await handleSubscriptionUpdate(subscription, db, paymentAdapter);
}

export async function isSubscribed(userId: string, db: PrismaClient) {
  const subscription = await getSubscription(userId, db);
  return subscription?.status === "ACTIVE";
}
