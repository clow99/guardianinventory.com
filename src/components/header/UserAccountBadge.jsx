"use client";
import { useSession } from "next-auth/react";
import { useAccount } from "@/app/hooks/useAccount";

export default function UserAccountBadge() {
    const { data: session } = useSession();
    const { accountId } = useAccount();
    const user = session?.user;

    return (
        <div className="flex items-center gap-3 px-2 py-1 rounded border border-neutral-700 bg-neutral-800/70">
            {user?.image ? (
                <img
                    src={user.image}
                    alt="avatar"
                    className="w-6 h-6 rounded-full"
                />
            ) : (
                <div className="w-6 h-6 rounded-full bg-neutral-600" />
            )}
            <div className="flex flex-col leading-tight">
                <span className="text-sm text-neutral-200 font-semibold truncate max-w-[180px]">
                    {user?.name || user?.email || "User"}
                </span>
                <span className="text-[11px] text-neutral-400">
                    Account: {accountId ? `#${accountId}` : "None"}
                </span>
            </div>
        </div>
    );
}
