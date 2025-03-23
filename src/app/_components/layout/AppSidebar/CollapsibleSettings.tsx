"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarText } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { Settings, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export function CollapsibleSettings() {
  const clearAssignments = useStore.use.clearAssignments();
  const [isOpen, setIsOpen] = useState(false);
  const session = useSession();
  const { mutate: deleteAllAssignments } =
    api.assignment.deleteAllAssignments.useMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    clearAssignments();
    if (session.data?.user?.id) {
      deleteAllAssignments();
    }
    setTimeout(() => {
      setIsDeleting(false);
    }, 1500);
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
      className="transition-all duration-200 ease-linear"
    >
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 ease-linear hover:bg-accent">
        <Settings
          className={cn(
            "h-4 w-4 flex-shrink-0 shrink-0 transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
        <SidebarText className="font-semibold">Settings</SidebarText>
      </CollapsibleTrigger>
      <CollapsibleContent className="transition-all duration-200 ease-linear">
        <div className="space-y-1">
          <div className="mt-2">
            <SidebarText className="mb-2 text-sm text-muted-foreground">
              Delete all assignments? This can not be undone.
            </SidebarText>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full items-center gap-2"
            >
              <Trash2 className="h-4 w-4 flex-shrink-0" />
              <SidebarText>
                {isDeleting ? "Deleted!" : "Delete All"}
              </SidebarText>
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
