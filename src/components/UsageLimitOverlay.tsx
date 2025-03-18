"use client";

import { SignInButton } from "@/app/(auth)/login/_components/SignInButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "next-auth/react";

export function UsageLimitOverlay() {
  const { status } = useSession();
  const isSignedIn = status === "authenticated";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="mx-4 max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            🎉 You have been promoted to customer! 🎉
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center text-base">
            {isSignedIn
              ? `Thanks to your hard work and dedication you are no longer a free tier user. 
              You can now use the app without any limitations forever. 
              Simply follow the link below to accept the promotion.`
              : "You've reached the limit of free usage. Please sign in to continue."}
          </CardDescription>
        </CardContent>
        <CardFooter className="flex justify-center">
          {isSignedIn ? <Button>Accept promotion</Button> : <SignInButton />}
        </CardFooter>
      </Card>
    </div>
  );
}
