"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarText } from "@/components/ui/sidebar";
import type { User } from "@/core/user/user.types";
import { Trans } from "@/i18n/react";
import { useQueryClient } from "@tanstack/react-query";
import { User as LucideUser } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function UserAndSignOutButton({ user }: { user: User }) {
  const imageUrl = user.image;
  const queryClient = useQueryClient();
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6 flex-shrink-0">
        <AvatarImage
          src={imageUrl ?? undefined}
          alt={user.name ?? "User avatar"}
          referrerPolicy="no-referrer"
        />
        <AvatarFallback>
          <LucideUser className="h-3 w-3 text-gray-500" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start">
        <SidebarText className="text-sm font-medium">
          {user.name ?? "User"}
        </SidebarText>
        <Button
          onClick={(e) => {
            e.preventDefault();
            // Set a flag to show welcome screen but keep user identity
            localStorage.setItem("showWelcomeAfterSignOut", "true");
            void signOut({ redirect: false }).then(() => {
              queryClient.clear();
              router.push("/");
            });
          }}
          variant="link"
          size="sm"
          className="h-auto p-0"
        >
          <SidebarText>
            <Trans i18nKey="sign_out" />
          </SidebarText>
        </Button>
      </div>
    </div>
  );
}
