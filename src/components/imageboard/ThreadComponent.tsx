import Link from "next/link";
import { useRouter } from "next/router";
import { memo, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { trpc } from "../../utils/trpc";
import { BoardNameDesc } from "./BoardNameDesc";
import { BoardsListHead } from "./BoardsListHead";
import { Comment } from "./Comment";
import { HorizontalLine } from "./HorizontalLine";
import ReplyCompose from "./ReplyCompose";

export interface ReplyFormProps {
    replyText: string;
    media: File[];
}

const ThreadComponent = memo(function ThreadComp({ threadId, boardName }: { threadId: string, boardName: string }) {
    const router = useRouter();

    const formMethods = useForm<ReplyFormProps>();
    const trpcC = trpc.useContext();
    const boardQ = trpc.boards.getByName.useQuery({ boardName });
    const threadQ = trpc.threads.getById.useQuery({ id: threadId });
    const isAdminQ = trpc.admin.isCurrUserAdmin.useQuery();
    const isAdmin = useMemo(() => !!isAdminQ.data, [isAdminQ.data]);

    /* Mutations */
    const delThreadMut = trpc.admin.delThread.useMutation({
        onSuccess: async () => {
            router.replace(`/${boardName}`);
        }
    });
    const delCommentMut = trpc.admin.delComment.useMutation({
        onMutate: async ({ id: commentId }) => {
            const dat = trpcC.threads.getById.getData({ id: threadId });
            if (dat) {
                trpcC.threads.getById.setData({ id: threadId }, () => {
                    return {
                        ...dat,
                        comments: dat.comments.filter(x => x.id != commentId)
                    }
                });
            }
        },
        onSuccess: async () => {
            threadQ.refetch();
        }
    });

    if (boardQ.isLoading) {
        return <div>Loading...</div>
    }
    else if (boardQ.isError || !boardQ.data) {
        return <div>Error</div>
    }

    return (
        <div className="min-h-[100vh] bg-gradient-to-b from-brownmain-100 to-brownmain-200 p-2 space-y-2">
            <BoardsListHead />
            <BoardNameDesc desc={boardQ.data?.description} name={boardQ.data?.name} />

            <FormProvider {...formMethods} >
                <ReplyCompose threadId={threadId} />
            </FormProvider>

            <HorizontalLine />

            <div className="flex gap-2">
                <div>
                    <span >[</span>
                    <Link href={`/${boardName}`} ><span className="cursor-pointer hover:text-red-500">Home</span></Link>
                    <span >]</span>
                </div>

                <div>
                    <span >[</span>
                    <Link href={`/${boardName}/catalog`} ><span className="cursor-pointer hover:text-red-500">Catalog</span></Link>
                    <span >]</span>
                </div>

                <div>
                    <span >[</span>
                    <Link href={`/${boardName}/archive`} ><span className="cursor-pointer hover:text-red-500">Archive</span></Link>
                    <span >]</span>
                </div>
            </div>

            <HorizontalLine />

            <div className="flex flex-col items-start gap-2 ">

                {threadQ.data && (
                    <Comment
                        {...threadQ.data}
                        onIdClick={id => {
                            formMethods.setValue('replyText', formMethods.getValues('replyText') + ">>" + id + "\n");
                            formMethods.setFocus('replyText')
                        }}
                        onDelClick={isAdmin ? id => delThreadMut.mutate({ id }) : undefined} />
                )}

                {threadQ.data?.comments.length === 0 && <div className="text-center w-full">No replies yet</div>}

                {threadQ.data?.comments.map(x => (
                    <Comment
                        {...x}
                        key={x.id}
                        isReply
                        onIdClick={id => {
                            formMethods.setValue('replyText', formMethods.getValues('replyText') + ">>" + id + "\n");
                            formMethods.setFocus('replyText')
                        }}
                        onDelClick={isAdmin ? id => delCommentMut.mutate({ id }) : undefined}
                    />
                ))}

            </div>

        </div >
    )
})

export default ThreadComponent;