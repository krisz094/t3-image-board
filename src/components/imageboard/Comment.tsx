import { AdvancedImage } from "@cloudinary/react";
import { Resize } from "@cloudinary/url-gen/actions/resize";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNodeArray } from "react";
import { memo, useEffect, useMemo, useState } from "react";
import ReactDOM from 'react-dom';
import { usePopperTooltip } from "react-popper-tooltip";
import "react-popper-tooltip/dist/styles.css";
import Spotify from "react-spotify-embed";
import reactStringReplace from "react-string-replace";
import YouTube from "react-youtube";
import { myCld } from "../../utils/cloudinary";
import { PrettyDateComment as PrettyDateTimeComment } from "../../utils/prettyDate";
import { trpc } from "../../utils/trpc";
import styles from "./Comment.module.css";

function useGetCommentIdProps(id: string) {
  const replyQ = trpc.threads.getThreadOrCommentById.useQuery({ id }, { refetchOnWindowFocus: false, staleTime: 60000 });

  const notExist = useMemo(
    () => replyQ.isFetched && !replyQ.data,
    [replyQ.data, replyQ.isFetched]
  );

  const boardName = useMemo(() => {
    return (
      replyQ.data?.comment?.thread.board.name ||
      replyQ.data?.thread?.board.name ||
      undefined
    );
  }, [
    replyQ.data?.comment?.thread.board.name,
    replyQ.data?.thread?.board.name,
  ]);

  const threadId = useMemo(() => {
    return (
      replyQ.data?.comment?.threadId || replyQ.data?.thread?.id || undefined
    );
  }, [replyQ.data?.comment?.threadId, replyQ.data?.thread?.id]);

  const commentId = useMemo(() => {
    return replyQ.data?.comment?.id || replyQ.data?.thread?.id || undefined;
  }, [replyQ.data?.comment?.id, replyQ.data?.thread?.id]);

  const full = useMemo(() => {
    return replyQ.data?.comment || replyQ.data?.thread || undefined;
  }, [replyQ.data?.comment, replyQ.data?.thread]);

  const isOP = useMemo(() => {
    return !!replyQ.data?.thread;
  }, [replyQ.data?.thread]);

  return {
    notExist,
    boardName,
    threadId,
    commentId,
    full,
    isOP
  };
}


interface QuoteReplyHighlightProps {
  id: string;
  small?: boolean;
}

function QuoteReplyHighlight({ id, small }: QuoteReplyHighlightProps) {

  const { boardName, commentId, full, isOP, notExist, threadId } = useGetCommentIdProps(id);

  const {
    setTriggerRef,
    visible,
    setTooltipRef,
    getTooltipProps,
  } = usePopperTooltip({ placement: "top", followCursor: true });

  return (
    <>
      <Link
        href={notExist ? "" : `/${boardName}/thread/${threadId}#${commentId}`}
      >
        <span
          ref={setTriggerRef}
          className={clsx({
            "mr-1": !small,
            "text-xs mr-0": small,
            "text-red-700 underline hover:text-red-600": !notExist && !small,
            "text-blue-600 ": !notExist && small,
            "underline cursor-pointer": !notExist,
            "text-gray-600 line-through cursor-not-allowed": notExist,
          })}
        >
          {">>"}
          {id}
          {isOP && " (OP)"}
        </span>
      </Link>

      {visible && (
        ReactDOM.createPortal((
          <div
            ref={setTooltipRef}
            {...getTooltipProps({
              className: "tooltip-container", style: {
                border: '1px solid black',
                borderRadius: 6,
                padding: 0,
                overflow: "hidden"
              }
            })}
          >

            {full && <Comment {...full} isReply isQuoteTT />}
            {notExist && (
              <div className="bg-brownmain-400 p-2 ">Post not found.</div>
            )}
          </div>
        ), document.body)
      )}
    </>
  );
}
interface Author {
  id?: string | null;
  name?: string | null;
  image?: string | null;
}

export function CommentTextToRichText(text: string | undefined | null) {
  if (!text) {
    return text;
  }

  let iFake = 0;

  let formatted: string | ReactNodeArray = text;

  /* replace 3+ line breaks with 2 */
  formatted = reactStringReplace(formatted, /(\n{3,})/g, () => {
    return "\n\n";
  });

  /* replace line breaks with br tags */
  formatted = reactStringReplace(formatted, /(\n)/g, (match, i) => {
    return <br key={match + i + iFake++} />;
  });

  /* add links to replies */
  formatted = reactStringReplace(formatted, /(>>[a-zA-Z0-9]*)/g, (match, i) => {
    const id = match.replace(">>", "").trim();

    return <QuoteReplyHighlight key={match + i + iFake++} id={id} />;
  });

  /* replace color quotes */
  formatted = reactStringReplace(formatted, /(^>.*)/g, (match, i) => {
    return (
      <span key={match + i + iFake++} className="mr-1 text-green-700">
        {match}
      </span>
    );
  });

  /* add spoilers */
  formatted = reactStringReplace(
    formatted,
    /(\[spoiler\].*\[\/spoiler\])/g,
    (match, i) => {
      const txt = match.replace("[spoiler]", "").replace("[/spoiler]", "");
      return (
        <span
          key={match + i + iFake++}
          className="bg-black text-black transition-all hover:text-white"
        >
          {txt}
        </span>
      );
    }
  );

  /* add links */
  formatted = reactStringReplace(
    formatted,
    /((?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$]))/i,
    (match, i) => {
      const ytMatch = match.match(
        /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w-_]+)/i
      );
      const spotiMatch = match.match(
        /(https?:\/\/open.spotify.com\/(track|user|artist|album|playlist)\/[a-zA-Z0-9]+(\/playlist\/[a-zA-Z0-9]+|)|spotify:(track|user|artist|album|playlist):[a-zA-Z0-9]+(:playlist:[a-zA-Z0-9]+|))/
      );

      if (ytMatch && ytMatch[1]) {
        const ytId = ytMatch[1];
        return (
          <YouTube
            key={match + i + iFake++}
            videoId={ytId}
            className={styles.ytvid}
          />
        );
      } else if (spotiMatch && spotiMatch[0]) {
        const link = spotiMatch[0];
        return <Spotify key={match + i + iFake++} link={link} />;
      } else {
        return (
          <a
            className="text-brownmain-800 hover:underline"
            key={match + i + iFake++}
            href={match}
            target={"_blank"}
            rel="noreferrer"
          >
            [link]
          </a>
        );
      }
    }
  );

  return formatted;
}

export interface ReplyProps {
  id: string;
  timestamp: Date;
  text?: string | null;
  subject?: string | null;
  image?: string | null;
  boardName?: string;
  isReply?: boolean;
  author?: Author | null;
  onIdClick?: (id: string) => void;
  onDelClick?: (id: string) => void;
  isQuoteTT?: boolean;
  replies?: string[];
}


export const Comment = memo(function Comment({
  id,
  image,
  text,
  timestamp,
  boardName,
  isReply = false,
  author,
  subject,
  onIdClick,
  onDelClick,
  isQuoteTT,
  replies,
}: ReplyProps) {
  /* const [imgDim, setImgDim] = useState({ w: 200, h: 200 }); */
  const router = useRouter();

  const [isCurrent, setIsCurrent] = useState(false)

  useEffect(() => {
    const hashId = router.asPath.split("#")[1];
    setIsCurrent(!!hashId && hashId == id);
  }, [id, router.asPath]);

  const [imgExt, setImgExt] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formattedText = useMemo(() => CommentTextToRichText(text), [text]);

  const cldImg = useMemo(() => {
    if (!image) {
      return undefined;
    } else {
      const img = myCld.image(image);

      if (!imgExt) {
        img.resize(Resize.fit(200, 200));
      }

      return img;
    }
  }, [image, imgExt]);

  return (
    <div className="flex gap-1" id={id}>
      {isReply && !isQuoteTT && (
        <div className="hidden text-xs text-brownmain-800 sm:block">{">>"}</div>
      )}
      <div
        className={clsx(
          "flex flex-1 flex-wrap items-start gap-2 rounded-sm p-2 sm:flex-initial",
          {
            "bg-brownmain-300 shadow-md": isReply,
            "bg-brownmain-400": isCurrent || isQuoteTT,
            "flex-col": imgExt,
            "flex-col sm:flex-row": !imgExt,
          }
        )}
      >
        {cldImg && (
          <div
            className={clsx("cursor-pointer", {
              "w-full sm:w-auto": imgExt,
              [styles.childImgFull || ""]: imgExt,
            })}
            onClick={(e) => {
              if (e.button == 0) {
                setImgExt((v) => !v);
              }
            }}
          >
            <AdvancedImage cldImg={cldImg} />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-1.5 text-sm">
            {subject && (
              <div className="font-bold text-blue-800">{subject}</div>
            )}
            {author?.image && (
              <Link href={`/user/${author.id}`}>
                <Image
                  src={author.image}
                  alt=""
                  width={24}
                  height={24}
                  className="rounded-full object-contain"
                />
              </Link>
            )}
            {author ? (
              <Link href={`/user/${author.id}`}>
                <div className="flex-1 gap-0.5 font-bold text-purple-800 ">
                  {author.name}
                </div>
              </Link>
            ) : (
              <div className="font-bold text-green-700">Anonymous</div>
            )}
            {isMounted && <div>{PrettyDateTimeComment(timestamp)}</div>}
            <div
              className="cursor-pointer text-brownmain-800 hover:underline"
              onClick={() => onIdClick && onIdClick(id)}
            >
              No. {id}
            </div>

            {boardName && (
              <Link href={`/${boardName}/thread/${id}`}>
                <div className="group">
                  [
                  <span className="text-brownmain-900 group-hover:underline">
                    Reply
                  </span>
                  ]
                </div>
              </Link>
            )}

            {onDelClick && (
              <div
                className="cursor-pointer font-bold text-red-500 hover:scale-110"
                onClick={() => onDelClick(id)}
              >
                X
              </div>
            )}


            {replies?.map(x => (
              <QuoteReplyHighlight key={x} small id={x} />
            ))}

          </div>
          <div style={{ wordBreak: "break-word" }}>{formattedText}</div>
        </div>
      </div>
    </div>
  );
});
