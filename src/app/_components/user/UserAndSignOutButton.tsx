"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { User } from "@/core/user/types";
import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { User as LucideUser } from "lucide-react";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export function UserAndSignOutButton({ user }: { user: User }) {
  const imageUrl = user.image;
  const clearAssignments = useStore.use.clearAssignments();
  const { data: subscription } = api.subscription.getSubscription.useQuery();
  const { mutateAsync: createPortalUrl } =
    api.subscription.createPortalUrl.useMutation();
  const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const url = await createPortalUrl();
    redirect(url);
  };

  return (
    <div className="flex items-center gap-4">
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
        {subscription && (
          <Button
            onClick={onClick}
            variant="link"
            size="sm"
            className="h-auto p-0"
          >
            Manage subscription
          </Button>
        )}
        <Button
          onClick={(e) => {
            e.preventDefault();
            void signOut().then(() => {
              clearAssignments();
            });
          }}
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
