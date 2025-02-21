import { router } from '../trpc';
import { testRouter } from './test';
import { goalRouter } from './goal';

export const appRouter = router({
  test: testRouter,
  goal: goalRouter,
});

export type AppRouter = typeof appRouter; 