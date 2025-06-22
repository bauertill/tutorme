import {
  createCheckoutUrl,
  createPortalUrl,
  getSubscription,
  isSubscribed,
} from "@/core/subscription/subscription.domain";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const subscriptionRouter = createTRPCRouter({
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    return await getSubscription(ctx.session.user.id, ctx.db);
  }),

  createCheckoutUrl: protectedProcedure.mutation(
    async ({
      ctx: {
        db,
        paymentAdapter,
        session: { user },
      },
    }) => {
      return await createCheckoutUrl(user, db, paymentAdapter);
    },
  ),

  createPortalUrl: protectedProcedure.mutation(
    async ({
      ctx: {
        db,
        paymentAdapter,
        session: { user },
      },
    }) => {
      return await createPortalUrl(user, db, paymentAdapter);
    },
  ),

  isSubscribed: protectedProcedure.query(
    async ({
      ctx: {
        db,
        session: { user },
      },
    }) => {
      return await isSubscribed(user.id, db);
    },
  ),
});
