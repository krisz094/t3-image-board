import Image from "next/image";
import { trpc } from "../../utils/trpc";
import { BoardsListHead } from "../imageboard/BoardsListHead";
import { HorizontalLine } from "../imageboard/HorizontalLine";

interface Props {
    userId: string;
}

export function UserComponent({ userId }: Props) {

    const userQ = trpc.user.getById.useQuery({ userId });

    return (
        <div className="p-2">
            <BoardsListHead />
            <div className="w-full flex justify-center p-[20px]">
                <div className="w-full max-w-[800px] bg-brownmain-300 p-4 rounded-md space-y-4">
                    <div className="flex items-center gap-4">
                        {userQ.data?.image && <Image alt="" src={userQ.data?.image} width={100} height={100} className="object-cover rounded-full" />}
                        <div className="text-[50px]">{userQ.data?.name}</div>
                    </div>
                    <HorizontalLine />
                    <div>
                        <ul>
                            <li><span className="font-bold">Threads:</span> {userQ.data?._count.threads}</li>
                            <li><span className="font-bold">Comments:</span> {userQ.data?._count.comments}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}