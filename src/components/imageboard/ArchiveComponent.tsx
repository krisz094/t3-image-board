import { trpc } from "../../utils/trpc";
import { BoardNameDesc } from "./BoardNameDesc";
import { BoardsListHead } from "./BoardsListHead";
import { HorizontalLine } from "./HorizontalLine";

interface ArchiveComponentProps {
    boardName: string;
}

function ArchiveComponent({ boardName }: ArchiveComponentProps) {
    const boardQ = trpc.boards.getByName.useQuery({ boardName });
    /* const archiveQ = trpc.boards.getArchiveThreads.useQuery({ boardName }); */

    return (
        <div className="p-2 space-y-2 w-full">
            <BoardsListHead />
            <BoardNameDesc desc={boardQ.data?.description} name={boardQ.data?.name} />

            <HorizontalLine />
        </div>
    )
}

export default ArchiveComponent;