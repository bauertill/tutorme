"use client";
import Loader from "@/components/ui/loading";
import {
  getSession,
  SessionProvider as NextAuthSessionProvider,
  signIn,
  signOut,
  useSession,
} from "next-auth/react";
import { useEffect } from "react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <InnerSessionProvider>{children}</InnerSessionProvider>
    </NextAuthSessionProvider>
  );
}

function InnerSessionProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  useEffect(() => {
    void getSession().then((session) => {
      if (!session) {
        void signInAnon();
      } else {
        setIsSigningInWithGoogle(false);
      }
    });
  }, []);
  if (!session) {
    return <Loader />;
  }
  return <>{children}</>;
}

export function useAuth() {
  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === "unauthenticated" && !isSigningInWithGoogle()) {
      void signInAnon();
    }
  }, [status]);
  return {
    session,
    isAnon: session?.user?.email?.endsWith("@anon.tutormegood.com"),
    signInWithGoogle: async () => {
      setIsSigningInWithGoogle(true);
      try {
        await signOut({ redirect: false });
        await signIn("google");
      } catch (error) {
        console.error("Error signing in with google", error);
        setIsSigningInWithGoogle(false);
      }
    },
  };
}

async function signInAnon() {
  let anonToken = localStorage.getItem("anonToken");
  if (!anonToken) {
    anonToken = crypto.randomUUID();
    localStorage.setItem("anonToken", anonToken);
  }
  console.log("Signing in with anon token", anonToken);
  void signIn("credentials", {
    anonToken,
    redirect: false,
  });
}

function isSigningInWithGoogle() {
  return localStorage.getItem("isSigningInWithGoogle") === "true";
}

function setIsSigningInWithGoogle(value: boolean) {
  if (value) {
    localStorage.setItem("isSigningInWithGoogle", "true");
  } else {
    localStorage.removeItem("isSigningInWithGoogle");
  }
}
