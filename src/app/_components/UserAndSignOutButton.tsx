"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { User } from "@/core/user/types";
import { User as LucideUser } from "lucide-react";
import { signOut } from "next-auth/react";

export function UserAndSignOutButton({ user }: { user: User }) {
  const imageUrl = user.image;

  return (
    <div className="flex items-center gap-4 p-4">
      <Avatar>
        <AvatarImage
          src={imageUrl ?? undefined}
          alt={user.name ?? "User avatar"}
          referrerPolicy="no-referrer"
        />
        <AvatarFallback>
          <LucideUser className="h-6 w-6 text-gray-500" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start">
        <p className="text-sm font-medium">{user.name ?? "User"}</p>
        <Button
          onClick={() => signOut()}
          variant="link"
          size="sm"
          className="h-auto p-0"
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
