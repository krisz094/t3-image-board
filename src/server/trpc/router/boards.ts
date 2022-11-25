import { z } from "zod";
import { publicProcedure, router } from "../trpc";

const THREAD_PER_PAGE = 10;
const PAGES_BEFORE_ARCHIVE = 10;
const MAX_ARCHIVE_THREADS = 100;

export const boardsRouter = router({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.board.findMany();
  }),
  getCatalogThreads: publicProcedure
    .input(z.object({ boardName: z.string() }))
    .query(async ({ ctx, input }) => {
      const take = THREAD_PER_PAGE * PAGES_BEFORE_ARCHIVE;

      const asd = await ctx.prisma.thread.findMany({
        take,
        where: {
          board: {
            name: {
              equals: input.boardName,
            },
          },
        },
        include: {
          comments: {
            select: {
              id: true,
              image: true
            }
          },
          author: true
        },
        orderBy: {
          updatedAt: 'desc'
        },
      });

      return asd;
    }),
  getArchiveThreads: publicProcedure
    .input(z.object({ boardName: z.string() }))
    .query(({ ctx, input }) => {
      const skip = THREAD_PER_PAGE * PAGES_BEFORE_ARCHIVE;
      const take = MAX_ARCHIVE_THREADS;

      return ctx.prisma.thread.findMany({
        skip,
        take,
        where: {
          board: {
            name: {
              equals: input.boardName,
            },
          },
        },
        include: {
          author: true,
        },
      });
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
          updatedAt: "desc",
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
          author: true,
        },
      });
    }),
});
