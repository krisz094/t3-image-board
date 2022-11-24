import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { memo, useCallback, useState } from "react";
import { trpc } from "../../utils/trpc";
import { Comment } from "../reply";

export function BoardsHead() {
    const boardsQ = trpc.boards.getAll.useQuery();

    return (
        <div className="w-full -mx-2 -mt-4  px-2 py-1 text-sm">
            <span className="mr-2 text-blue-400">[</span>
            {boardsQ.data?.map((x, idx, arr) => (
                <span key={x.id}>
                    <Link href={`/${x.name}`}>
                        <span className="cursor-pointer hover:text-red-500">
                            {x.name}
                        </span>
                    </Link>
                    {idx != arr.length - 1 && <span className="px-2 text-blue-400">/</span>}
                </span>
            ))
            }
            <span className="ml-2 text-blue-400">]</span>

        </div >
    )
}

const BoardComp = memo(function BoardComp({ pageNum, boardName }: { pageNum: number, boardName: string }) {
    const router = useRouter();

    const boardQ = trpc.boards.getByName.useQuery({ boardName });
    const pageNumQ = trpc.boards.getPageNum.useQuery({ boardName });
    const threadsQ = trpc.boards.getPage.useQuery({ boardName, pageNum });
    const createThreadMut = trpc.threads.create.useMutation();

    const [txt, setTxt] = useState('');

    const submit = useCallback(async () => {
        const th = await createThreadMut.mutateAsync({
            boardName,
            text: txt,
            image: null
        });

        setTxt('');

        router.push(`/${boardName}/thread/${th.id}`)

    }, [boardName, createThreadMut, router, txt]);

    if (boardQ.isLoading) {
        return <div className="min-w-[100vw] min-h-[100vh] bg-gradient-to-b from-blue-100 to-blue-200 py-4 px-2 space-y-4">Loading...</div>
    }
    else if (boardQ.isError || !boardQ.data) {
        return <div className="min-w-[100vw] min-h-[100vh] bg-gradient-to-b from-blue-100 to-blue-200 py-4 px-2 space-y-4">Error</div>
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
                <input type="submit" value={"Create thread"} className="rounded-md px-2 py-1 shadow-md cursor-pointer bg-blue-50" />
            </form>

            <hr className="border-gray-500" />

            <div className="flex flex-col items-start gap-2 ">

                {threadsQ.data?.length === 0 && <div className="text-center w-full">No threads yet</div>}

                {threadsQ.data?.map(x => (
                    <div key={x.id} className="flex flex-col gap-2 flex-1 w-full">
                        <Comment {...x} boardName={boardName} key={x.id} />
                        {x.comments.slice().reverse().map(y => (
                            <Comment key={y.id} isReply {...y} />
                        ))}
                        <hr className="border-gray-500" />
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

export default BoardComp;