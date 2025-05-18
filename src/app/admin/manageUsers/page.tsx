"use client";

import { Suspense, useState } from "react";

import { SidebarText } from "@/components/ui/sidebar";
import { ProblemManagement } from "./ProblemManagement";
import { UserManagement } from "./UserManagement";

export default function ManageUsersPage() {
  const [activeTab, setActiveTab] = useState<"users" | "problems">("users");

  return (
    <div className="flex min-h-screen">
      {/* Sidepanel */}
      <div className="m-2 w-32 border-r">
        <button
          onClick={() => setActiveTab("users")}
          className={`w-full rounded px-4 py-2 text-left ${
            activeTab === "users"
              ? "bg-primary-foreground text-primary"
              : "hover:bg-gray-200"
          }`}
        >
          <SidebarText>Users</SidebarText>
        </button>
        <button
          onClick={() => setActiveTab("problems")}
          className={`w-full rounded px-4 py-2 text-left ${
            activeTab === "problems"
              ? "bg-primary-foreground text-primary"
              : "hover:bg-gray-200"
          }`}
        >
          <SidebarText>Problems</SidebarText>
        </button>
      </div>

      {/* Main content */}
      <div className="m-2 flex-1">
        <Suspense fallback={<div>Loading...</div>}>
          {activeTab === "users" ? <UserManagement /> : <ProblemManagement />}
        </Suspense>
      </div>
    </div>
  );
}
