import { SignInButton } from "@/app/(auth)/login/_components/SignInButton";
import { cn } from "@/lib/utils";
import RandomProblemButton from "./Problem/RandomProblemButton";
import { UploadProblems } from "./Problem/UploadProblems";

export function OnboardingForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
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
        <RandomProblemButton variant="default" className="w-full" />
        <UploadProblems variant="outline" className="w-full" />
      </div>
      <div className="grid gap-6">
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Already have an Account?
          </span>
        </div>
      </div>
      <div className="grid gap-6">
        <SignInButton variant="outline" className="w-full" />
      </div>
    </form>
  );
}
