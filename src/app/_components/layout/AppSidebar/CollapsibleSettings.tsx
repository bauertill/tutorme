"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { Settings, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { LanguageSelector } from "../../user/LanguageSelector";

export function CollapsibleSettings() {
  const clearAssignments = useStore.use.clearAssignments();
  const [isOpen, setIsOpen] = useState(false);
  const session = useSession();
  const { mutate: deleteAllAssignments } =
    api.assignment.deleteAllAssignments.useMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (
      confirm(
        "Are you sure you want to delete all assignments? This can not be undone.",
      )
    ) {
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
    <Collapsible open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent">
        <Settings
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
        <span className="font-semibold">Settings</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-4 pl-6">
          <div>
            <LanguageSelector />
          </div>
          <div className="">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleted!" : "Delete All Assignments"}
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
