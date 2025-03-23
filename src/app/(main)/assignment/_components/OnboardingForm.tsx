import { SignInButton } from "@/app/_components/SignInButton";
import { UserAndSignOutButton } from "@/app/_components/UserAndSignOutButton";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import ExampleProblemButton from "./Problem/ExampleProblemButton";
import { UploadProblems } from "./Problem/UploadProblems";
export function OnboardingForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const { data: session } = useSession();
  const user = session?.user;
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">
          Welcome to
          <br />
          Tutor Me Good!
        </h1>
        <p className="text-justify text-muted-foreground">
          Your AI powered Math Homework Assistant. Learn faster with
          personalized tutoring.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center gap-6">
        <ExampleProblemButton variant="default" className="w-full" />
        <UploadProblems variant="outline" className="w-full" />
      </div>

      <div className="mt-40 grid gap-6">
        {user ? (
          <UserAndSignOutButton user={user} />
        ) : (
          <SignInButton
            overrideButtonText="I already have an account"
            variant="ghost"
            className="w-full"
            hideGoogleIcon
          />
        )}
      </div>
    </form>
  );
}
