import { cn } from "@/lib/utils";
import { SignInButton } from "./SignInButton";

export function LoginForm({
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
        <p className="text-balance text-justify">
          We use smart AI to create lessons just for you. Learn faster, have
          fun, and reach your goals with our personalized tutoring. Start your
          journey today!
        </p>
      </div>
      <div className="grid gap-6">
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Get Started
          </span>
        </div>
      </div>
      <div className="grid gap-6">
        <SignInButton />
      </div>
    </form>
  );
}
