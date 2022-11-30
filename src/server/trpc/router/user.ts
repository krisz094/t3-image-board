import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const userRouter = router({
  getById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.user.findFirst({
        where: {
          id: input.userId,
        },
        include: {
          _count: {
            select: {
              comments: true,
              threads: true,
            },
          },
        },
      });
    }),
});
