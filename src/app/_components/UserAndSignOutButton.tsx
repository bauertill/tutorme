"use client";
import { User } from "lucide-react";
import { type Session } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";

export function UserAndSignOutButton({ session }: { session: Session }) {
  const imageUrl = session.user?.image;

  return (
    <div className="flex items-center gap-4 p-4">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={session.user?.name ?? "User avatar"}
          width={40}
          height={40}
          className="rounded-full"
          unoptimized={true}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="rounded-full bg-gray-200 w-10 h-10 flex items-center justify-center">
          <User className="w-6 h-6 text-gray-500" />
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {session.user?.name ?? "User"}
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
