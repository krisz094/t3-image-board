import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type {
    GetServerSidePropsContext,
    InferGetServerSidePropsType
} from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import superjson from "superjson";
import { UserComponent } from "../../components/user/UserComponent";
import { createContextInner } from "../../server/trpc/context";
import { appRouter } from "../../server/trpc/router/_app";

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getSession({ ctx: context });

    const ssg = createProxySSGHelpers({
        router: appRouter,
        ctx: await createContextInner({ session }),
        transformer: superjson,
    });

    const userId = context.params?.userId as string;

    await Promise.all([
        ssg.user.getById.prefetch({ userId })
    ]);

    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=15, stale-while-revalidate=60'
    );

    return {
        props: {
            trpcState: ssg.dehydrate(),
            userId,
        },
    };
}

function BoardIndex({
    userId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <>
            <Head>
                <title>{`User - 3Board`}</title>
            </Head>
            <UserComponent userId={userId} />
        </>
    );
}

export default BoardIndex;
