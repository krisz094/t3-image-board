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

  const {
    reset: resetForm,
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useFormContext<ReplyFormProps>();
  const [ul, setUl] = useState(false);
  const [ulPrg, setUlPrg] = useState(0);

  const submit = useCallback(async () => {
    try {
      await handleSubmit(async (vals) => {
        if (!vals.replyText.trim() && !vals.media[0]) {
          return setError("replyText", {
            message: "Reply needs to either have text or image",
          });
        }

        vals.media[0] && setUl(true);
        const imgResp = vals.media[0]
          ? await postImage(vals.media[0], ({ progress }) => {
              setUlPrg(progress);
            })
          : undefined;
        vals.media[0] && setUl(false);

        const resp = await replyMut.mutateAsync({
          threadId,
          text: vals.replyText.trim(),
          image: imgResp ? imgResp.data.public_id : null,
        });

        resetForm({
          media: [],
          replyText: "",
        });

        await tCtx.threads.getById.refetch({
          id: threadId,
          boardName: resp.thread.board.name,
        });
      })();
    } catch (err) {
      setUl(false);
      console.log("reply err");
    }
  }, [
    handleSubmit,
    replyMut,
    resetForm,
    setError,
    tCtx.threads.getById,
    threadId,
  ]);

  return (
    <div className="flex flex-col items-center justify-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="grid w-full max-w-[500px] grid-cols-12 gap-1.5 rounded-md bg-brownmain-700 p-2 px-2 text-white"
      >
        <label
          className="col-span-12 font-bold text-brownmain-200 sm:col-span-3"
          htmlFor="replyText"
        >
          Reply text
        </label>
        <textarea
          {...register("replyText", {
            disabled: replyMut.isLoading || ul,
            maxLength: { value: 1000, message: "Maximum length is 1000" },
          })}
          className="col-span-12 aspect-video resize-none rounded-sm bg-brownmain-50 p-1 text-black shadow-md outline-none sm:col-span-9"
        />
        {errors.replyText?.message && (
          <span className="col-span-12 text-red-500 sm:col-span-9 sm:col-start-4">
            {errors.replyText?.message}
          </span>
        )}

        <label
          className="col-span-12 font-bold text-brownmain-200 sm:col-span-3"
          htmlFor="media"
        >
          Image
        </label>
        <input
          {...register("media", {
            disabled: replyMut.isLoading || ul,
            validate: (files) => {
              if (files.length > 1) {
                return "Only one image can be selected";
              }
              const f = files[0];
              if (!f) {
                return true;
              } else if (
                !["image/jpeg", "image/png", "image/webp"].includes(f.type)
              ) {
                return "File needs to be JPG, PNG or WEBP";
              } else {
                return true;
              }
            },
          })}
          className="col-span-12 sm:col-span-9"
          type="file"
          accept="image/jpeg,image/png,image/webp"
        />
        {ul && (
          <div className="col-span-12 sm:col-span-full">
            <ProgressBar progress={Math.round(ulPrg * 100)} />
          </div>
        )}
        {errors.media?.message && (
          <span className="col-span-12 text-red-500 sm:col-span-9 sm:col-start-4">
            {errors.media?.message}
          </span>
        )}

        <input
          disabled={replyMut.isLoading || ul}
          type="submit"
          value={replyMut.isLoading || ul ? "Submitting..." : "Add reply"}
          className="col-span-12 cursor-pointer rounded-md bg-brownmain-50 px-2 py-1 font-bold text-brownmain-800 shadow-md disabled:cursor-wait sm:col-span-12"
        />
      </form>
      {replyMut.error?.message && (
        <div className="text-center text-lg font-bold text-red-600">
          {prettyError(replyMut.error?.message)}
        </div>
      )}
    </div>
  );
}

export default ReplyCompose;
