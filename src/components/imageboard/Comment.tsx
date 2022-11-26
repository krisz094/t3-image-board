import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import type { ReactNodeArray } from "react";
import { useEffect, useMemo, useState } from "react";
import reactStringReplace from "react-string-replace";
import { PrettyDateComment as PrettyDateTimeComment } from "../../utils/prettyDate";

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
}

interface Author {
  id?: string | null;
  name?: string | null;
}

export function Comment({
  id,
  image,
  text,
  timestamp,
  boardName,
  isReply = false,
  author,
  subject,
  onIdClick
}: ReplyProps) {
  const [imgDim, setImgDim] = useState({ w: 200, h: 200 });
  const [imgExt, setImgExt] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formattedText = useMemo(() => {
    if (!text) {
      return text;
    }

    let formatted: string | ReactNodeArray = text;

    /* replace 3+ line breaks with 2 */
    formatted = reactStringReplace(formatted, /(\n{3,})/g, () => {
      return '\n\n';
    });

    /* replace line breaks with br tags */
    formatted = reactStringReplace(formatted, /(\n)/g, (match, i) => {
      return <br key={match + i} />
    });

    /* add links to replies */
    formatted = reactStringReplace(formatted, /(>>.*\s?)/g, (match, i) => {
      return (
        <Link key={match + i} href={`#${match.replace('>>', '')}`}>
          <span key={match + i} className="text-red-700 hover:underline cursor-pointer">
            {match}
          </span>
        </Link>)
    });

    /* replace color quotes */
    formatted = reactStringReplace(formatted, /(>.*)/g, (match, i) => {
      return <span key={match + i} className="text-green-600">{match}</span>
    });

    /* add spoilers */
    formatted = reactStringReplace(formatted, /(\[spoiler\].*\[\/spoiler\])/g, (match, i) => {
      const txt = match.replace('[spoiler]', '').replace('[/spoiler]', '');
      return <span key={match + i} className="bg-black text-black hover:text-white transition-all">{txt}</span>
    });

    return formatted;
  }, [text]);

  return (
    <div className="flex gap-1" id={id}>
      {isReply && <div className="text-xs text-blue-800">{">>"}</div>}
      <div
        className={clsx("flex flex-wrap items-start gap-2 p-2", {
          "rounded-sm bg-blue-300/80 shadow-md": isReply,
          "flex-col": imgExt,
        })}
      >
        {image && (
          <Image
            src={image}
            alt="Post image"
            width={imgExt ? imgDim.w : Math.min(200, imgDim.w)}
            height={imgExt ? imgDim.h : Math.min(200, imgDim.h)}
            className="cursor-pointer object-contain"
            onClick={(e) => {
              if (e.button == 0) {
                e.preventDefault();
                setImgExt((v) => !v);
              }
            }}
            onLoad={(e) => {
              const tar = e.target as HTMLImageElement;
              setImgDim({ w: tar.naturalWidth, h: tar.naturalHeight });
            }}
          />
        )}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-1.5 text-sm">
            {subject && (
              <div className="font-bold text-blue-800">{subject}</div>
            )}
            {author ? (
              <div className="font-bold text-purple-800">{author.name}</div>
            ) : (
              <div className="font-bold text-green-700">Anonymous</div>
            )}
            {isMounted && <div>{PrettyDateTimeComment(timestamp)}</div>}
            <div className="text-red-700 cursor-pointer hover:underline" onClick={() => onIdClick && onIdClick(id)}>{id}</div>
            {boardName && (
              <Link href={`/${boardName}/thread/${id}`}>
                <div className="group">
                  [
                  <span className="text-blue-900 group-hover:underline">
                    Reply
                  </span>
                  ]
                </div>
              </Link>
            )}
          </div>
          <div>
            {formattedText}
          </div>
        </div>
      </div>
    </div>
  );
}
