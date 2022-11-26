import { useState } from "react";
import { trpc } from "../../utils/trpc";
import { BoardsHead } from "./BoardsHead";
import { HorizontalLine } from "./HorizontalLine";
import ThreadCompose from "./ThreadCompose";

interface ArchiveComponentProps {
    boardName: string;
}

function ArchiveComponent({ boardName }: ArchiveComponentProps) {
    const boardQ = trpc.boards.getByName.useQuery({ boardName });
    const archiveQ = trpc.boards.getArchiveThreads.useQuery({ boardName });

    const [txt, setTxt] = useState('');

    return (
        <div className="p-2 space-y-2 w-full">
            <BoardsHead />

            <h1 className="font-bold text-3xl text-center w-full">
                <span className="font-bold">/{boardQ.data?.name}/</span>
                <span> - </span>
                <span>{boardQ.data?.description}</span>
            </h1>

            <ThreadCompose boardName={boardName} setTxt={setTxt} txt={txt} />

            <HorizontalLine />

        </div>
    )
}

export default ArchiveComponent;