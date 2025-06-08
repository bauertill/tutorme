import type Stripe from "stripe";
import { z } from "zod";

export type StripeEvent = Stripe.Event;
export type StripeSubscription = Stripe.Subscription;

export const SubscriptionStatus = z.enum(["ACTIVE", "INACTIVE"]);

export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>;

export const Subscription = z.object({
  id: z.string(),
  status: SubscriptionStatus,
  stripeSubscriptionId: z.string(),
  cancelAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
});

export type Subscription = z.infer<typeof Subscription>;
