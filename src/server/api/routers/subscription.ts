import {
  createCheckoutUrl,
  createPortalUrl,
  getSubscription,
  isSubscribed,
} from "@/core/subscription/subscription.domain";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const subscriptionRouter = createTRPCRouter({
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    return await getSubscription(ctx.session.user.id, ctx.dbAdapter);
  }),

  createCheckoutUrl: protectedProcedure.mutation(
    async ({
      ctx: {
        paymentAdapter,
        session: { user },
      },
    }) => {
      return await createCheckoutUrl(user, paymentAdapter);
    },
  ),

  createPortalUrl: protectedProcedure.mutation(
    async ({
      ctx: {
        dbAdapter,
        paymentAdapter,
        session: { user },
      },
    }) => {
      return await createPortalUrl(user, dbAdapter, paymentAdapter);
    },
  ),

  isSubscribed: protectedProcedure.query(
    async ({
      ctx: {
        dbAdapter,
        session: { user },
      },
    }) => {
      return await isSubscribed(user.id, dbAdapter);
    },
  ),
});
