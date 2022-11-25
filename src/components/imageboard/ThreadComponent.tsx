import Link from "next/link";
import { memo } from "react";
import { trpc } from "../../utils/trpc";
import { BoardsHead } from "./BoardsHead";
import { Comment } from "./Comment";
import { HorizontalLine } from "./HorizontalLine";
import ReplyCompose from "./ReplyCompose";

const ThreadComponent = memo(function ThreadComp({ threadId, boardName }: { threadId: string, boardName: string }) {
    const boardQ = trpc.boards.getByName.useQuery({ boardName });
    const threadQ = trpc.threads.getById.useQuery({ id: threadId });

    if (boardQ.isLoading) {
        return <div>Loading...</div>
    }
    else if (boardQ.isError || !boardQ.data) {
        return <div>Error</div>
    }

    return (
        <div className="min-h-[100vh] bg-gradient-to-b from-blue-100 to-blue-200 p-2 space-y-2">

            <BoardsHead />

            <h1 className="font-bold text-3xl text-center w-full">
                <span className="font-bold">/{boardQ.data?.name}/</span>
                <span> - </span>
                <span>{boardQ.data?.description}</span>
            </h1>

            <ReplyCompose threadId={threadId} />

            <HorizontalLine />

            <div className="flex gap-2">
                <div>
                    <span /* className="mr-1" */>[</span>
                    <Link href={`/${boardName}`} ><span className="cursor-pointer hover:text-red-500">Home</span></Link>
                    <span /* className="ml-1" */>]</span>
                </div>

                <div>
                    <span /* className="mr-1" */>[</span>
                    <Link href={`/${boardName}/catalog`} ><span className="cursor-pointer hover:text-red-500">Catalog</span></Link>
                    <span /* className="ml-1" */>]</span>
                </div>

                <div>
                    <span /* className="mr-1" */>[</span>
                    <Link href={`/${boardName}/archive`} ><span className="cursor-pointer hover:text-red-500">Archive</span></Link>
                    <span /* className="ml-1" */>]</span>
                </div>
            </div>

            <HorizontalLine />

            <div className="flex flex-col items-start gap-2 ">

                {threadQ.data && <Comment {...threadQ.data} />}

                {threadQ.data?.comments.length === 0 && <div className="text-center w-full">No replies yet</div>}

                {threadQ.data?.comments.map(x => (
                    <Comment {...x} key={x.id} isReply />
                ))}

            </div>


        </div >
    )
})

export default ThreadComponent;


