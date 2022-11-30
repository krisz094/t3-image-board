import clsx from "clsx";
import Link from "next/link";
import { memo, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { trpc } from "../../utils/trpc";
import { BoardNameDesc } from "./BoardNameDesc";
import { BoardsListHead } from "./BoardsListHead";
import { Comment } from "./Comment";
import { HorizontalLine } from "./HorizontalLine";
import ThreadCompose from "./ThreadCompose";

export interface ThreadFormProps {
  replyText: string;
  media: File[];
  subject: string;
}

interface BoardComponentProps {
  pageNum: number;
  boardName: string;
}

const BoardComponent = memo(function BoardComp({
  pageNum,
  boardName,
}: BoardComponentProps) {
  const formMethods = useForm<ThreadFormProps>();

  /* Queries */
  const boardQ = trpc.boards.getByName.useQuery({ boardName });
  const pageNumQ = trpc.boards.getPageNum.useQuery({ boardName });
  const threadsQ = trpc.boards.getPage.useQuery({ boardName, pageNum });
  const isAdminQ = trpc.admin.isCurrUserAdmin.useQuery();
  const isAdmin = useMemo(() => !!isAdminQ.data, [isAdminQ.data]);

  /* Mutations */
  const delThreadMut = trpc.admin.delThread.useMutation({
    onSuccess: async () => {
      threadsQ.refetch();
    }
  });
  const delCommentMut = trpc.admin.delComment.useMutation({
    onSuccess: async () => {
      threadsQ.refetch();
    }
  });


  if (boardQ.isLoading) {
    return <div className=" space-y-2 p-2">Loading...</div>;
  } else if (boardQ.isError || !boardQ.data) {
    return <div className=" space-y-2 p-2">Error</div>;
  }

  return (
    <div className="w-full space-y-2 p-2">
      <BoardsListHead />
      <BoardNameDesc desc={boardQ.data?.description} name={boardQ.data?.name} />

      <FormProvider {...formMethods}>
        <ThreadCompose boardName={boardName} />
      </FormProvider>

      <HorizontalLine />

      <div className="flex gap-2">
        <div>
          <span>[</span>
          <Link href={`/${boardName}/catalog`}>
            <span className="cursor-pointer hover:text-red-500">Catalog</span>
          </Link>
          <span>]</span>
        </div>
        <div>
          <span>[</span>
          <Link href={`/${boardName}/archive`}>
            <span className="cursor-pointer hover:text-red-500">Archive</span>
          </Link>
          <span>]</span>
        </div>
      </div>

      <HorizontalLine />

      <div className="flex flex-col items-start gap-2 ">
        {threadsQ.data?.length === 0 && (
          <div className="w-full text-center">No threads yet</div>
        )}

        {threadsQ.data?.map((x) => (
          <div key={x.id} className="flex w-full flex-1 flex-col gap-2">
            <Comment {...x} boardName={boardName} key={x.id} onIdClick={id => {
              formMethods.setValue('replyText', formMethods.getValues('replyText') + ">>" + id + "\n");
              formMethods.setFocus('replyText');
            }} onDelClick={isAdmin ? id => delThreadMut.mutate({ id }) : undefined} />

            {x._count.comments > 3 && <div className="sm:pl-4">3 out of {x._count.comments} replies shown. <Link href={`/${boardName}/thread/${x.id}`}><span className="underline">View thread</span></Link></div>}

            {x.comments
              .slice()
              .reverse()
              .map((y) => (
                <Comment key={y.id} isReply {...y} onIdClick={id => {
                  formMethods.setValue('replyText', formMethods.getValues('replyText') + ">>" + id + "\n");
                  formMethods.setFocus('replyText');
                }} onDelClick={isAdmin ? id => delCommentMut.mutate({ id }) : undefined} />
              ))}
            <HorizontalLine />
          </div>
        ))}
      </div>

      {!!threadsQ.data?.length && (
        <div className="inline-block space-x-1 rounded-md bg-brownmain-300 p-2 shadow-md">
          {Array(pageNumQ.data || 1)
            .fill("")
            .map((x, idx) => idx + 1)
            .map((page) => (
              <Link key={page} href={`/${boardName}/${page}`}>
                <span
                  className={clsx({ "cursor-pointer": page != pageNum })}
                  key={page}
                >
                  [
                  <span
                    key={page}
                    className={clsx({
                      "font-bold": page == pageNum,
                      "hover:font-bold": page != pageNum,
                    })}
                  >
                    {page}
                  </span>
                  ]
                </span>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
});

export default BoardComponent;
