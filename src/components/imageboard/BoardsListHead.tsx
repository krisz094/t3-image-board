import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo } from "react";
import { trpc } from "../../utils/trpc";

interface BoardsListHeadProps {
  isCatalog?: boolean;
}

export function BoardsListHead({ isCatalog }: BoardsListHeadProps) {
  const { data: sessionData } = useSession();

  const boardsQ = trpc.boards.getAll.useQuery(undefined, { refetchOnWindowFocus: false, staleTime: 60000 });
  const isAdminQ = trpc.admin.isCurrUserAdmin.useQuery(undefined, { refetchOnWindowFocus: false, staleTime: 60000 });
  const isAdmin = useMemo(() => !!isAdminQ.data, [isAdminQ.data]);

  return (
    <div className="flex w-full gap-2 text-sm">
      <div>
        <span className="mr-2 text-brownmain-400">[</span>
        {boardsQ.data?.map((x, idx, arr) => (
          <span key={x.id}>
            <Link href={`/${x.name}${isCatalog ? "/catalog" : ""}`}>
              <span className="cursor-pointer hover:text-red-500">
                {x.name}
              </span>
            </Link>
            {idx != arr.length - 1 && (
              <span className="px-2 text-brownmain-400">/</span>
            )}
          </span>
        ))}
        <span className="ml-2 text-brownmain-400">]</span>
      </div>

      <div>
        <span className="mr-2 text-brownmain-400">[</span>

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
        <span className="ml-2 text-brownmain-400">]</span>
      </div>

      {isAdmin && (
        <div>
          <span className="mr-2 text-brownmain-400">[</span>
          <Link href={'/admin'}>
            <span className="cursor-pointer hover:text-red-500">
              Admin
            </span>
          </Link>
          <span className="ml-2 text-brownmain-400">]</span>
        </div>
      )}
    </div>
  );
}
