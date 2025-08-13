"use client";
import {
  SessionProvider as NextAuthSessionProvider,
  signIn,
  signOut,
  useSession,
} from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <InnerSessionProvider>{children}</InnerSessionProvider>
    </NextAuthSessionProvider>
  );
}

function InnerSessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  const { data: session } = useSession();
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

function setIsSigningInWithGoogle(value: boolean) {
  if (value) {
    localStorage.setItem("isSigningInWithGoogle", "true");
  } else {
    localStorage.removeItem("isSigningInWithGoogle");
  }
}
