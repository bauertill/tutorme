import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const testRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name ?? 'world'}!`,
        timestamp: new Date().toISOString(),
      };
    }),
  
  getSecretMessage: protectedProcedure
    .query(({ ctx }) => {
      const { user } = ctx.session;
      if (!user?.name || !user?.email) {
        throw new Error('User session is invalid');
      }
      return {
        message: `This is a secret message for ${user.name}!`,
        email: user.email,
      };
    }),
}); 