import { Button } from "@/components/ui/button";

export default function RandomProblemButton({
  children = "Work on an Example Problem",
  ...props
}: React.ComponentProps<typeof Button>) {
  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("clicked");
  };
  return (
    <Button {...props} onClick={onClick}>
      {children}
    </Button>
  );
}
