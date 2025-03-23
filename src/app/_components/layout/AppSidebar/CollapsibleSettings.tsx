"use client";

import { LanguageSelector } from "@/app/_components/user/LanguageSelector";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarText, useSidebar } from "@/components/ui/sidebar";
import { Trans, useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { Settings, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export function CollapsibleSettings() {
  const { t } = useTranslation();
  const clearAssignments = useStore.use.clearAssignments();
  const [isOpen, setIsOpen] = useState(false);
  const session = useSession();
  const { mutate: deleteAllAssignments } =
    api.assignment.deleteAllAssignments.useMutation();
  const [isDeleting, setIsDeleting] = useState(false);
  const { state } = useSidebar();

  const handleDelete = () => {
    if (confirm(t("delete_all_assignments_confirmation"))) {
      setIsDeleting(true);
      clearAssignments();
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
            "h-4 w-4 flex-shrink-0 shrink-0 transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
        <SidebarText className="font-semibold">
          <Trans i18nKey="settings" />
        </SidebarText>
      </CollapsibleTrigger>
      <CollapsibleContent className="transition-all duration-200 ease-linear">
        <div className="mt-2 space-y-4 pl-6">
          <LanguageSelector />
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full items-center gap-2"
          >
            <Trash2 className="h-4 w-4 flex-shrink-0" />
            <SidebarText>
              {isDeleting ? t("deleted") : t("delete_all_assignments")}
            </SidebarText>
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
