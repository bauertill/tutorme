import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
export const renderAsyRouter = createTRPCRouter({
  render: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.renderAsyAdapter.render(input);
  }),

});
