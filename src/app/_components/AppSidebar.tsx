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
import { useStore } from "@/store";
import { useActiveProblem, useProblemController } from "@/store/selectors";
import { GraduationCap } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { UploadProblems } from "../(main)/assignment/_components/Problem/UploadProblems";
import { CollapsibleAssignment } from "./CollapsibleAssignment";
import { CollapsibleSettings } from "./CollapsibleSettings";
import { SignInButton } from "./SignInButton";
import { UserAndSignOutButton } from "./UserAndSignOutButton";

export function AppSidebar() {
  const session = useSession();
  const assignments = useStore.use.assignments();
  const activeProblem = useActiveProblem();
  const activeAssignmentId = useStore.use.activeAssignmentId();
  const { setActiveProblemWithCanvas } = useProblemController();
  const [openAssignments, setOpenAssignments] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (activeAssignmentId) {
      setOpenAssignments(
        (assignmentIds) => new Set([...assignmentIds, activeAssignmentId]),
      );
    }
  }, [activeAssignmentId]);

  const toggleAssignment = (assignmentId: string) => {
    const newOpenAssignments = new Set(openAssignments);
    if (newOpenAssignments.has(assignmentId)) {
      newOpenAssignments.delete(assignmentId);
    } else {
      newOpenAssignments.add(assignmentId);
    }
    setOpenAssignments(newOpenAssignments);
  };

  const filteredAssignments = useMemo(() => {
    if (!searchQuery.trim()) return assignments;

    const query = searchQuery.toLowerCase().trim();
    return assignments
      .map((assignment) => ({
        ...assignment,
        problems: assignment.problems.filter(
          (problem) =>
            problem.problem.toLowerCase().includes(query) ||
            problem.id.toString().includes(query),
        ),
      }))
      .filter(
        (assignment) =>
          assignment.name.toLowerCase().includes(query) ||
          assignment.problems.length > 0,
      );
  }, [assignments, searchQuery]);

  // Auto-expand assignments that have matching problems when searching
  const autoExpandedAssignments = useMemo(() => {
    if (!searchQuery.trim()) return openAssignments;

    const newOpenAssignments = new Set(openAssignments);
    filteredAssignments.forEach((assignment) => {
      if (assignment.problems.length > 0) {
        newOpenAssignments.add(assignment.id);
      }
    });
    return newOpenAssignments;
  }, [filteredAssignments, searchQuery, openAssignments]);

  return (
    <Sidebar className="border-r border-border bg-background">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3 font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </div>
          Tutor Me Good
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupContent>
            <UploadProblems className="w-full justify-start" />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarInput
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Exercises</SidebarGroupLabel>
          <SidebarGroupContent>
            {filteredAssignments.map((assignment) => (
              <CollapsibleAssignment
                key={assignment.id}
                assignment={assignment}
                isOpen={autoExpandedAssignments.has(assignment.id)}
                onOpenChange={() => toggleAssignment(assignment.id)}
                activeProblem={activeProblem}
                setActiveProblem={setActiveProblemWithCanvas}
              />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex">
        {session.data?.user ? (
          <div className="px-2">
            <UserAndSignOutButton user={session.data.user} />
          </div>
        ) : (
          <SignInButton variant="ghost" className="justify-start" />
        )}
        <CollapsibleSettings />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
