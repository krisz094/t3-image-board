import { AdvancedImage } from "@cloudinary/react";
import { Resize } from "@cloudinary/url-gen/actions/resize";
import type { User } from "@prisma/client";
import Link from "next/link";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { myCld } from "../../utils/cloudinary";
import { trpc } from "../../utils/trpc";
import type { ThreadFormProps } from "./BoardComponent";
import { BoardNameDesc } from "./BoardNameDesc";
import { BoardsListHead } from "./BoardsListHead";
import { HorizontalLine } from "./HorizontalLine";
import ThreadCompose from "./ThreadCompose";

interface CatalogThreadProps {
  id: string;
  updatedAt: Date | null;
  author: User | null;
  text: string | null;
  image: string;
  subject: string | null;
  timestamp: Date;
  comments: {
    id: string;
    image: string | null;
  }[];
  boardName: string;
}

function CatalogThread(props: CatalogThreadProps) {
  const cldImg = useMemo(() => {
    const img = myCld.image(props.image);

    img.resize(Resize.fit(200, 200));

    return img;
  }, [props.image]);

  return (
    <div key={props.id} className="flex flex-col items-center leading-tight">
      <Link href={`/${props.boardName}/thread/${props.id}`}>
        <div className="cursor-pointer object-contain shadow-md transition-all hover:scale-105">
          <AdvancedImage cldImg={cldImg} />
        </div>
      </Link>
      <div>
        {props.author ? (
          <Link href={`/user/${props.author.id}`}>
            <div className="font-bold text-purple-800">{props.author.name}</div>
          </Link>
        ) : (
          <div className="font-bold text-green-700">Anonymous</div>
        )}
      </div>
      {props.subject && (
        <div className="font-bold text-blue-800">{props.subject}</div>
      )}
      <div className="text-xs font-thin">
        R: <span className="font-bold">{props.comments.length}</span> / I:{" "}
        <span className="font-bold">
          {props.comments.filter((x) => !!x.image).length}
        </span>
      </div>
      <div className="text-sm" style={{ wordBreak: "break-word" }}>
        {props.text?.slice(0, 100)}
      </div>
    </div>
  );
}

interface CatalogComponentProps {
  boardName: string;
}

function CatalogComponent({ boardName }: CatalogComponentProps) {
  const formMethods = useForm<ThreadFormProps>();

  const boardQ = trpc.boards.getByName.useQuery({ boardName });
  const catalogQ = trpc.boards.getCatalogThreads.useQuery({ boardName });

  return (
    <div className="w-full space-y-2 p-2">
      <BoardsListHead isCatalog />
      <BoardNameDesc desc={boardQ.data?.description} name={boardQ.data?.name} />

      <FormProvider {...formMethods}>
        <ThreadCompose boardName={boardName} />
      </FormProvider>

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
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 10,
        }}
      >
        {catalogQ.data?.map((x) => (
          <CatalogThread key={x.id} {...x} boardName={boardName} />
        ))}
      </div>
    </div>
  );
}

export default CatalogComponent;
