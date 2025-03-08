"use client";
import { useEffect, useRef, useState } from "react";

export function useCanvas({
  onChange,
}: {
  onChange: (imageData: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const previousImageData = useRef<string | null>(null);
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);

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

          // Fill canvas with white background
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width / ratio, canvas.height / ratio);
          setIsCanvasEmpty(true);

          setContext(ctx);
        }
      }
    };

    resize();
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
    setIsCanvasEmpty(false);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current && !isCanvasEmpty) {
      const currentImageData = canvasRef.current.toDataURL("image/png");
      if (currentImageData !== previousImageData.current) {
        previousImageData.current = currentImageData;
        console.log("onchange");
        onChange(currentImageData);
      }
    }
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

    // Clear the canvas
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Fill with white background
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    previousImageData.current = null;
    setIsCanvasEmpty(true);
    onChange(null);
  };

  const canvas = (
    <canvas
      ref={canvasRef}
      className="h-[400px] w-full rounded-lg border-2 border-gray-200"
      style={{ touchAction: "none" }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchStartCapture={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );

  return { canvas, clearCanvas };
}
