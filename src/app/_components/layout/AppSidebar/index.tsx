"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { UploadUserProblems } from "@/app/(main)/assignment/_components/Problem/UploadUserProblems";
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
import { Trans, useTranslation } from "@/i18n/react";
import { useAuth } from "@/lib/react-auth";
import { useActiveProblem } from "@/store/problem.selectors";
import { api } from "@/trpc/react";
import { BookOpen, ChevronLeft, GraduationCap, SearchIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useRef, useState } from "react";

export function AppSidebar() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const [studentProblems] =
    api.assignment.getStudentProblems.useSuspenseQuery();
  const activeProblem = useActiveProblem();
  // const activeAssignmentId = useActiveAssignmentId(); // No longer needed
  // No longer need assignment state since we work directly with problems
  const [searchQuery, setSearchQuery] = useState("");
  const { open, state, setOpen, openMobile, setOpenMobile, isMobile } =
    useSidebar();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const hideUploadProblems = pathname?.startsWith("/assignment");

  const filteredProblems = useMemo(() => {
    if (!searchQuery.trim()) return studentProblems;

    const query = searchQuery.toLowerCase().trim();
    return (studentProblems ?? []).filter(
      (problem: any) =>
        problem.problem.toLowerCase().includes(query) ||
        problem.id.toString().includes(query),
    );
  }, [studentProblems, searchQuery]);

  return (
    <Sidebar className="border-r bg-background">
      <div
        onClick={() => (state === "collapsed" ? setOpen(true) : null)}
        className="flex h-full flex-col"
      >
        <SidebarHeader className="ml-1 mt-2 flex-shrink-0 transition-all duration-200 ease-linear">
          <div className="flex items-center gap-1 font-medium">
            <Link
              href="/home"
              className="mr-auto flex cursor-pointer items-center gap-1"
              aria-label="Go to Home"
              title="Home"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <GraduationCap className="size-4" />
              </div>
              <SidebarText className="ml-2 overflow-hidden">
                Tutor Me Good
              </SidebarText>
            </Link>
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
        {!hideUploadProblems && (
          <SidebarGroup className="transition-all duration-200 ease-linear">
            <SidebarGroupContent>
              <UploadUserProblems />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
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
                {filteredProblems?.length ?? 0}
              </p>
            </SidebarText>
          </div>
          <SidebarGroupContent className="no-scrollbar overflow-y-auto">
            <SidebarText className="block w-full">
              {filteredProblems?.map((problem: any) => (
                <div
                  key={problem.id}
                  className={`cursor-pointer rounded-lg p-2 transition-colors hover:bg-accent ${
                    activeProblem?.id === problem.id ? "bg-accent" : ""
                  }`}
                  onClick={() => {
                    // Navigate to the problem
                    window.location.href = `/assignment`;
                  }}
                >
                  <div className="truncate text-sm font-medium">
                    Problem {problem.problemNumber}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {problem.problem.substring(0, 50)}...
                  </div>
                </div>
              ))}
            </SidebarText>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter className="mt-auto w-full flex-shrink-0 transition-all duration-200 ease-linear">
          <div className="min-h-[90px] w-full transition-all duration-200 ease-linear">
            {session?.user ? (
              <div className="mb-2 w-full px-2 transition-all duration-200 ease-linear">
                <UserAndSignOutButton user={session.user} />
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
