import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ChangeEventHandler } from "react";
import { memo, useCallback, useRef, useState } from "react";
import { trpc } from "../../utils/trpc";
import { BoardsHead } from "./BoardsHead";
import { Comment } from "./Comment";
import { HorizontalLine } from "./HorizontalLine";

const BoardComponent = memo(function BoardComp({ pageNum, boardName }: { pageNum: number, boardName: string }) {
    const router = useRouter();

    const boardQ = trpc.boards.getByName.useQuery({ boardName });
    const pageNumQ = trpc.boards.getPageNum.useQuery({ boardName });
    const threadsQ = trpc.boards.getPage.useQuery({ boardName, pageNum });
    const createThreadMut = trpc.threads.create.useMutation();

    const [txt, setTxt] = useState('');
    const [sub, setSub] = useState('');
    const [img, setImg] = useState('');

    const fileRef = useRef<HTMLInputElement>(null);

    const submit = useCallback(async () => {
        const th = await createThreadMut.mutateAsync({
            boardName,
            text: txt,
            image: img.trim() || null
        });

        setTxt('');

        router.push(`/${boardName}/thread/${th.id}`)

    }, [boardName, createThreadMut, img, router, txt]);

    const changeFile: ChangeEventHandler<HTMLInputElement> = useCallback(e => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file && ['image/jpeg', 'image/png'].includes(file.type)) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => setImg(reader.result as string);
            reader.onerror = () => setImg('');
        }
        else {
            setImg('');
        }
    }, []);

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

            <form onSubmit={e => { e.preventDefault(); submit(); }} className="flex flex-col gap-1.5 items-center px-2">
                {img && (
                    <div className="w-[200px] h-[200px] rounded-md overflow-hidden relative">
                        <Image src={img} layout="fill" className="object-contain" alt="Uploaded image" />
                        <div
                            className="text-xs bg-black/50 absolute bottom-1 right-1 text-white rounded-md px-2 py-1 cursor-pointer"
                            onClick={() => {
                                setImg('');
                                if (fileRef.current) {
                                    fileRef.current.value = '';
                                }
                            }}>
                            Clear
                        </div>
                    </div>
                )}

                <input type="text" placeholder="Subject" value={sub} onChange={e => setSub(e.target.value)} className="outline-none p-1 rounded-sm shadow-md w-full max-w-[400px]" />
                <textarea placeholder="Thread text" value={txt} onChange={e => setTxt(e.target.value)} className="outline-none p-1 resize-none rounded-sm shadow-md aspect-video w-full max-w-[400px]" />
                <input ref={fileRef} type="file" onChange={changeFile} accept="image/jpeg,image/png" />
                <input type="submit" value={"Create thread"} className="rounded-md px-2 py-1 shadow-md cursor-pointer bg-blue-50" />
            </form>

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