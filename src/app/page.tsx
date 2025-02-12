'use client';

import Instructions from "@/components/Instructions";
import ChatInterface from "@/components/ChatInterface";
import CodeSandbox from "@/components/CodeSandbox";

export default function Home() {
  return (
    <main className="min-h-screen p-4 grid grid-cols-12 gap-4">
      <div className="col-span-3 bg-gray-100 rounded-lg p-4">
        <Instructions />
      </div>
      
      <div className="col-span-3 bg-gray-100 rounded-lg p-4">
        <CodeSandbox />
      </div><div className="col-span-6 bg-gray-100 rounded-lg p-4">
        <ChatInterface />
      </div>
    </main>
  );
}
