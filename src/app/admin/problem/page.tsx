"use client";

import ProblemFileUpload from "./_components/ProblemFileUpload";
import { SearchProblems } from "./_components/SearchProblems";

export default function AdminProblemPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Problem Management</h1>

      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Upload Problems</h2>
        <ProblemFileUpload />
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Search Problems</h2>
        <SearchProblems />
      </div>
    </div>
  );
}
