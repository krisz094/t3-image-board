import { trpc } from "../../utils/trpc";
import { BoardsListHead } from "../imageboard/BoardsListHead";

export function AdminComponent() {

    const purgeMut = trpc.admin.purgeDelComAndThr.useMutation();

    return (
        <>
            <div className="p-2 space-y-4">
                <BoardsListHead />
                <div>
                    <h1 className="text-3xl font-bold">3Board Admin</h1>
                    {/*                 <div>
                    <Link href={"/"} >
                    <span className="text-blue-400 underline">
                    Back to site
                    </span>
                    </Link>
                </div> */}
                </div>
                <div className="space-y-2 flex flex-col items-start">
                    <h2 className="text-xl font-bold">Actions</h2>
                    <div className="flex flex-col items-start">
                        <button onClick={() => purgeMut.mutate()} className="shadow-md bg-brownmain-800 text-white px-2 py-1 rounded-md">{purgeMut.isLoading ? "Wait..." : "Purge deleted threads and posts"}</button>
                        {purgeMut.data && <div>Purged {purgeMut.data.comDel.count} comments and {purgeMut.data.thrDel.count} threads</div>}
                    </div>
                </div>
            </div>
        </>
    )
}