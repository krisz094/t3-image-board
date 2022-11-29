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

      const a = await ctx.prisma.thread.findMany({
        take,
        where: {
          deleted: false,
          board: {
            name: input.boardName,
          },
        },
        select: {
          comments: {
            select: {
              id: true,
              image: true,
            },
            where: {
              deleted: false,
            },
          },
          author: true,
          id: true,
          image: true,
          subject: true,
          text: true,
          timestamp: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      return a;
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
          deleted: false,
          board: {
            name: {
              equals: input.boardName,
            },
          },
        },
        select: {
          comments: {
            select: {
              id: true,
              image: true,
            },
            where: {
              deleted: false,
            },
          },
          author: true,
          id: true,
          image: true,
          subject: true,
          text: true,
          timestamp: true,
          updatedAt: true,
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
          deleted: false,
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
    .query(async ({ ctx, input }) => {
      const pageIdx = input.pageNum - 1;
      const skip = pageIdx * THREAD_PER_PAGE;

      const a = await ctx.prisma.thread.findMany({
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
          deleted: false,
        },
        select: {
          comments: {
            take: 3,
            orderBy: {
              timestamp: "desc",
            },
            select: {
              id: true,
              image: true,
              text: true,
              timestamp: true,
              author: {
                select: { name: true, image: true, id: true },
              },
            },
            where: {
              deleted: false,
            },
          },
          _count: { select: { comments: true } },
          author: {
            select: {
              name: true,
              image: true,
              id: true,
            },
          },
          id: true,
          image: true,
          subject: true,
          timestamp: true,
          updatedAt: true,
          text: true,
        },
      });

      return a;
    }),
});
