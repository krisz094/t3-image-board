import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type {
    GetServerSidePropsContext,
    InferGetServerSidePropsType
} from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import superjson from "superjson";
import { AdminComponent } from "../../components/admin/AdminComponent";
import { createContextInner } from "../../server/trpc/context";
import { appRouter } from "../../server/trpc/router/_app";

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getSession({ ctx: context });

    const ssg = createProxySSGHelpers({
        router: appRouter,
        ctx: await createContextInner({ session }),
        transformer: superjson,
    });

    const isAdmin = await ssg.admin.isCurrUserAdmin.fetch();
    if (!isAdmin) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=15, stale-while-revalidate=60'
    );

    return {
        props: {
            /* trpcState: ssg.dehydrate(), */
        },
    };
}

function BoardIndex({
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <>
            <Head>
                <title>{`Admin - 3Board`}</title>
            </Head>
            <AdminComponent />
        </>
    );
}

export default BoardIndex;
