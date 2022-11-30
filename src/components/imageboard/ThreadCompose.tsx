import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { postImage } from "../../utils/postImage";
import { prettyError } from "../../utils/prettyError";
import { trpc } from "../../utils/trpc";
import { ProgressBar } from "../ui/ProgressBar";
import type { ThreadFormProps } from "./BoardComponent";

interface ThreadComposeProps {
    boardName: string;
}

function ThreadCompose({ boardName, }: ThreadComposeProps) {
    const router = useRouter();

    const createThreadMut = trpc.threads.create.useMutation();

    const { register, handleSubmit, formState: { errors } } = useFormContext<ThreadFormProps>();
    const [ul, setUl] = useState(false);
    const [ulPrg, setUlPrg] = useState(0);

    const submit = useCallback(async () => {
        try {
            await handleSubmit(async vals => {

                setUl(true);
                const imgResp = await postImage(vals.media[0] as File, ({ progress }) => { setUlPrg(progress) });
                setUl(false);

                const th = await createThreadMut.mutateAsync({
                    boardName,
                    subject: vals.subject.trim(),
                    text: vals.replyText.trim(),
                    image: imgResp.data.public_id,
                });

                router.push(`/${boardName}/thread/${th.id}`)

            })();
        }
        catch (err) {
            setUl(false);
            console.log('reply err')
        }
    }, [boardName, createThreadMut, handleSubmit, router]);

    return (
        <div className="flex items-center justify-center flex-col">
            <form onSubmit={e => { e.preventDefault(); submit(); }} className="w-full max-w-[500px] gap-1.5 px-2 grid grid-cols-12 bg-brownmain-700 text-white p-2 rounded-md">

                <label className="col-span-12 sm:col-span-3 text-brownmain-200 font-bold" htmlFor="subject">Subject</label>
                <input {...register('subject', {
                    disabled: createThreadMut.isLoading || ul,
                    maxLength: { value: 1000, message: 'Maximum length is 1000' }
                })} className="col-span-12 sm:col-span-9 outline-none p-1 resize-none rounded-sm shadow-md  bg-brownmain-50 text-black" />
                {errors.subject?.message && <span className="sm:col-start-4 col-span-12 sm:col-span-9 text-red-500">{errors.replyText?.message}</span>}

                <label className="col-span-12 sm:col-span-3 text-brownmain-200 font-bold" htmlFor="replyText">Thread text</label>
                <textarea
                    {...register('replyText', {
                        disabled: createThreadMut.isLoading || ul,
                        maxLength: { value: 1000, message: 'Maximum length is 1000' },
                        required: 'Thread text is required'
                    })}
                    className="col-span-12 sm:col-span-9 outline-none p-1 resize-none rounded-sm shadow-md aspect-video bg-brownmain-50 text-black"
                />
                {errors.replyText?.message && <span className="sm:col-start-4 col-span-12 sm:col-span-9 text-red-500">{errors.replyText?.message}</span>}

                <label className="col-span-12 sm:col-span-3 text-brownmain-200 font-bold" htmlFor="media">Image</label>
                <input
                    {...register('media', {
                        disabled: createThreadMut.isLoading || ul,
                        required: 'An image is required',
                        validate: files => {
                            const f = files[0];

                            if (files.length > 1) {
                                return 'Only one image can be selected';
                            }
                            else if (!f) {
                                return 'An image is required';
                            }
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
                {errors.media?.message && <span className="sm:col-start-4 col-span-12 sm:col-span-9 text-red-500">{errors.media?.message}</span>}

                <input disabled={createThreadMut.isLoading || ul} type="submit" value={createThreadMut.isLoading || ul ? "Submitting..." : "Create thread"} className="col-span-12 sm:col-span-12 rounded-md px-2 py-1 shadow-md cursor-pointer bg-brownmain-50 disabled:cursor-wait text-brownmain-800 font-bold" />
            </form>
            {createThreadMut.error?.message && <div className="font-bold text-center text-lg text-red-600">{prettyError(createThreadMut.error?.message)}</div>}
        </div>
    )
}

export default ThreadCompose;