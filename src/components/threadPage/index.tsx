import { memo, useCallback, useState } from "react";
import { trpc } from "../../utils/trpc";
import { BoardsHead } from "../boardPage";
import { Comment } from "../reply";

const ThreadComp = memo(function ThreadComp({ threadId, boardName }: { threadId: string, boardName: string }) {
    const boardQ = trpc.boards.getByName.useQuery({ boardName });
    const threadQ = trpc.threads.getById.useQuery({ id: threadId });
    const replyMut = trpc.threads.reply.useMutation();

    const [txt, setTxt] = useState('');

    const submit = useCallback(async () => {
        await replyMut.mutateAsync({
            image: null,
            text: txt,
            threadId
        })

        setTxt('');

        await threadQ.refetch();
    }, [replyMut, threadId, threadQ, txt]);

    if (boardQ.isLoading) {
        return <div>Loading...</div>
    }
    else if (boardQ.isError || !boardQ.data) {
        return <div>Error</div>
    }

    return (
        <div className="min-w-[100vw] min-h-[100vh] bg-gradient-to-b from-blue-100 to-blue-200 py-4 px-2 space-y-4">

            <BoardsHead />

            <h1 className="font-bold text-3xl text-center w-full">
                <span className="font-bold">/{boardQ.data?.name}/</span>
                <span> - </span>
                <span>{boardQ.data?.description}</span>
            </h1>

            <form onSubmit={e => { e.preventDefault(); submit(); }} className="flex flex-col gap-1 items-center w-full">
                <textarea value={txt} onChange={e => setTxt(e.target.value)} cols={60} rows={8} className="resize-none rounded-sm shadow-md" />
                <input type="submit" value={"Add reply"} className="rounded-md px-2 py-1 shadow-md cursor-pointer bg-blue-50" />
            </form>

            <hr className="border-gray-500" />

            <div className="flex flex-col items-start gap-2 ">

                {threadQ.data && <Comment {...threadQ.data} />}

                {threadQ.data?.comments.length === 0 && <div className="text-center w-full">No replies yet</div>}

                {threadQ.data?.comments.map(x => (
                    <Comment {...x} key={x.id} isReply />
                ))}

            </div>


        </div>
    )
})

export default ThreadComp;