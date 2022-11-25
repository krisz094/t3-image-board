import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export interface ReplyProps {
    id: string;
    timestamp: Date;
    text?: string | null;
    subject?: string | null;
    image?: string | null;
    boardName?: string;
    isReply?: boolean;
    author?: Author | null;
}

interface Author {
    id?: string | null;
    name?: string | null;
}

export function Comment({ id, image, text, timestamp, boardName, isReply = false, author, subject }: ReplyProps) {

    const [imgDim, setImgDim] = useState({ w: 200, h: 200 });
    const [imgExt, setImgExt] = useState(false);

    return (
        <div className="flex gap-1">
            {isReply && <div>{">>"}</div>}
            <div className={clsx("p-2 flex gap-2 flex-wrap", {
                'bg-blue-300/80 rounded-sm shadow-md': isReply,
                'flex-col': imgExt
            })}>
                {image && (
                    <Image
                        src={image}
                        alt="Post image"
                        width={imgExt ? imgDim.w : Math.min(200, imgDim.w)}
                        height={imgExt ? imgDim.h : Math.min(200, imgDim.h)}
                        className="object-contain cursor-pointer"
                        onClick={e => {
                            if (e.button == 0) {
                                e.preventDefault();
                                setImgExt(v => !v);
                            }
                        }}
                        onLoad={e => {
                            const tar = e.target as HTMLImageElement;
                            setImgDim({ w: tar.naturalWidth, h: tar.naturalHeight });
                        }}
                    />
                )}
                <div className="flex-1 flex flex-col gap-2">
                    <div className="flex justify-between gap-1.5 text-sm flex-wrap">
                        {subject && <div className="text-blue-800 font-bold">{subject}</div>}
                        {author ? <div className="text-purple-800 font-bold">{author.name}</div> : <div className="text-green-700 font-bold">Anonymous</div>}
                        <div>{timestamp.toLocaleDateString()} {timestamp.toLocaleTimeString()}</div>
                        <div className="text-red-700">#{id}</div>
                        {boardName && <Link href={`/${boardName}/thread/${id}`}>
                            <div className="group">[<span className="text-blue-900 group-hover:underline">Reply</span>]</div>
                        </Link>}
                    </div>
                    <div>{text}</div>
                </div>
            </div>
        </div>
    )
}