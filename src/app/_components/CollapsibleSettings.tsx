"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { Settings, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export function CollapsibleSettings() {
  const setAssignmentsLocal = useStore.use.setAssignments();
  const [isOpen, setIsOpen] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Reset the slider when completed animation finishes
  useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(() => {
        setIsCompleted(false);
        setSlideProgress(0);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isCompleted]);

  const handleSlideStart = () => {
    if (isCompleted) return;
    setIsDragging(true);
  };

  const handleSlideMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || isCompleted) return;

    // Get the slider element
    const slider = e.currentTarget as HTMLDivElement;
    const rect = slider.getBoundingClientRect();

    // Calculate position based on mouse or touch event
    let clientX: number;
    if ("touches" in e && e.touches[0]) {
      clientX = e.touches[0].clientX;
    } else if ("clientX" in e) {
      clientX = e.clientX;
    } else {
      return; // Exit if we can't determine position
    }

    // Calculate progress (0 to 1)
    const progress = Math.min(
      Math.max((clientX - rect.left) / rect.width, 0),
      1,
    );

    setSlideProgress(progress);

    // If slid to the end, clear local state
    if (progress >= 0.95) {
      setAssignmentsLocal([]);
      setIsCompleted(true);
      setIsDragging(false);
    }
  };

  const handleSlideEnd = () => {
    if (isCompleted) return;
    setIsDragging(false);
    // Reset if not completed
    if (slideProgress < 0.95) {
      setSlideProgress(0);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent">
        <Settings
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
        <span className="font-semibold">Settings</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-1 pl-6">
          <div className="mt-2">
            <div className="mb-2 text-sm text-muted-foreground">
              {isCompleted
                ? "Local state cleared!"
                : "Slide to clear local state"}
            </div>
            <div
              className={cn(
                "relative h-10 w-full cursor-pointer overflow-hidden rounded-md bg-muted transition-colors duration-300",
                isCompleted && "bg-green-100 dark:bg-green-950",
              )}
              onMouseDown={handleSlideStart}
              onMouseMove={handleSlideMove}
              onMouseUp={handleSlideEnd}
              onMouseLeave={handleSlideEnd}
              onTouchStart={handleSlideStart}
              onTouchMove={handleSlideMove}
              onTouchEnd={handleSlideEnd}
            >
              {/* Slider track */}
              <div
                className={cn(
                  "absolute inset-0 ml-10 flex items-center px-3 text-sm text-muted-foreground transition-opacity duration-300",
                  (slideProgress > 0 || isCompleted) && "opacity-0",
                )}
              >
                Slide to clear →
              </div>

              {/* Slider thumb */}
              <div
                className={cn(
                  "overflow:hidden absolute left-0 top-0 flex h-full items-center transition-all duration-300",
                  isCompleted ? "w-full bg-green-500/20" : "bg-destructive/20",
                )}
                style={
                  !isCompleted
                    ? { width: `${slideProgress * 100}%` }
                    : undefined
                }
              >
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center text-sm font-medium transition-colors duration-300",
                    isCompleted
                      ? "text-green-600 dark:text-green-400"
                      : "text-destructive",
                  )}
                >
                  {isCompleted
                    ? "Cleared successfully!"
                    : slideProgress < 0.95
                      ? "Slide to clear →"
                      : "Release to clear"}
                </div>
              </div>

              {/* Slider handle */}
              <div
                className={cn(
                  "absolute top-0 flex aspect-square h-full items-center justify-center rounded-md shadow-md transition-all duration-300",
                  isCompleted
                    ? "left-[calc(100%-2.5rem)] bg-green-500"
                    : "bg-destructive",
                )}
                style={
                  !isCompleted
                    ? {
                        left: `calc(${slideProgress * 100}% - ${slideProgress * 20}px)`,
                        transform:
                          slideProgress >= 0.95 ? "scale(1.1)" : "scale(1)",
                      }
                    : undefined
                }
              >
                {isCompleted ? (
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <Trash2 className="h-4 w-4 text-white" />
                )}
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
