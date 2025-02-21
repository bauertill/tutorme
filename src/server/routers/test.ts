import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const testRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name ?? 'world'}!`,
        timestamp: new Date().toISOString(),
      };
    }),
}); 