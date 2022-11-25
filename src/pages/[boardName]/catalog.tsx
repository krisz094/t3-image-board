import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import superjson from "superjson";
import CatalogComponent from "../../components/imageboard/CatalogComponent";
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
    ssg.boards.getCatalogThreads.prefetch({ boardName }),
  ]);

  return {
    props: {
      trpcState: ssg.dehydrate(),
      boardName,
    },
  };
}

function BoardCatalog({
  boardName,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>{`/${boardName}/ - 3Board`}</title>
      </Head>
      <div>
        <CatalogComponent boardName={boardName} />
      </div>
    </>
  );
}

export default BoardCatalog;
