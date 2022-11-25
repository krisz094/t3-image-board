import clsx from "clsx";
import Link from "next/link";
import { memo } from "react";
import { trpc } from "../../utils/trpc";
import { BoardsHead } from "./BoardsHead";
import { Comment } from "./Comment";
import { HorizontalLine } from "./HorizontalLine";
import ThreadCompose from "./ThreadCompose";

const BoardComponent = memo(function BoardComp({ pageNum, boardName }: { pageNum: number, boardName: string }) {

    const boardQ = trpc.boards.getByName.useQuery({ boardName });
    const pageNumQ = trpc.boards.getPageNum.useQuery({ boardName });
    const threadsQ = trpc.boards.getPage.useQuery({ boardName, pageNum });


    if (boardQ.isLoading) {
        return <div className=" p-2 space-y-2">Loading...</div>
    }
    else if (boardQ.isError || !boardQ.data) {
        return <div className=" p-2 space-y-2">Error</div>
    }

    return (
        <div className="p-2 space-y-2 w-full">

            <BoardsHead />

            <h1 className="font-bold text-3xl text-center w-full">
                <span className="font-bold">/{boardQ.data?.name}/</span>
                <span> - </span>
                <span>{boardQ.data?.description}</span>
            </h1>

            <ThreadCompose boardName={boardName} />

            <HorizontalLine />

            <div className="flex gap-2">
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

                {threadsQ.data?.length === 0 && <div className="text-center w-full">No threads yet</div>}

                {threadsQ.data?.map(x => (
                    <div key={x.id} className="flex flex-col gap-2 flex-1 w-full">
                        <Comment {...x} boardName={boardName} key={x.id} />
                        {x.comments.slice().reverse().map(y => (
                            <Comment key={y.id} isReply {...y} />
                        ))}
                        <HorizontalLine />
                    </div>
                ))}

            </div>

            {!!threadsQ.data?.length && <div className="p-2 bg-blue-300 rounded-md inline-block space-x-1 shadow-md">
                {Array(pageNumQ.data || 1).fill('').map((x, idx) => idx + 1).map(page => (
                    <Link key={page} href={`/${boardName}/${page}`}>
                        <span className={clsx({ 'cursor-pointer': page != pageNum })} key={page}>[<span key={page} className={clsx({ 'font-bold': page == pageNum, 'hover:font-bold': page != pageNum })}>{page}</span>]</span>
                    </Link>
                ))}
            </div>}

        </div>
    )
})

export default BoardComponent;