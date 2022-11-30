import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type {
    GetServerSidePropsContext,
    InferGetServerSidePropsType
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

  await Promise.all([
    ssg.boards.getAll.prefetch(),
    ssg.boards.getByName.prefetch({ boardName }),
    ssg.boards.getPageNum.prefetch({ boardName }),
    ssg.boards.getPage.prefetch({ boardName, pageNum: 1 }),
  ]);

  context.res.setHeader(
    'Cache-Control',
    'public, s-maxage=15, stale-while-revalidate=60'
  );

  return {
    props: {
      trpcState: ssg.dehydrate(),
      boardName,
    },
  };
}

function BoardIndex({
  boardName,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>{`/${boardName}/ - 3Board`}</title>
      </Head>
      <BoardComponent boardName={boardName} pageNum={1} />
    </>
  );
}

export default BoardIndex;
