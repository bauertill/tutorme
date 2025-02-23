import NextAuth from "next-auth";
import { cache } from "react";

import { redirect } from "next/navigation";
import { authConfig } from "./config";

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);

const auth = cache(uncachedAuth);

export const requireSession = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
};

export { auth, handlers, signIn, signOut };
