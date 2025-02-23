import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const goalRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.goal.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
        },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.goal.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
});
