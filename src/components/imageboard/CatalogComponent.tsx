import { trpc } from "../../utils/trpc";
import { BoardsHead } from "./BoardsHead";
import { HorizontalLine } from "./HorizontalLine";
import ThreadCompose from "./ThreadCompose";

interface CatalogComponentProps {
    boardName: string;
}

function CatalogComponent({ boardName }: CatalogComponentProps) {
    const boardQ = trpc.boards.getByName.useQuery({ boardName });

    return (
        <div className="p-2 space-y-2 w-full">
            <BoardsHead />

            <h1 className="font-bold text-3xl text-center w-full">
                <span className="font-bold">/{boardQ.data?.name}/</span>
                <span> - </span>
                <span>{boardQ.data?.description}</span>
            </h1>

            <ThreadCompose boardName={boardName} />

            <HorizontalLine />
        </div>
    )
}

export default CatalogComponent;