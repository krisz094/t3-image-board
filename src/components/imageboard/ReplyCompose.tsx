import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { postImage } from "../../utils/postImage";
import { prettyError } from "../../utils/prettyError";
import { trpc } from "../../utils/trpc";
import { ProgressBar } from "../ui/ProgressBar";
import type { ReplyFormProps } from "./ThreadComponent";

interface Props {
    threadId: string;
}

function ReplyCompose({ threadId }: Props) {
    const tCtx = trpc.useContext();
    const replyMut = trpc.threads.reply.useMutation();

    const { reset: resetForm, register, handleSubmit, formState: { errors }, setError } = useFormContext<ReplyFormProps>();
    const [ul, setUl] = useState(false);
    const [ulPrg, setUlPrg] = useState(0);

    const submit = useCallback(async () => {
        try {
            await handleSubmit(async vals => {
                if (!vals.replyText.trim() && !vals.media[0]) {
                    return setError('replyText', { message: 'Reply needs to either have text or image' })
                }

                vals.media[0] && setUl(true);
                const imgResp = vals.media[0] ? await postImage(vals.media[0], ({ progress }) => { setUlPrg(progress) }) : undefined;
                vals.media[0] && setUl(false);

                await replyMut.mutateAsync({
                    threadId,
                    text: vals.replyText.trim(),
                    image: imgResp ? imgResp.data.public_id : null,
                });

                resetForm({
                    media: [],
                    replyText: ''
                });

                await tCtx.threads.getById.refetch({ id: threadId });
            })();
        }
        catch (err) {
            setUl(false);
            console.log('reply err')
        }
    }, [handleSubmit, replyMut, resetForm, setError, tCtx.threads.getById, threadId]);

    return (
        <div className="flex items-center justify-center flex-col">
            <form onSubmit={e => { e.preventDefault(); submit(); }} className="w-full max-w-[500px] gap-1.5 px-2 grid grid-cols-12 bg-brownmain-700 text-white p-2 rounded-md">

                <label className="col-span-12 sm:col-span-3 text-brownmain-200 font-bold" htmlFor="replyText">Reply text</label>
                <textarea {...register('replyText', {
                    disabled: replyMut.isLoading || ul,
                    maxLength: { value: 1000, message: 'Maximum length is 1000' }
                })} className="col-span-12 sm:col-span-9 outline-none p-1 resize-none rounded-sm shadow-md aspect-video bg-brownmain-50 text-black" />
                {errors.replyText?.message && <span className="col-start-4 col-span-12 sm:col-span-9 text-red-500">{errors.replyText?.message}</span>}

                <label className="col-span-12 sm:col-span-3 text-brownmain-200 font-bold" htmlFor="media">Image</label>
                <input
                    {...register('media', {
                        disabled: replyMut.isLoading || ul,
                        validate: files => {
                            if (files.length > 1) {
                                return 'Only one image can be selected';
                            }
                            const f = files[0];
                            if (!f) { return true; }
                            else if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
                                return 'File needs to be JPG, PNG or WEBP';
                            }
                            else {
                                return true;
                            }
                        }
                    })}
                    className="col-span-12 sm:col-span-9"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                />
                {ul && <div className="col-span-12 sm:col-span-full">
                    <ProgressBar progress={Math.round(ulPrg * 100)} />
                </div>}
                {errors.media?.message && <span className="col-start-4 col-span-12 sm:col-span-9 text-red-500">{errors.media?.message}</span>}

                <input disabled={replyMut.isLoading || ul} type="submit" value={replyMut.isLoading || ul ? "Submitting..." : "Add reply"} className="col-span-12 sm:col-span-12 rounded-md px-2 py-1 shadow-md cursor-pointer bg-brownmain-50 disabled:cursor-wait text-brownmain-800 font-bold" />
            </form>
            {replyMut.error?.message && <div className="font-bold text-center text-lg text-red-600">{prettyError(replyMut.error?.message)}</div>}
        </div>
    )
}

export default ReplyCompose;