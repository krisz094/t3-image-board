import Image from "next/image";
import type { ChangeEventHandler } from "react";
import { useCallback, useRef, useState } from "react";
import { trpc } from "../../utils/trpc";

interface Props {
    threadId: string;
}

function ReplyCompose({ threadId }: Props) {
    const tCtx = trpc.useContext();
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
            threadId,
            text: txt,
            image: img,
        })

        setTxt('');
        setImg('');
        if (fileRef.current) {
            fileRef.current.value = '';
        }

        await tCtx.threads.getById.refetch({ id: threadId });
    }, [replyMut, tCtx.threads.getById, threadId, txt]);

    return (
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
    )
}

export default ReplyCompose;