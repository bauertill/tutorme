"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

export function UserAndSignOutButton() {
  const { data: session, status } = useSession();
  if (status === "authenticated") {
    console.log(session.user?.image);
    return (
      <div className="flex items-center gap-4 p-4">
        <Image
          src={session.user?.image ?? ""}
          alt={session.user?.name ?? ""}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {session.user?.name}
          </p>
          <button
            onClick={() => signOut()}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }
}
