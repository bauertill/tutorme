import { GraduationCap } from "lucide-react";
import Image from "next/image";
import { OnboardingForm } from "./OnboardingForm";

export default function Onboarding() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-8 p-6 md:p-10 md:pb-20">
        <div className="flex justify-start gap-2">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap className="size-4" />
            </div>
            Tutor Me Good
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-full w-full max-w-sm">
            <OnboardingForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/login.webp"
          alt="Image"
          width={1024}
          height={1024}
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
