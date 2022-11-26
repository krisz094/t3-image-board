import Link from "next/link";
import { memo, useRef, useState } from "react";
import { appendIdToComment } from "../../utils/appendIdToComment";
import { trpc } from "../../utils/trpc";
import { BoardsHead } from "./BoardsHead";
import { Comment } from "./Comment";
import { HorizontalLine } from "./HorizontalLine";
import ReplyCompose from "./ReplyCompose";

const ThreadComponent = memo(function ThreadComp({ threadId, boardName }: { threadId: string, boardName: string }) {
    const boardQ = trpc.boards.getByName.useQuery({ boardName });
    const threadQ = trpc.threads.getById.useQuery({ id: threadId });

    const [txt, setTxt] = useState('');
    const fieldRef = useRef<HTMLTextAreaElement>(null);

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

            <ReplyCompose threadId={threadId} setTxt={setTxt} txt={txt} txtFieldRef={fieldRef} />

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

                {threadQ.data && <Comment {...threadQ.data} onIdClick={id => appendIdToComment(id, setTxt, fieldRef)} />}

                {threadQ.data?.comments.length === 0 && <div className="text-center w-full">No replies yet</div>}

                {threadQ.data?.comments.map(x => (
                    <Comment {...x} key={x.id} isReply onIdClick={id => appendIdToComment(id, setTxt, fieldRef)} />
                ))}

            </div>

        </div >
    )
})

export default ThreadComponent;


