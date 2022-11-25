import Image from "next/image";
import Link from "next/link";
import { trpc } from "../../utils/trpc";
import { BoardsHead } from "./BoardsHead";
import { HorizontalLine } from "./HorizontalLine";
import ThreadCompose from "./ThreadCompose";

interface CatalogComponentProps {
    boardName: string;
}

function CatalogComponent({ boardName }: CatalogComponentProps) {
    const boardQ = trpc.boards.getByName.useQuery({ boardName });
    const catalogQ = trpc.boards.getCatalogThreads.useQuery({ boardName });

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

            <div className="flex gap-2">
                <div>
                    <span /* className="mr-1" */>[</span>
                    <Link href={`/${boardName}`} ><span className="cursor-pointer hover:text-red-500">Home</span></Link>
                    <span /* className="ml-1" */>]</span>
                </div>
                <div>
                    <span /* className="mr-1" */>[</span>
                    <Link href={`/${boardName}/archive`} ><span className="cursor-pointer hover:text-red-500">Archive</span></Link>
                    <span /* className="ml-1" */>]</span>
                </div>
            </div>

            <HorizontalLine />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 10 }}  >
                {catalogQ.data?.map(x => (
                    <div key={x.id} className="flex flex-col items-center">
                        <Link href={`/${boardName}/thread/${x.id}`}>
                            <Image src={x.image} width={200} height={200} alt="" className="object-contain shadow-md cursor-pointer hover:scale-105 transition-all" />
                        </Link>
                        <div>
                            {x.author
                                ? <div className="text-purple-800 font-bold">{x.author.name}</div>
                                : <div className="text-green-700 font-bold">Anonymous</div>}
                        </div>
                        {x.subject && <div className="text-blue-800 font-bold">
                            {x.subject}
                        </div>}
                        <div>
                            {x.text?.slice(0, 100)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CatalogComponent;