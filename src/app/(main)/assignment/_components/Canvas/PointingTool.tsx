import { cn } from "@/lib/utils";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { type Point } from "./utils";

export default memo(function PointingTool({
  children,
  onDraw,
  onStartDrawing,
  onStopDrawing,
  onCancelDrawing,
  transform,
  ...props
}: {
  children?: React.ReactNode;
  onDraw?: (position: { x: number; y: number }) => void;
  onStartDrawing?: (position: { x: number; y: number }) => void;
  onStopDrawing?: () => void;
  onCancelDrawing?: () => void;
  transform?: (position: { x: number; y: number }) => { x: number; y: number };
} & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const startDrawing = (pos: Point) => {
      setIsDrawing(true);
      const transformedPos = transform?.(pos);
      onStartDrawing?.(transformedPos ?? pos);
    };

    const draw = (pos: Point) => {
      if (!isDrawing) return;
      const transformedPos = transform?.(pos);
      onDraw?.(transformedPos ?? pos);
    };

    const stopDrawing = () => {
      setIsDrawing(false);
      onStopDrawing?.();
    };

    const cancelDrawing = () => {
      setIsDrawing(false);
      onCancelDrawing?.();
    };

    const handleMouseMove = (e: MouseEvent) => {
      draw({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Only start drawing with left mouse button
      if (e.button !== 0) return;
      startDrawing({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => {
      setIsMouseOver(true);
    };

    const handleMouseLeave = () => {
      setIsMouseOver(false);
      stopDrawing();
    };

    const handleMouseUp = () => {
      stopDrawing();
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        cancelDrawing();
        return;
      }
      const touch = e.touches[0];
      if (!touch) return;
      startDrawing({ x: touch.clientX, y: touch.clientY });
      setIsMouseOver(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        cancelDrawing();
        return;
      }
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      draw({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = () => {
      stopDrawing();
      setIsMouseOver(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: false });
    el.addEventListener("mousedown", handleMouseDown, { passive: false });
    el.addEventListener("mouseup", handleMouseUp, { passive: false });
    el.addEventListener("mouseenter", handleMouseEnter, { passive: false });
    el.addEventListener("mouseleave", handleMouseLeave, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: false });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("mouseup", handleMouseUp);
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    onStartDrawing,
    onStopDrawing,
    onDraw,
    onCancelDrawing,
    isDrawing,
    transform,
  ]);

  return useMemo(
    () => (
      <div ref={ref} {...props}>
        {children && isMouseOver && (
          <CursorContainer isDrawing={isDrawing} transform={transform}>
            {children}
          </CursorContainer>
        )}
      </div>
    ),
    [children, props, isDrawing, transform, isMouseOver],
  );
});

const CursorContainer = function CursorContainer({
  children,
  isDrawing,
  transform,
}: {
  children: React.ReactNode;
  isDrawing: boolean;
  transform?: (position: { x: number; y: number }) => { x: number; y: number };
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const pos = { x: e.clientX, y: e.clientY };
      const transformedPos = transform?.(pos) ?? pos;
      el.style.left = `${transformedPos.x}px`;
      el.style.top = `${transformedPos.y}px`;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const el = ref.current;
      if (!el) return;
      const touch = e.touches[0];
      if (!touch) return;
      const pos = { x: touch.clientX, y: touch.clientY };
      const transformedPos = transform?.(pos) ?? pos;
      el.style.left = `${transformedPos.x}px`;
      el.style.top = `${transformedPos.y}px`;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [transform]);
  return (
    <div
      ref={ref}
      className={cn(
        "group pointer-events-none absolute z-50",
        isDrawing && "is-drawing",
      )}
      data-drawing={isDrawing}
    >
      {children}
    </div>
  );
};
