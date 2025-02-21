import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { DBAdapter } from "@/core/adapters/dbAdapter";
import { getGoalForUser } from "@/core/goal/goalDomain";

export const goalRouter = router({
  create: protectedProcedure
    .input(z.object({
      goalText: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user?.email) {
        throw new Error("User email is required");
      }

      const db = new DBAdapter();
      const goal = await db.createGoal(ctx.session.user.email, input.goalText);
      return goal;
    }),

  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.session.user?.email) {
        throw new Error("User email is required");
      }

      const dbAdapter = new DBAdapter();
      const goals = await getGoalForUser(dbAdapter, ctx.session.user.email);
      return { goals };
    }),
}); 