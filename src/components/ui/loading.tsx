import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
      <span className="text-sm">Loading...</span>
    </div>
  );
}
