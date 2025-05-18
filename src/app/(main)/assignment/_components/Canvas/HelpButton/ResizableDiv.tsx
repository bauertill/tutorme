import { cn } from "@/lib/utils";
import React, { useCallback, useEffect, useRef, useState } from "react";

export default function ResizableDiv({
  minWidth = 300,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  minWidth?: number;
}) {
  const [width, setWidth] = useState<number>();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  const startDragging = () => {
    isDraggingRef.current = true;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", stopDragging);
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", stopDragging);
  };

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const containerRight = containerRef.current.getBoundingClientRect().right;
      const newWidth = containerRight - e.clientX;
      setWidth(Math.max(minWidth, newWidth));
    },
    [minWidth],
  );

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (
        !isDraggingRef.current ||
        !containerRef.current ||
        e.touches.length === 0
      )
        return;
      const containerRight = containerRef.current.getBoundingClientRect().right;
      const touchX = e.touches[0]?.clientX;
      if (!touchX) return;
      const newWidth = containerRight - touchX;
      setWidth(Math.max(minWidth, newWidth));
    },
    [minWidth],
  );

  const stopDragging = useCallback(() => {
    isDraggingRef.current = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", stopDragging);
    document.removeEventListener("touchmove", onTouchMove);
    document.removeEventListener("touchend", stopDragging);
  }, [onMouseMove, onTouchMove]);

  useEffect(() => {
    return () => stopDragging();
  }, [stopDragging]);

  return (
    <div className="relative flex">
      <div
        onMouseDown={startDragging}
        onTouchStart={startDragging}
        className="border-1 absolute -left-0.5 top-0 z-20 flex h-full w-1.5 cursor-ew-resize items-center justify-center"
      >
        <div className="h-12 w-full rounded-full bg-gray-400" />
      </div>

      <div
        ref={containerRef}
        style={{ width }}
        className={cn("relative flex", props.className)}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}
