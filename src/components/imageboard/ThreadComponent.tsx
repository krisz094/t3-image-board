import Image from "next/image";
import Link from "next/link";
import type { ChangeEventHandler } from "react";
import { memo, useCallback, useRef, useState } from "react";
import { trpc } from "../../utils/trpc";
import { BoardsHead } from "./BoardsHead";
import { Comment } from "./Comment";
import { HorizontalLine } from "./HorizontalLine";

const ThreadComponent = memo(function ThreadComp({ threadId, boardName }: { threadId: string, boardName: string }) {
    const boardQ = trpc.boards.getByName.useQuery({ boardName });
    const threadQ = trpc.threads.getById.useQuery({ id: threadId });
    const replyMut = trpc.threads.reply.useMutation();

    const [txt, setTxt] = useState('');
    const [img, setImg] = useState('');

    const fileRef = useRef<HTMLInputElement>(null);

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
        <div className="min-h-[100vh] bg-gradient-to-b from-blue-100 to-blue-200 p-2 space-y-2">

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

                <textarea placeholder="Thread text" value={txt} onChange={e => setTxt(e.target.value)} className="outline-none p-1 resize-none rounded-sm shadow-md aspect-video w-full max-w-[400px]" />
                <input ref={fileRef} type="file" onChange={changeFile} accept="image/jpeg,image/png" />
                <input type="submit" value={"Add reply"} className="rounded-md px-2 py-1 shadow-md cursor-pointer bg-blue-50" />
            </form>

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


