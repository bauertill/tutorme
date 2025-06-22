"use client";

import { SignInButton } from "@/app/_components/user/SignInButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/react-auth";
import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { skipToken } from "@tanstack/react-query";
import { useEffect } from "react";
import { CheckoutWithStripe } from "./CheckoutWithStripe";

export function UsageLimitOverlay() {
  const { session, isAnon } = useAuth();
  const isUsageLimitReached = useStore.use.isUsageLimitReached();
  const setUsageLimitReached = useStore.use.setUsageLimitReached();
  const isSignedIn = session && !isAnon;
  const { data: isSubscribed } = api.subscription.isSubscribed.useQuery(
    isSignedIn ? undefined : skipToken,
  );

  useEffect(() => {
    if (isSubscribed) {
      setUsageLimitReached(false);
    }
  }, [isSubscribed, setUsageLimitReached]);

  const title = isSignedIn
    ? "🎉 You have been promoted to customer! 🎉"
    : "You have used up your free tries";

  const description = isSignedIn
    ? `You've reached the limit of free usage.
    Upgrade now to keep using the app without any limitations.`
    : "Get more free tries now by signing in.";

  if (!isUsageLimitReached) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="max-w-xl space-y-2 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-justify text-base">
            {description}
          </CardDescription>
        </CardContent>
        <CardFooter className="flex justify-center">
          {isSignedIn ? (
            <CheckoutWithStripe />
          ) : (
            <SignInButton
              className="mx-auto flex justify-center"
              variant="default"
            />
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
