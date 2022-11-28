import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { adminProcedure, publicProcedure, router } from "../trpc";

export const adminRouter = router({
  isCurrUserAdmin: publicProcedure.query(({ ctx }) => {
    return ctx.session?.user?.email == env.ADMIN_EMAIL;
  }),
  delThread: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      /* return ctx.prisma.thread.delete({
        where: {
          id: input.id,
        },
      }); */
      return ctx.prisma.thread.update({
        where: {
          id: input.id,
        },
        data: {
          deleted: true,
        },
      });
    }),
  delComment: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      /* return ctx.prisma.comment.delete({
        where: {
          id: input.id,
        },
      }); */

      return ctx.prisma.comment.update({
        where: {
          id: input.id,
        },
        data: {
          deleted: true,
        },
      });
    }),
});
