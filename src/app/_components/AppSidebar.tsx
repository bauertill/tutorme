"use client";
import {
  Bell,
  Calendar,
  FileText,
  HelpCircle,
  Home,
  LayoutDashboard,
  Mail,
  Settings,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// Sample navigation data
const navigationItems = [
  { name: "Dashboard", href: "#", icon: LayoutDashboard, current: true },
  { name: "Home", href: "#", icon: Home, current: false },
  { name: "Team", href: "#", icon: Users, current: false },
  { name: "Messages", href: "#", icon: Mail, current: false },
  { name: "Calendar", href: "#", icon: Calendar, current: false },
  { name: "Documents", href: "#", icon: FileText, current: false },
];

const secondaryNavigation = [
  { name: "Settings", href: "#", icon: Settings },
  { name: "Help", href: "#", icon: HelpCircle },
];

export function AppSidebar() {
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
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={item.current}>
                    <a href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Notifications</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {secondaryNavigation.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <a href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <div className="mt-auto p-2">
          <div className="flex items-center gap-2 rounded-md p-2 hover:bg-accent">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src="/placeholder.svg?height=32&width=32"
                alt="User"
              />
              <AvatarFallback>US</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium">User Name</span>
              <span className="text-xs text-muted-foreground">
                user@example.com
              </span>
            </div>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
