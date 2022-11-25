
interface CatalogComponentProps {
    boardName: string;
}

function CatalogComponent({ boardName }: CatalogComponentProps) {
    const boardQ = trpc.boards.getByName.useQuery({ boardName });

    return (
        <div className="p-2 space-y-2 w-full">
            <BoardsHead />

        </div>
    )
}

export default CatalogComponent;