import { router } from "../trpc";
import { adminRouter } from "./admin";
import { authRouter } from "./auth";
import { boardsRouter } from "./boards";
import { exampleRouter } from "./example";
import { threadsRouter } from "./threads";
import { userRouter } from "./user";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  boards: boardsRouter,
  threads: threadsRouter,
  admin: adminRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
