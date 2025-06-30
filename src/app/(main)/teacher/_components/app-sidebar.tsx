"use client";

import {
  Activity,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardList,
  GraduationCap,
  Home,
  Settings,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import type * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarText,
  useSidebar,
} from "@/components/ui/sidebar";

const navMain = [
  { title: "Dashboard", url: "/teacher", icon: Home },
  { title: "Books", url: "/teacher/books", icon: BookOpen },
  { title: "Students", url: "/teacher/students", icon: Users },
  { title: "Groups", url: "/teacher/groups", icon: UserCheck },
  { title: "Assignments", url: "/teacher/assignments", icon: ClipboardList },
  { title: "Results", url: "/teacher/results", icon: BarChart3 },
  {
    title: "Semester Planning",
    url: "/teacher/semester-planning",
    icon: Calendar,
  },
  { title: "Activities", url: "/teacher/activities", icon: Activity },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header */}
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <ArrowLeft className="h-5 w-5 shrink-0" />
            <SidebarText className="text-sm text-muted-foreground">
              Back to App
            </SidebarText>
          </Link>
        </div>
        <div className="flex items-center gap-2 border-t px-2 py-2">
          <GraduationCap className="h-6 w-6 shrink-0" />
          <SidebarText className="font-semibold">Teacher Dashboard</SidebarText>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="overflow-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div>
                <Settings />
                <span>Settings</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
