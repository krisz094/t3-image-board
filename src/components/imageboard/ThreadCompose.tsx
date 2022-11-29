import { useRouter } from "next/router";
import type { RefObject } from "react";
import { useCallback, useRef, useState } from "react";
import { postImage } from "../../utils/postImage";
import { prettyError } from "../../utils/prettyError";
import { trpc } from "../../utils/trpc";

interface ThreadComposeProps {
    boardName: string;
    txt: string;
    setTxt: (txt: string) => void;
    txtFieldRef?: RefObject<HTMLTextAreaElement>;
}

function ThreadCompose({ boardName, setTxt, txt, txtFieldRef }: ThreadComposeProps) {
    const router = useRouter();

    const createThreadMut = trpc.threads.create.useMutation();

    const [sub, setSub] = useState('');
    const [img, setImg] = useState<File | null>(null);
    const [ul, setUl] = useState(false);

    const fileRef = useRef<HTMLInputElement>(null);

    const submit = useCallback(async () => {
        if (!img) {
            return;
        }

        try {
            setUl(true);
            const imgResp = await postImage(img);
            setUl(false);

            const th = await createThreadMut.mutateAsync({
                boardName,
                text: txt,
                image: imgResp.public_id,
                subject: sub.trim() || null
            });

            setTxt('');
            setImg(null);
            setSub('');
            if (fileRef.current) {
                fileRef.current.value = '';
            }

            router.push(`/${boardName}/thread/${th.id}`)
        }
        catch (err) {
            setUl(false);
            console.log('new thread err');
        }

    }, [boardName, createThreadMut, img, router, setTxt, sub, txt]);

    return (
        <>
            <form onSubmit={e => { e.preventDefault(); submit(); }} className="flex flex-col gap-1.5 items-center px-2">
                <input type="text" placeholder="Subject" value={sub} onChange={e => setSub(e.target.value)} className="outline-none p-1 rounded-sm shadow-md w-full max-w-[400px]" />
                <textarea ref={txtFieldRef} placeholder="Thread text" value={txt} onChange={e => setTxt(e.target.value)} className="outline-none p-1 resize-none rounded-sm shadow-md aspect-video w-full max-w-[400px]" />
                <input
                    type="file"
                    onChange={e => {
                        const f = e.target.files?.length ? e.target.files[0] || null : null;
                        setImg(f);
                    }}
                    accept="image/jpeg,image/png,image/webp"
                />

                <input type="submit" disabled={createThreadMut.isLoading} value={createThreadMut.isLoading ? "Submitting..." : "Create thread"} className="rounded-md px-2 py-1 shadow-md cursor-pointer bg-blue-50" />
            </form>

            {createThreadMut.error?.message && <div className="font-bold text-center text-lg text-red-600">{prettyError(createThreadMut.error?.message)}</div>}
        </>
    )
}

export default ThreadCompose;