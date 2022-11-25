import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import superjson from "superjson";
import BoardComponent from "../../components/imageboard/BoardComponent";
import { createContextInner } from "../../server/trpc/context";
import { appRouter } from "../../server/trpc/router/_app";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession({ ctx: context });

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContextInner({ session }),
    transformer: superjson,
  });

  const boardName = context.params?.boardName as string;
  const pageNum = +(context.params?.pageNum as string) || 0;

  await Promise.all([
    ssg.boards.getAll.prefetch(),
    ssg.boards.getByName.prefetch({ boardName }),
    ssg.boards.getPageNum.prefetch({ boardName }),
    ssg.boards.getPage.prefetch({ boardName, pageNum }),
  ]);

  return {
    props: {
      trpcState: ssg.dehydrate(),
      boardName,
      pageNum,
    },
  };
}

function BoardPage({
  boardName,
  pageNum,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>{`/${boardName}/ - 3Board`}</title>
      </Head>
      <BoardComponent boardName={boardName} pageNum={pageNum} />
    </>
  );
}

export default BoardPage;
