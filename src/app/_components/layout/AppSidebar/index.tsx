"use client";

import { UploadProblems } from "@/app/(main)/assignment/_components/Problem/UploadProblems";
import { CollapsibleAssignment } from "@/app/_components/layout/AppSidebar/CollapsibleAssignment";
import { CollapsibleSettings } from "@/app/_components/layout/AppSidebar/CollapsibleSettings";
import { Footer } from "@/app/_components/layout/Footer";
import { SignInButton } from "@/app/_components/user/SignInButton";
import { UserAndSignOutButton } from "@/app/_components/user/UserAndSignOutButton";
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
  SidebarText,
} from "@/components/ui/sidebar";
import { useStore } from "@/store";
import { useActiveProblem, useProblemController } from "@/store/selectors";
import { GraduationCap } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
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
    <Sidebar className="border-r bg-background">
      <SidebarHeader className="mt-2">
        <div className="flex items-center gap-2 font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </div>
          <SidebarText className="ml-2">Tutor Me Good</SidebarText>
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupContent>
            <UploadProblems trigger="button" />
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
          <SidebarGroupLabel>
            <SidebarText>Exercises</SidebarText>
          </SidebarGroupLabel>
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
      <SidebarFooter>
        {session.data?.user ? (
          <div className="mb-2 px-2">
            <UserAndSignOutButton user={session.data.user} />
          </div>
        ) : (
          <div className="mb-2">
            <SignInButton variant="ghost" className="w-full justify-start" />
          </div>
        )}
        <CollapsibleSettings />
        <Footer />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
