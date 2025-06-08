import { problemRouter } from "@/server/api/routers/problem";
import { problemUploadRouter } from "@/server/api/routers/problemUpload";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { adminRouter } from "./routers/admin";
import { assignmentRouter } from "./routers/assignment";
import { helpRouter } from "./routers/help";
import { renderAsyRouter } from "./routers/renderAsy";
import { studentSolutionRouter } from "./routers/studentSolution";
import { subscriptionRouter } from "./routers/subscription";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  admin: adminRouter,
  problem: problemRouter,
  problemUpload: problemUploadRouter,
  renderAsy: renderAsyRouter,
  assignment: assignmentRouter,
  subscription: subscriptionRouter,
  help: helpRouter,
  studentSolution: studentSolutionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
