import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { trpc } from "../../utils/trpc";

interface BoardsHeadProps {
  isCatalog?: boolean;
}

export function BoardsHead({ isCatalog }: BoardsHeadProps) {
  const { data: sessionData } = useSession();

  const boardsQ = trpc.boards.getAll.useQuery();

  return (
    <div className="flex w-full gap-2 text-sm">
      <div>
        <span className="mr-2 text-blue-400">[</span>
        {boardsQ.data?.map((x, idx, arr) => (
          <span key={x.id}>
            <Link href={`/${x.name}${isCatalog ? "/catalog" : ""}`}>
              <span className="cursor-pointer hover:text-red-500">
                {x.name}
              </span>
            </Link>
            {idx != arr.length - 1 && (
              <span className="px-2 text-blue-400">/</span>
            )}
          </span>
        ))}
        <span className="ml-2 text-blue-400">]</span>
      </div>

      <div>
        <span className="mr-2 text-blue-400">[</span>

        {sessionData?.user?.name ? (
          <span>Logged in as {sessionData.user.name} - </span>
        ) : null}
        <span
          className="cursor-pointer hover:text-red-500"
          onClick={sessionData ? () => signOut() : () => signIn()}
        >
          {" "}
          {sessionData ? "Sign out" : "Sign in"}
        </span>
        <span className="ml-2 text-blue-400">]</span>
      </div>
    </div>
  );
}
