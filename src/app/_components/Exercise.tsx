"use client";
import { api } from "@/trpc/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function Exercise({ exerciseText }: { exerciseText: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use tRPC mutation hook for submitting solution
  const { mutate: submitSolutionMutation, isPending } =
    api.exercise.submitSolution.useMutation({
      onSuccess: () => {
        toast.success("Solution submitted successfully");
        setIsSubmitting(false);
      },
      onError: (error) => {
        toast.error(`Error submitting solution: ${error.message}`);
        setIsSubmitting(false);
      },
    });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to match its display size
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        const ratio = window.devicePixelRatio || 1;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(ratio, ratio);
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#000";
          setContext(ctx);
        }
      }
    };

    window.addEventListener("resize", resize);
    resize();

    return () => window.removeEventListener("resize", resize);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!context) return;
    setIsDrawing(true);

    // Handle both mouse and touch events
    const { x, y } = getCoordinates(e);
    setLastX(x);
    setLastY(y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !context) return;

    // Prevent scrolling on touch devices
    e.preventDefault();

    const { x, y } = getCoordinates(e);

    context.beginPath();
    context.moveTo(lastX, lastY);
    context.lineTo(x, y);
    context.stroke();

    setLastX(x);
    setLastY(y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    // Handle touch events
    if ("touches" in e && e.touches && e.touches.length > 0) {
      // We've verified that touches exists and has at least one item
      return {
        x: e.touches[0]!.clientX - rect.left,
        y: e.touches[0]!.clientY - rect.top,
      };
    }
    // Handle mouse events
    else if ("clientX" in e && "clientY" in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    // Fallback
    return { x: 0, y: 0 };
  };

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const submitSolution = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to base64 image
    const imageData = canvas.toDataURL("image/png");

    // Submit to the server using tRPC
    submitSolutionMutation({
      exerciseText,
      solutionImage: imageData,
    });
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="rounded-lg bg-gray-50 p-4 text-lg leading-relaxed">
        {exerciseText}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Your Solution</h3>
          <div className="flex gap-2">
            <button
              onClick={clearCanvas}
              className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm transition-colors hover:bg-gray-200"
            >
              Clear
            </button>
            <button
              onClick={submitSolution}
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Solution"}
            </button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="h-[400px] w-full rounded-lg border-2 border-gray-200"
          style={{ touchAction: "none" }} // This specific style is needed for touch functionality
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  );
}
