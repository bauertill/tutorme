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
    <form className={cn("flex flex-col gap-14", className)} {...props}>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">
          <Trans i18nKey="welcome_to_tutor_me_good" />
        </h1>
        <p className="text-justify text-muted-foreground">
          <Trans i18nKey="welcome_to_tutor_me_good_description" />
        </p>
      </div>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <p className="font-semibold">
            <Trans i18nKey="upload_problems_card_description" />
          </p>
          <UploadProblems variant="default" size="lg" className="w-full" />
        </div>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Oder
          </span>
        </div>

        <ExampleProblemCard />
      </div>

      <div className="mt-40 flex flex-col gap-10">
        <div>
          {user ? (
            <UserAndSignOutButton user={user} />
          ) : (
            <SignInButton variant="outline" className="justify-start">
              {t("already_have_account")}
            </SignInButton>
          )}
        </div>
        <LanguagePicker />
      </div>
    </form>
  );
}
