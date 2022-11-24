import { router } from "../trpc";
import { authRouter } from "./auth";
import { boardsRouter } from "./boards";
import { exampleRouter } from "./example";
import { threadsRouter } from "./threads";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  boards: boardsRouter,
  threads: threadsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
