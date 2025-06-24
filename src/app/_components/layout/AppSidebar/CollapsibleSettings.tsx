"use client";

import { LanguagePicker } from "@/app/_components/user/LanguagePicker";
import { ManageSubscriptionButton } from "@/app/_components/user/ManageSubscriptionButton";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { SidebarText, useSidebar } from "@/components/ui/sidebar";
import { Trans, useTranslation } from "@/i18n/react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { Settings, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { forwardRef, useState } from "react";

export const CollapsibleSettings = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, onClick, ...props }, ref) => {
  const { t } = useTranslation();
  const clearAssignments = useStore.use.clearAssignments();
  const [isOpen, setIsOpen] = useState(false);
  const session = useSession();
  const { mutate: deleteAllAssignments } =
    api.assignment.deleteAllAssignments.useMutation();
  const [isDeleting, setIsDeleting] = useState(false);
  const setHasCompletedOnboarding = useStore.use.setHasCompletedOnboarding();
  const setUserHasScrolled = useStore.use.setUserHasScrolled();
  const { state } = useSidebar();

  const handleDelete = () => {
    if (confirm(t("delete_all_assignments_confirmation"))) {
      setIsDeleting(true);
      clearAssignments();
      setHasCompletedOnboarding(false);
      setUserHasScrolled(false);
      if (session.data?.user?.id) {
        deleteAllAssignments();
      }
      setTimeout(() => {
        setIsDeleting(false);
      }, 1500);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsOpen(!isOpen);
    onClick?.(e);
  };

  return (
    <>
      <Button
        ref={ref}
        variant="ghost"
        onClick={handleClick}
        className={cn(
          "flex h-9 w-full items-center justify-start px-2 transition-all duration-200 ease-linear group-data-[collapsible=icon]:justify-center group-data-[collapsible=offcanvas]:justify-center",
          className,
        )}
        {...props}
      >
        <Settings className="size-4 flex-shrink-0" />
        <SidebarText className="ml-2 overflow-hidden">
          <Trans i18nKey="settings" />
        </SidebarText>
      </Button>

      <Collapsible
        open={isOpen && state === "expanded"}
        onOpenChange={(open) => setIsOpen(open)}
        className="transition-all duration-200 ease-linear"
      >
        <CollapsibleContent className="transition-all duration-200 ease-linear">
          <div className="mt-2 space-y-4 pl-6">
            <LanguagePicker />
            <ManageSubscriptionButton />
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full"
            >
              <Trash2 className="size-4" />
              <SidebarText>
                {isDeleting ? t("deleted") : t("delete_all_assignments")}
              </SidebarText>
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
});

CollapsibleSettings.displayName = "CollapsibleSettings";
