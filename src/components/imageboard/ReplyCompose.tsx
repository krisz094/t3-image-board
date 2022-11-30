import type { RefObject } from "react";
import { useCallback, useState } from "react";
import { postImage } from "../../utils/postImage";
import { prettyError } from "../../utils/prettyError";
import { trpc } from "../../utils/trpc";

interface Props {
    threadId: string;
    txt: string;
    setTxt: (txt: string) => void
    txtFieldRef?: RefObject<HTMLTextAreaElement>;
}

function ReplyCompose({ threadId, setTxt, txt, txtFieldRef }: Props) {
    const tCtx = trpc.useContext();
    const replyMut = trpc.threads.reply.useMutation();

    const [img, setImg] = useState<File | null>(null);
    const [ul, setUl] = useState(false);

    const submit = useCallback(async () => {
        try {
            setUl(true);
            const imgResp = img ? await postImage(img) : undefined;
            setUl(false);

            await replyMut.mutateAsync({
                threadId,
                text: txt.trim() || null,
                image: imgResp ? imgResp.public_id : null,
            });

            setTxt('');
            setImg(null);

            await tCtx.threads.getById.refetch({ id: threadId });
        }
        catch (err) {
            setUl(false);
            console.log('reply err')
        }
    }, [img, replyMut, tCtx.threads.getById, threadId, txt, setTxt]);

    return (
        <>
            <form onSubmit={e => { e.preventDefault(); submit(); }} className="flex flex-col gap-1.5 items-center px-2">
                <textarea ref={txtFieldRef} placeholder="Reply text" value={txt} onChange={e => setTxt(e.target.value)} className="outline-none p-1 resize-none rounded-sm shadow-md aspect-video w-full max-w-[400px]" />
                <input
                    type="file"
                    onChange={e => {
                        const f = e.target.files?.length ? e.target.files[0] || null : null;
                        setImg(f);
                    }}
                    accept="image/jpeg,image/png,image/webp"
                />
                <input disabled={replyMut.isLoading || ul} type="submit" value={replyMut.isLoading || ul ? "Submitting..." : "Add reply"} className="rounded-md px-2 py-1 shadow-md cursor-pointer bg-brownmain-50 disabled:cursor-wait" />
            </form>
            {replyMut.error?.message && <div className="font-bold text-center text-lg text-red-600">{prettyError(replyMut.error?.message)}</div>}
        </>
    )
}

export default ReplyCompose;