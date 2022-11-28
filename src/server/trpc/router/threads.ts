import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const threadsRouter = router({
  create: publicProcedure
    .input(
      z.object({
        boardName: z.string(),
        text: z.string().min(1, { message: "Thread text cannot be empty" }),
        image: z.string().min(1, { message: "Thread image cannot be empty" }),
        subject: z.string().nullable(),
      })
    )
    .mutation(({ ctx, input }) => {
      const currUserId = ctx.session?.user?.id;
      const ip = ctx.ip;

      /* console.log("IP ADDR", ip); */

      return ctx.prisma.thread.create({
        data: {
          deleted: false,
          ip: ip,
          image: input.image,
          text: input.text,
          timestamp: new Date(),
          updatedAt: new Date(),
          board: {
            connect: {
              name: input.boardName,
            },
          },
          subject: input.subject,
          author: currUserId
            ? {
              connect: {
                id: currUserId,
              },
            }
            : undefined,
        },
      });
    }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.thread.findFirst({
        where: {
          deleted: false,
          id: {
            equals: input.id,
          },
        },
        include: {
          comments: {
            include: {
              author: true,
            },
            where: {
              deleted: false,
            },
          },
          author: true,
        },
      });
    }),
  reply: publicProcedure
    .input(
      z
        .object({
          threadId: z.string(),
          text: z.string().nullable(),
          image: z.string().min(1).nullable(),
        })
        .refine((data) => !!data.text || !!data.image, {
          message: "Comment needs either text or image",
        })
    )
    .mutation(async ({ ctx, input }) => {
      const currUserId = ctx.session?.user?.id;
      const ip = ctx.ip;

      const [comment] = await ctx.prisma.$transaction([
        ctx.prisma.comment.create({
          data: {
            deleted: false,
            ip: ip,
            text: input.text,
            image: input.image,
            timestamp: new Date(),
            threadId: input.threadId,
            userId: currUserId,
          },
        }),
        ctx.prisma.thread.update({
          where: {
            id: input.threadId,
          },
          data: {
            updatedAt: new Date(),
          },
        })
      ]);

      return comment;

    }),
});
