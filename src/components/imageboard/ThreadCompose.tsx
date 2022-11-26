import Image from "next/image";
import { useRouter } from "next/router";
import type { ChangeEventHandler } from "react";
import { useCallback, useRef, useState } from "react";
import { trpc } from "../../utils/trpc";

interface ThreadComposeProps {
    boardName: string;
    txt: string;
    setTxt: (txt: string) => void
}

function ThreadCompose({ boardName, setTxt, txt }: ThreadComposeProps) {
    const router = useRouter();

    const createThreadMut = trpc.threads.create.useMutation();

    const [sub, setSub] = useState('');
    const [img, setImg] = useState('');

    const fileRef = useRef<HTMLInputElement>(null);

    const submit = useCallback(async () => {
        try {

            const th = await createThreadMut.mutateAsync({
                boardName,
                text: txt,
                image: img.trim(),
                subject: sub.trim() || null
            });

            setTxt('');
            setSub('');
            setImg('');
            if (fileRef.current) {
                fileRef.current.value = '';
            }

            router.push(`/${boardName}/thread/${th.id}`)
        }
        catch (err) {
            console.log('new thread err');
        }

    }, [boardName, createThreadMut, img, router, setTxt, sub, txt]);

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
    return (
        <>
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

                <input type="submit" disabled={createThreadMut.isLoading} value={createThreadMut.isLoading ? "Submitting..." : "Create thread"} className="rounded-md px-2 py-1 shadow-md cursor-pointer bg-blue-50" />
            </form>
            {createThreadMut.error?.message}
        </>
    )
}

export default ThreadCompose;