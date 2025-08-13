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
    // Add a small delay to allow Google OAuth to complete
    const timer = setTimeout(() => {
      void getSession().then((session) => {
        console.log("🔍 InnerSessionProvider Debug:", {
          hasSession: !!session,
          userEmail: session?.user?.email,
          isSigningInWithGoogle: isSigningInWithGoogle(),
        });

        if (!session && !isSigningInWithGoogle()) {
          console.log("🔄 Creating anonymous session");
          void signInAnon();
        } else {
          console.log(
            "✅ Session exists or signing in with Google, clearing flag",
          );
          setIsSigningInWithGoogle(false);
        }
      });
    }, 100);

    return () => clearTimeout(timer);
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
  console.log("🔍 signInAnon Debug:", {
    existingToken: !!anonToken,
    tokenValue: anonToken,
  });

  if (!anonToken) {
    anonToken = crypto.randomUUID();
    localStorage.setItem("anonToken", anonToken);
    console.log("🆕 Generated new anonToken:", anonToken);
  } else {
    console.log("♻️ Reusing existing anonToken:", anonToken);
  }

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
