import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const threadsRouter = router({
  create: publicProcedure
    .input(
      z.object({
        boardName: z.string(),
        text: z.string().min(1, { message: "Post cannot be empty" }),
        image: z.string().nullable(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.thread.create({
        data: {
          image: input.image,
          text: input.text,
          timestamp: new Date(),
          updatedAt: new Date(),
          board: {
            connect: {
              name: input.boardName,
            },
          },
        },
      });
    }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.thread.findFirst({
        where: {
          id: {
            equals: input.id,
          },
        },
        include: {
          comments: true,
        },
      });
    }),
  reply: publicProcedure
    .input(
      z.object({
        threadId: z.string(),
        text: z.string(),
        image: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const com = await ctx.prisma.comment.create({
        data: {
          text: input.text,
          image: input.image,
          timestamp: new Date(),
          threadId: input.threadId,
        },
      });

      await ctx.prisma.thread.update({
        where: {
          id: input.threadId,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      return com;
    }),
});
