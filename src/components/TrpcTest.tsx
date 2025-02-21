"use client";

import { trpc } from "./providers/TrpcProvider";

export function TrpcTest() {
  const hello = trpc.test.hello.useQuery({ name: "tRPC" });

  if (!hello.data) return <div>Loading...</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">tRPC Test</h2>
      <p>{hello.data.greeting}</p>
      <p className="text-sm text-gray-500">Timestamp: {hello.data.timestamp}</p>
    </div>
  );
}
