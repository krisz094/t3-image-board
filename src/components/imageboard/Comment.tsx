import { AdvancedImage, placeholder } from '@cloudinary/react';
import { Resize } from '@cloudinary/url-gen/actions/resize';
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import type { ReactNodeArray } from "react";
import { useEffect, useMemo, useState } from "react";
import Spotify from 'react-spotify-embed';
import reactStringReplace from "react-string-replace";
import YouTube from "react-youtube";
import { myCld } from "../../utils/cloudinary";
import { PrettyDateComment as PrettyDateTimeComment } from "../../utils/prettyDate";
import styles from './Comment.module.css';
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
    return '\n\n';
  });

  /* replace line breaks with br tags */
  formatted = reactStringReplace(formatted, /(\n)/g, (match, i) => {
    return <br key={match + i + (iFake++)} />
  });

  /* add links to replies */
  formatted = reactStringReplace(formatted, /(>>.*\s?)/g, (match, i) => {
    return (
      <Link key={match + i + (iFake++)} href={`#${match.replace('>>', '')}`}>
        <span key={match + i + (iFake++)} className="text-red-700 hover:underline cursor-pointer">
          {match}
        </span>
      </Link>)
  });

  /* replace color quotes */
  formatted = reactStringReplace(formatted, /(>.*)/g, (match, i) => {
    return <span key={match + i + (iFake++)} className="text-green-600">{match}</span>
  });

  /* add spoilers */
  formatted = reactStringReplace(formatted, /(\[spoiler\].*\[\/spoiler\])/g, (match, i) => {
    const txt = match.replace('[spoiler]', '').replace('[/spoiler]', '');
    return <span key={match + i + (iFake++)} className="bg-black text-black hover:text-white transition-all">{txt}</span>
  });


  /* add links */
  formatted = reactStringReplace(formatted, /((?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$]))/i, (match, i) => {

    const ytMatch = match.match(/(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w-_]+)/i)
    const spotiMatch = match.match(/(https?:\/\/open.spotify.com\/(track|user|artist|album|playlist)\/[a-zA-Z0-9]+(\/playlist\/[a-zA-Z0-9]+|)|spotify:(track|user|artist|album|playlist):[a-zA-Z0-9]+(:playlist:[a-zA-Z0-9]+|))/);

    if (ytMatch && ytMatch[1]) {
      const ytId = ytMatch[1];
      return <YouTube key={match + i + (iFake++)} videoId={ytId} className={styles.ytvid} />;
    }
    else if (spotiMatch && spotiMatch[0]) {
      const link = spotiMatch[0];
      return <Spotify key={match + i + (iFake++)} link={link} />;
    }
    else {
      return <a className="text-blue-800 hover:underline" key={match + i + (iFake++)} href={match} target={"_blank"} rel="noreferrer">[link]</a>
    }
  })

  return formatted;
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
  onIdClick,
  onDelClick
}: ReplyProps) {
  /* const [imgDim, setImgDim] = useState({ w: 200, h: 200 }); */
  const [imgExt, setImgExt] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formattedText = useMemo(() => CommentTextToRichText(text), [text]);

  const cldImg = useMemo(() => {
    if (!image) {
      return undefined;
    }
    else {
      const img = myCld.image(image);

      if (!imgExt) {
        img.resize(Resize.fit(200, 200));
      }

      return img;
    }
  }, [image, imgExt]);

  return (
    <div className="flex gap-1" id={id}>
      {isReply && <div className="text-xs text-blue-800 hidden sm:block">{">>"}</div>}
      <div
        className={clsx("flex flex-wrap items-start gap-2 p-2 flex-1 sm:flex-initial", {
          "rounded-sm bg-blue-300/80 shadow-md": isReply,
          "flex-col": imgExt,
          "flex-col sm:flex-row": !imgExt
        })}
      >
        {cldImg && (
          <div
            className='cursor-pointer'
            onClick={(e) => {
              if (e.button == 0) {
                setImgExt((v) => !v);
              }
            }}
          >
            <AdvancedImage cldImg={cldImg} plugins={[placeholder({ mode: 'blur' })]} />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-1.5 text-sm">
            {subject && (
              <div className="font-bold text-blue-800">{subject}</div>
            )}
            {author?.image && <Image src={author.image} alt="" width={24} height={24} className="object-contain rounded-full" />}
            {author ? (
              <div className="font-bold text-purple-800 flex gap-0.5 ">{author.name}</div>
            ) : (
              <div className="font-bold text-green-700">Anonymous</div>
            )}
            {isMounted && <div>{PrettyDateTimeComment(timestamp)}</div>}
            <div className="text-blue-800 cursor-pointer hover:underline" onClick={() => onIdClick && onIdClick(id)}>No. {id}</div>
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
            {onDelClick && <div className="font-bold text-red-500 cursor-pointer hover:scale-110" onClick={() => onDelClick(id)}>X</div>}
          </div>
          <div>
            {formattedText}
          </div>
        </div>
      </div>
    </div>
  );
}
