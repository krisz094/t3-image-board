import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import superjson from "superjson";
import ThreadComponent from "../../../components/imageboard/ThreadComponent";
import { createContextInner } from "../../../server/trpc/context";
import { appRouter } from "../../../server/trpc/router/_app";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession({ ctx: context });

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContextInner({ session }),
    transformer: superjson,
  });

  const boardName = context.params?.boardName as string;

  const board = await ssg.boards.getByName.fetch({ boardName });
  if (!board) {
    return {
      notFound: true,
    };
  }

  const threadId = context.params?.threadId as string;

  await Promise.all([
    ssg.boards.getAll.prefetch(),
    ssg.boards.getByName.prefetch({ boardName }),
    ssg.threads.getById.prefetch({ id: threadId, boardName }),
  ]);

  context.res.setHeader(
    "Cache-Control",
    "public, s-maxage=15, stale-while-revalidate=60"
  );

  return {
    props: {
      trpcState: ssg.dehydrate(),
      boardName,
      threadId,
    },
  };
}

function ThreadPage({
  boardName,
  threadId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>{`/${boardName}/ - 3Board`}</title>
      </Head>
      <ThreadComponent boardName={boardName} threadId={threadId} />
    </>
  );
}

export default ThreadPage;
