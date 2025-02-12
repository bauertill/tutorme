"use client";

import Instructions from "@/components/Instructions";
import ChatInterface from "@/components/ChatInterface";
import CodeSandbox from "@/components/CodeSandbox";

export default function Home() {
  return (
    <main className="min-h-screen p-4 grid grid-cols-12 gap-4">
      <div className="col-span-6 bg-gray-100 rounded-lg p-4 overflow-auto scrollbar-hide h-[calc(100vh-2rem)]">
        <Instructions />
      </div>

      <div className="col-span-6 grid grid-rows-2 gap-4 h-[calc(100vh-2rem)]">
        <div className="bg-gray-100 rounded-lg p-4 overflow-auto scrollbar-hide">
          <CodeSandbox />
        </div>
        <div className="bg-gray-100 rounded-lg p-4 overflow-auto scrollbar-hide">
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
