"use client";

import { UploadProblems } from "@/app/(main)/assignment/_components/Problem/UploadProblems";
import { CollapsibleAssignment } from "@/app/_components/layout/AppSidebar/CollapsibleAssignment";
import { CollapsibleSettings } from "@/app/_components/layout/AppSidebar/CollapsibleSettings";
import { Footer } from "@/app/_components/layout/Footer";
import { SignInButton } from "@/app/_components/user/SignInButton";
import { UserAndSignOutButton } from "@/app/_components/user/UserAndSignOutButton";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarRail,
  SidebarText,
  useSidebar,
} from "@/components/ui/sidebar";
import { Trans, useTranslation } from "@/i18n";
import { useStore } from "@/store";
import { useActiveProblem, useProblemController } from "@/store/selectors";
import { BookOpen, ChevronLeft, GraduationCap, SearchIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";

export function AppSidebar() {
  const { t } = useTranslation();
  const session = useSession();
  const assignments = useStore.use.assignments();
  const activeProblem = useActiveProblem();
  const activeAssignmentId = useStore.use.activeAssignmentId();
  const { setActiveProblemWithCanvas } = useProblemController();
  const [openAssignments, setOpenAssignments] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const { open, state, setOpen, openMobile, setOpenMobile, isMobile } =
    useSidebar();
  const searchInputRef = useRef<HTMLInputElement>(null);

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
        <SidebarHeader className="ml-1 mt-2 flex-shrink-0 transition-all duration-200 ease-linear">
          <div className="flex items-center gap-1 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap className="size-4" />
            </div>
            <SidebarText className="ml-2 flex-1 overflow-hidden">
              Tutor Me Good
            </SidebarText>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (isMobile) setOpenMobile(false);
                else setOpen(false);
              }}
              className={`${open || openMobile ? "" : "hidden"}`}
            >
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </SidebarHeader>
        <SidebarGroup className="transition-all duration-200 ease-linear">
          <SidebarGroupContent>
            <UploadProblems trigger="button" />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="transition-all duration-200 ease-linear">
          <div className="relative flex h-10 w-full flex-shrink-0 items-center transition-all duration-200 ease-linear">
            <SearchIcon
              className="absolute left-2 top-1/2 size-4 flex-shrink-0 -translate-y-1/2 cursor-pointer text-muted-foreground"
              onClick={() => searchInputRef.current?.focus()}
            />
            <SidebarInput
              ref={searchInputRef}
              placeholder={t("search_exercises")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full transition-all duration-200 ease-linear ${
                state === "collapsed" ? "pl-4" : "pl-10"
              }`}
            />
          </div>
        </SidebarGroup>
        <SidebarGroup className="no-scrollbar overflow-y-auto overflow-x-hidden pr-1 transition-all duration-200 ease-linear">
          <div className="mb-2 ml-2 mt-2 flex items-center gap-4">
            <BookOpen className="size-4 text-muted-foreground" />
            <SidebarText className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                <Trans i18nKey="assignments" />
              </p>
              <p className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium">
                {filteredAssignments.length}
              </p>
            </SidebarText>
          </div>
          <SidebarGroupContent className="no-scrollbar overflow-y-auto">
            <SidebarText className="block w-full">
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
            </SidebarText>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter className="mt-auto w-full flex-shrink-0 transition-all duration-200 ease-linear">
          <div className="min-h-[90px] w-full transition-all duration-200 ease-linear">
            {session.data?.user ? (
              <div className="mb-2 w-full px-2 transition-all duration-200 ease-linear">
                <UserAndSignOutButton user={session.data.user} />
              </div>
            ) : (
              <div className="mb-2 w-full transition-all duration-200 ease-linear">
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
