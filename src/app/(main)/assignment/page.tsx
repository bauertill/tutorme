"use client";
import { AppSidebar } from "@/app/_components/AppSidebar";
import { Latex } from "@/app/_components/Latex";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useActiveAssignment } from "@/store/selectors";
import Exercise from "./_components/Exercise";

export default function AssignmentPage() {
  const activeAssignment = useActiveAssignment();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          {activeAssignment ? (
            <Latex>{activeAssignment.name}</Latex>
          ) : (
            <span className="text-sm text-muted-foreground">
              No assignment selected
            </span>
          )}
        </header>
        <main className="h-full">
          {/* @TODO on canvas drawing close the side bar */}
          <Exercise />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
