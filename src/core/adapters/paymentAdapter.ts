import {
  SubscriptionStatus,
  type StripeEvent,
  type StripeSubscription,
} from "@/core/subscription/subscription.types";
import { env } from "@/env";
import assert from "assert";
import Stripe from "stripe";

export class PaymentAdapter {
  constructor(private stripe: Stripe) {}

  async createCheckoutSession(userEmail: string) {
    return await this.stripe.checkout.sessions.create({
      billing_address_collection: "auto",
      customer_email: userEmail,
      mode: "subscription",
      line_items: [{ price: env.STRIPE_SUBSCRIPTION_PRICE_ID, quantity: 1 }],
      success_url: `${env.NEXT_PUBLIC_URL}/api/payment/callback?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_URL}/`,
    });
  }

  async createPortalSession(subscriptionId: string) {
    const subscription =
      await this.stripe.subscriptions.retrieve(subscriptionId);
    assert(subscription.customer, "No customer found in subscription");
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;
    return await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${env.NEXT_PUBLIC_URL}/`,
    });
  }

  async getCheckoutSession(sessionId: string) {
    return await this.stripe.checkout.sessions.retrieve(sessionId);
  }

  async getSubscriptionFromCheckoutSessionId(
    sessionId: string,
  ): Promise<StripeSubscription> {
    const session = await this.getCheckoutSession(sessionId);
    assert(session.subscription, "No subscription found in checkout session");
    if (typeof session.subscription === "string") {
      const subscription = await this.stripe.subscriptions.retrieve(
        session.subscription,
      );
      return subscription;
    } else if (typeof session.subscription === "object") {
      return session.subscription;
    }
    throw new Error("No subscription found in checkout session");
  }

  async getCustomerEmailFromSubscription(
    subscription: StripeSubscription,
  ): Promise<string> {
    if (typeof subscription.customer === "string") {
      const customer = await this.stripe.customers.retrieve(
        subscription.customer,
      );
      assert(!customer.deleted, "Customer is deleted");
      assert(customer.email, "No email found for customer");
      return customer.email;
    } else if (typeof subscription.customer === "object") {
      assert(!subscription.customer.deleted, "Customer is deleted");
      assert(subscription.customer.email, "No email found for customer");
      return subscription.customer.email;
    }
    throw new Error("No customer found in subscription");
  }

  getSubscriptionStatus(subscription: StripeSubscription): SubscriptionStatus {
    if (subscription.status === "active") {
      return SubscriptionStatus.enum.ACTIVE;
    }
    return SubscriptionStatus.enum.INACTIVE;
  }

  parseEvent(body: string, signature: string): StripeEvent {
    return this.stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  }

  getSubscriptionFromEvent(event: StripeEvent): StripeSubscription | null {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
        return event.data.object;
      default:
        return null;
    }
  }
}

export const paymentAdapter = new PaymentAdapter(
  new Stripe(env.STRIPE_SECRET_KEY),
);
