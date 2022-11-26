import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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

  const [txt, setTxt] = useState('');

  return (
    <div className="w-full space-y-2 p-2">
      <BoardsHead isCatalog />

      <h1 className="w-full text-center text-3xl font-bold">
        <span className="font-bold">/{boardQ.data?.name}/</span>
        <span> - </span>
        <span>{boardQ.data?.description}</span>
      </h1>

      <ThreadCompose boardName={boardName} setTxt={setTxt} txt={txt} />

      <HorizontalLine />

      <div className="flex gap-2">
        <div>
          <span /* className="mr-1" */>[</span>
          <Link href={`/${boardName}`}>
            <span className="cursor-pointer hover:text-red-500">Home</span>
          </Link>
          <span /* className="ml-1" */>]</span>
        </div>
        <div>
          <span /* className="mr-1" */>[</span>
          <Link href={`/${boardName}/archive`}>
            <span className="cursor-pointer hover:text-red-500">Archive</span>
          </Link>
          <span /* className="ml-1" */>]</span>
        </div>
      </div>

      <HorizontalLine />

      {catalogQ.data?.length === 0 && (
        <div className="w-full text-center">No threads yet</div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 10,
        }}
      >
        {catalogQ.data?.map((x) => (
          <div key={x.id} className="flex flex-col items-center leading-tight">
            <Link href={`/${boardName}/thread/${x.id}`}>
              <Image
                src={x.image}
                width={200}
                height={200}
                alt=""
                className="cursor-pointer object-contain shadow-md transition-all hover:scale-105"
              />
            </Link>
            <div>
              {x.author ? (
                <Link href={`/user/${x.author.id}`}>
                  <div className="font-bold text-purple-800">{x.author.name}</div>
                </Link>
              ) : (
                <div className="font-bold text-green-700">Anonymous</div>
              )}
            </div>
            {x.subject && (
              <div className="font-bold text-blue-800">{x.subject}</div>
            )}
            <div className="text-xs font-thin">
              R: {x.comments.length} | I:{" "}
              {x.comments.filter((x) => !!x.image).length}
            </div>
            <div>{x.text?.slice(0, 100)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CatalogComponent;
