"use client";

import { Suspense, useState } from "react";

import { ProblemManagement } from "./ProblemManagement";
import { UserManagement } from "./UserManagement";

export default function ManageUsersPage() {
  const [activeTab, setActiveTab] = useState<"users" | "problems">("users");

  return (
    <div className="flex min-h-screen">
      {/* Sidepanel */}
      <div className="w-32 border-r bg-gray-100 p-4">
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full rounded px-4 py-2 text-left ${
              activeTab === "users"
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-200"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("problems")}
            className={`w-full rounded px-4 py-2 text-left ${
              activeTab === "problems"
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-200"
            }`}
          >
            Problems
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        <Suspense fallback={<div>Loading...</div>}>
          {activeTab === "users" ? <UserManagement /> : <ProblemManagement />}
        </Suspense>
      </div>
    </div>
  );
}
