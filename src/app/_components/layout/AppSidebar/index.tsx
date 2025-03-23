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
  useSidebar,
} from "@/components/ui/sidebar";
import { useStore } from "@/store";
import { useActiveProblem, useProblemController } from "@/store/selectors";
import { GraduationCap, SearchIcon } from "lucide-react";
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
  const { state, setOpen } = useSidebar();

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
      <div
        onClick={() => (state === "collapsed" ? setOpen(true) : null)}
        className="flex h-full flex-col"
      >
        <SidebarHeader className="mt-2 flex-shrink-0">
          <div className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap className="size-4 flex-shrink-0" />
            </div>
            <SidebarText className="ml-2">Tutor Me Good</SidebarText>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex-1 overflow-y-auto overflow-x-hidden">
          <SidebarGroup className="transition-all duration-200 ease-linear">
            <SidebarGroupContent>
              <UploadProblems trigger="button" />
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="transition-all duration-200 ease-linear">
            <div className="flex h-10 w-full items-center transition-all duration-200 ease-linear">
              <div className="flex h-8 w-full items-center gap-2 px-2">
                <SearchIcon className="size-4 flex-shrink-0" />
                <SidebarText className="w-full overflow-hidden">
                  <SidebarInput
                    placeholder="Search exercises..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="transition-all duration-200 ease-linear"
                  />
                </SidebarText>
              </div>
            </div>
          </SidebarGroup>
          <SidebarGroup className="transition-all duration-200 ease-linear">
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
        <SidebarFooter className="mt-auto w-full flex-shrink-0 transition-all duration-200 ease-linear">
          <div className="min-h-[90px] w-full transition-all duration-200 ease-linear">
            {session.data?.user ? (
              <div className="mb-2 w-full px-2 transition-all duration-200 ease-linear">
                <UserAndSignOutButton user={session.data.user} />
              </div>
            ) : (
              <div className="mb-2 w-full px-2 transition-all duration-200 ease-linear">
                <SignInButton
                  variant="ghost"
                  className="w-full justify-start"
                />
              </div>
            )}
            <CollapsibleSettings />
          </div>
          <Footer className="transition-all duration-200 ease-linear" />
        </SidebarFooter>
      </div>
      <SidebarRail />
    </Sidebar>
  );
}
