import { z } from "zod";
import { publicProcedure, router } from "../trpc";

const THREAD_PER_PAGE = 10;

export const boardsRouter = router({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.board.findMany();
  }),
  getByName: publicProcedure
    .input(z.object({ boardName: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.board.findFirst({
        where: { name: { equals: input.boardName } },
      });
    }),
  getPageNum: publicProcedure
    .input(z.object({ boardName: z.string() }))
    .query(async ({ ctx, input }) => {
      const cnt = await ctx.prisma.thread.count({
        where: {
          board: {
            name: {
              equals: input.boardName,
            },
          },
        },
      });

      return Math.max(1, Math.ceil(cnt / THREAD_PER_PAGE));
    }),
  getPage: publicProcedure
    .input(z.object({ boardName: z.string(), pageNum: z.number() }))
    .query(({ ctx, input }) => {
      const pageIdx = input.pageNum - 1;
      const skip = pageIdx * THREAD_PER_PAGE;

      return ctx.prisma.thread.findMany({
        orderBy: {
          updatedAt: 'desc'
        },
        skip: skip,
        take: THREAD_PER_PAGE,
        where: {
          board: {
            name: {
              equals: input.boardName,
            },
          },
        },
        include: {
          comments: {
            orderBy: {
              id: "desc",
            },
            take: 3,
          },
        },
      });
    }),
});
