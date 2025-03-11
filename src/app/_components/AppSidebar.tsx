"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { type Assignment } from "../(main)/new/_components/dummyData";
import { UserAndSignOutButton } from "./UserAndSignOutButton";

export function AppSidebar({ assignments }: { assignments: Assignment[] }) {
  const [openAssignments, setOpenAssignments] = useState<Set<string>>(
    new Set(),
  );

  const toggleAssignment = (assignmentId: string) => {
    const newOpenAssignments = new Set(openAssignments);
    if (newOpenAssignments.has(assignmentId)) {
      newOpenAssignments.delete(assignmentId);
    } else {
      newOpenAssignments.add(assignmentId);
    }
    setOpenAssignments(newOpenAssignments);
  };

  return (
    <Sidebar className="border-r border-border bg-background">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">T</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Tutor me good</span>
          </div>
        </div>
        <div className="px-2 pb-2">
          <SidebarInput placeholder="Search..." />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Exercises</SidebarGroupLabel>
          <SidebarGroupContent>
            {assignments.map((assignment) => (
              <Collapsible
                key={assignment.id}
                open={openAssignments.has(assignment.id)}
                onOpenChange={() => toggleAssignment(assignment.id)}
              >
                <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent">
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200",
                      openAssignments.has(assignment.id) && "rotate-90",
                    )}
                  />
                  <span>{assignment.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {assignment.problems.length}
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-1 pl-6">
                    {assignment.problems.map((problem) => (
                      <button
                        key={problem.id}
                        className={cn(
                          "w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent",
                          problem.status === "SOLVED" && "text-green-500",
                          problem.status === "FAILED" && "text-red-500",
                        )}
                      >
                        Exercise {problem.id}
                      </button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserAndSignOutButton
          user={{
            id: "1",
            name: "John Doe",
            image: "https://github.com/shadcn.png",
            email: "john.doe@example.com",
            emailVerified: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
