"use client";

import { Suspense, useState } from "react";

import { SidebarText } from "@/components/ui/sidebar";
import { ProblemManagement } from "./ProblemManagement";
import { StudentManagement } from "./StudentManagement";

export default function ManageStudentsPage() {
  const [activeTab, setActiveTab] = useState<"students" | "problems">(
    "students",
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidepanel */}
      <div className="m-2 w-32 border-r">
        <button
          onClick={() => setActiveTab("students")}
          className={`w-full rounded px-4 py-2 text-left ${
            activeTab === "students"
              ? "bg-primary-foreground text-primary"
              : "hover:bg-gray-200"
          }`}
        >
          <SidebarText>Students</SidebarText>
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
          {activeTab === "students" ? (
            <StudentManagement />
          ) : (
            <ProblemManagement />
          )}
        </Suspense>
      </div>
    </div>
  );
}
