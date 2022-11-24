import Link from "next/link";

export interface ReplyProps {
    id: string;
    timestamp: Date;
    text: string;
    image?: string | null;
    boardName?: string;
    isReply?: boolean;
}

export function Comment({ id, image, text, timestamp, boardName, isReply = false }: ReplyProps) {
    return (
        <div className="flex gap-1">
            {isReply && <div>{">>"}</div>}
            <div className="p-2 bg-blue-400 min-w-[500px] rounded-sm flex gap-2 shadow-md">
                <div className="flex-0 w-[200px] h-[200px] rounded-md bg-black/20"></div>
                <div className="flex-1">
                    <div className="flex justify-between gap-2">
                        <div>{timestamp.toLocaleDateString()} {timestamp.toLocaleTimeString()}</div>
                        <div>{id}</div>
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