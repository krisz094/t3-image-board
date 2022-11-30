import { trpc } from "../../utils/trpc";
import { BoardsHead } from "./BoardsHead";
import { HorizontalLine } from "./HorizontalLine";

interface ArchiveComponentProps {
    boardName: string;
}

function ArchiveComponent({ boardName }: ArchiveComponentProps) {
    const boardQ = trpc.boards.getByName.useQuery({ boardName });
    /* const archiveQ = trpc.boards.getArchiveThreads.useQuery({ boardName }); */

    return (
        <div className="p-2 space-y-2 w-full">
            <BoardsHead />

            <h1 className="font-bold text-3xl text-center w-full">
                <span className="font-bold">/{boardQ.data?.name}/</span>
                <span> - </span>
                <span>{boardQ.data?.description}</span>
            </h1>

            <HorizontalLine />
        </div>
    )
}

export default ArchiveComponent;