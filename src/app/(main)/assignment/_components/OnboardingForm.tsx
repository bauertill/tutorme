import { LanguagePicker } from "@/app/_components/user/LanguagePicker";
import { SignInButton } from "@/app/_components/user/SignInButton";
import { UserAndSignOutButton } from "@/app/_components/user/UserAndSignOutButton";
import { Trans } from "@/i18n/react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import ExampleProblemCard from "./Problem/ExampleProblemCard";
import { UploadProblems } from "./Problem/UploadProblems";
export function OnboardingForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const { data: session } = useSession();
  const user = session?.user;
  return (
    <form
      className={cn(
        "flex h-full flex-col justify-between gap-10 2xl:gap-20",
        className,
      )}
      {...props}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-10 2xl:gap-20">
        <div className="flex flex-col items-center gap-10 text-center">
          <h1 className="w-full text-left text-3xl font-bold 2xl:text-4xl">
            <Trans i18nKey="welcome_to_tutor_me_good" />
          </h1>
          <p className="text-justify text-muted-foreground">
            <Trans i18nKey="welcome_to_tutor_me_good_description" />
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-5 2xl:gap-10">
          <ExampleProblemCard />
          <UploadProblems trigger="card" />
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-10">
        <LanguagePicker />
        <div className="relative w-full text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            <Trans i18nKey="returning_visitor" />
          </span>
        </div>

        {user ? (
          <UserAndSignOutButton user={user} />
        ) : (
          <SignInButton variant="outline" className="w-full">
            <Trans i18nKey="sign_in" />
          </SignInButton>
        )}
      </div>
    </form>
  );
}
