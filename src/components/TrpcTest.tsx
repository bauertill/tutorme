"use client";

import { trpc } from "./providers/TrpcProvider";
import { useSession } from "next-auth/react";

export function TrpcTest() {
  const { data: session } = useSession();
  const hello = trpc.test.hello.useQuery({ name: "tRPC" });
  const secretMessage = trpc.test.getSecretMessage.useQuery(undefined, {
    enabled: !!session, // Only run query if user is logged in
  });

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-2">Public Endpoint Test</h2>
        {hello.isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <p>{hello.data?.greeting}</p>
            <p className="text-sm text-gray-500">
              Timestamp: {hello.data?.timestamp}
            </p>
          </>
        )}
      </div>

      <div className="p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-2">Protected Endpoint Test</h2>
        {!session ? (
          <p className="text-gray-500">Sign in to see the secret message</p>
        ) : secretMessage.isLoading ? (
          <p>Loading secret...</p>
        ) : secretMessage.error ? (
          <p className="text-red-500">Error: {secretMessage.error.message}</p>
        ) : (
          <>
            <p>{secretMessage.data?.message}</p>
            <p className="text-sm text-gray-500">
              Your email: {secretMessage.data?.email}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
