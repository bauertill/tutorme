"use client";

import { cn } from "@/lib/utils";
import { type ComponentPropsWithRef, useEffect, useRef } from "react";

export default function RestrictedScrollContainer(
  props: ComponentPropsWithRef<"div">,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const scrollY = useRef<number>(0);
  const maxScroll = useRef<number>(0);
  useEffect(() => {
    const container =
      typeof props.ref === "function"
        ? containerRef.current
        : (props.ref?.current ?? containerRef.current);
    const content = contentRef.current;
    if (!container || !content) return;

    const updateMaxScroll = () => {
      const containerHeight = container.offsetHeight;
      const contentHeight = content.offsetHeight;
      maxScroll.current = Math.max(0, contentHeight - containerHeight);
    };

    updateMaxScroll();
    window.addEventListener("resize", updateMaxScroll);
    const resizeObserver = new ResizeObserver(updateMaxScroll);
    resizeObserver.observe(content);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches[0] && e.touches[1]) {
        startY.current = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches[0] && e.touches[1]) {
        const deltaY = e.touches[0].clientY - startY.current;
        startY.current = e.touches[0].clientY;
        scrollY.current = scrollY.current - deltaY;
        scrollY.current = Math.max(
          0,
          Math.min(scrollY.current, maxScroll.current),
        );

        container.scrollTop = scrollY.current;
      }
    };

    container.addEventListener("touchstart", onTouchStart, { passive: false });
    container.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      window.removeEventListener("resize", updateMaxScroll);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      resizeObserver.disconnect();
    };
  }, [props.ref]);

  return (
    <div
      ref={props.ref ?? containerRef}
      {...props}
      className={cn("relative overflow-y-auto", props.className)}
    >
      <div ref={contentRef} className="absolute left-0 top-0 w-full">
        {props.children}
      </div>
    </div>
  );
}
