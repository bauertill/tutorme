"use client";
import { Canvas } from "@/app/(main)/exercise/_components/Canvas";
import { AppSidebar } from "@/app/_components/AppSidebar";
import { Latex } from "@/app/_components/Latex";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { type UserProblem } from "@/core/problem/types";
import { useState } from "react";
import { dummyAssignments } from "./dummyData";

export function Root() {
  const [activeProblem, setActiveProblem] = useState<UserProblem | null>(null);
  return (
    <SidebarProvider>
      <AppSidebar
        assignments={dummyAssignments}
        activeProblem={activeProblem}
        setActiveProblem={setActiveProblem}
      />
      <SidebarInset>
        <header className="sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          {activeProblem ? (
            <Latex>{activeProblem.problem}</Latex>
          ) : (
            <span className="text-sm text-muted-foreground">
              No problem selected
            </span>
          )}
        </header>
        <main className="flex-1 p-4">
          {/* @TODO on canvas drawing close the side bar */}
          <Canvas onCheck={() => console.log("CHECKING.....")} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
