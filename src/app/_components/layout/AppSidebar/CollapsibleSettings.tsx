"use client";

import { LanguagePicker } from "@/app/_components/user/LanguagePicker";
import { ManageSubscriptionButton } from "@/app/_components/user/ManageSubscriptionButton";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarText, useSidebar } from "@/components/ui/sidebar";
import { Trans, useTranslation } from "@/i18n/react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { Settings, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export function CollapsibleSettings() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const session = useSession();
  const utils = api.useUtils();
  const { mutate: deleteAllAssignments } =
    api.assignment.deleteAllStudentData.useMutation({
      onSuccess: () => {
        void utils.assignment.getStudentProblems.invalidate();
      },
    });
  const [isDeleting, setIsDeleting] = useState(false);
  const setHasCompletedOnboarding = useStore.use.setHasCompletedOnboarding();
  const setUserHasScrolled = useStore.use.setUserHasScrolled();
  const { state } = useSidebar();

  const handleDelete = () => {
    if (confirm(t("delete_all_assignments_confirmation"))) {
      setIsDeleting(true);
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

  return (
    <Collapsible
      open={isOpen && state === "expanded"}
      onOpenChange={(open) => setIsOpen(open)}
      className="transition-all duration-200 ease-linear"
    >
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-all duration-200 ease-linear hover:bg-accent">
        <Settings
          className={cn(
            "size-4 flex-shrink-0 transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
        <SidebarText className="font-semibold">
          <Trans i18nKey="settings" />
        </SidebarText>
      </CollapsibleTrigger>
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
  );
}
