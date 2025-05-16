import NextAuth from "next-auth";
import { cache } from "react";

import { redirect } from "next/navigation";
import { authConfig } from "./config";

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);

const auth = cache(uncachedAuth);

export const ADMINS = [
  "max@mxgr.de",
  "bauertill@gmail.com",
  "maksymiukdavid@gmail.com",
];

export const requireSession = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
};

export const requireAdminSession = async () => {
  const session = await requireSession();
  if (!ADMINS.includes(session.user.email ?? "")) {
    throw new Error("Unauthorized");
  }

  return session;
};

export { auth, handlers, signIn, signOut };
