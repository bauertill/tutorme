import { LanguagePicker } from "@/app/_components/user/LanguagePicker";
import { SignInButton } from "@/app/_components/user/SignInButton";
import { UserAndSignOutButton } from "@/app/_components/user/UserAndSignOutButton";
import { Trans, useTranslation } from "@/i18n";
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
  const { t } = useTranslation();
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">
          <Trans i18nKey="welcome_to_tutor_me_good" />
        </h1>
        <p className="text-justify text-muted-foreground">
          <Trans i18nKey="welcome_to_tutor_me_good_description" />
        </p>
      </div>
      <div className="flex flex-col items-center justify-center gap-6">
        <ExampleProblemCard />
        <UploadProblems trigger="card" />
      </div>

      <div className="mt-40 flex flex-col items-center gap-10">
        {user ? (
          <UserAndSignOutButton user={user} />
        ) : (
          <SignInButton variant="ghost" className="w-full">
            {t("already_have_account")}
          </SignInButton>
        )}
        <LanguagePicker />
      </div>
    </form>
  );
}
