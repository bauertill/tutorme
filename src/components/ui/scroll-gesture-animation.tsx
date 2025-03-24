import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

export function ScrollGestureAnimation(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn(props.className)}>
      ScrollGestureAnimation
    </div>
  );
}
