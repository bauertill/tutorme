"use client"

import type * as React from "react"
import {
  BookOpen,
  Users,
  UserCheck,
  ClipboardList,
  BarChart3,
  Home,
  Settings,
  GraduationCap,
  Calendar,
  Activity,
} from "lucide-react"
import Link from "next/link"

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
  useSidebar,
} from "@/components/ui/sidebar"

const navMain = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Books", url: "/books", icon: BookOpen },
  { title: "Students", url: "/students", icon: Users },
  { title: "Groups", url: "/groups", icon: UserCheck },
  { title: "Assignments", url: "/assignments", icon: ClipboardList },
  { title: "Results", url: "/results", icon: BarChart3 },
  { title: "Semester Planning", url: "/semester-planning", icon: Calendar },
  { title: "Activities", url: "/activities", icon: Activity },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header */}
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <GraduationCap className="h-6 w-6 shrink-0" />
          {state === "expanded" && <span className="font-semibold">Teacher Dashboard</span>}
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
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
