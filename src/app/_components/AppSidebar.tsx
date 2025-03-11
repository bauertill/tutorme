"use client";

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
import { type UserProblem } from "@/core/problem/types";
import { useState } from "react";
import { type Assignment } from "../(main)/new/_components/dummyData";
import { CollapsibleAssignment } from "./CollapsibleAssignment";
import { UserAndSignOutButton } from "./UserAndSignOutButton";

export function AppSidebar({
  assignments,
  activeProblem,
  setActiveProblem,
}: {
  assignments: Assignment[];
  activeProblem: UserProblem | null;
  setActiveProblem: (problem: UserProblem) => void;
}) {
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
              <CollapsibleAssignment
                key={assignment.id}
                assignment={assignment}
                isOpen={openAssignments.has(assignment.id)}
                onOpenChange={() => toggleAssignment(assignment.id)}
                activeProblem={activeProblem}
                setActiveProblem={setActiveProblem}
              />
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
