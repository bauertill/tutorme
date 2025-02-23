import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const conceptRouter = createTRPCRouter({
  byId: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.db.concept.findFirstOrThrow({
      where: { id: input },
      include: {
        goal: true,
      },
    });
  }),
});
