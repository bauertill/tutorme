import { Latex } from "@/app/_components/richtext/Latex";
import { Button } from "@/components/ui/button";
import { type UserProblem } from "@/core/assignment/types";
import { useStore } from "@/store";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ImageSegmentRendererProps {
  imageUrl: string;
  segment: {
    topLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
  };
  problemId: string;
  assignmentId: string;
}

function ImageSegmentRenderer({
  imageUrl,
  segment,
  problemId,
  assignmentId,
}: ImageSegmentRendererProps) {
  const IMAGE_HEIGHT = 240;
  // Calculate the crop percentages
  const left = segment.topLeft.x * 100;
  const top = segment.topLeft.y * 100;
  const width = (segment.bottomRight.x - segment.topLeft.x) * 100;
  const height = (segment.bottomRight.y - segment.topLeft.y) * 100;
  const totalWidth = (100 / width) * 100;
  const totalHeight = (100 / height) * 100;
  console.log("TOTAL WIDTH", totalWidth);
  console.log("TOTAL HEIGHT", totalHeight);

  // Calculate the aspect ratio of the cropped segment
  const [originalAspectRatio, setOriginalAspectRatio] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setOriginalAspectRatio(img.naturalWidth / img.naturalHeight);
  };

  const startDragging = (
    e: React.MouseEvent | React.TouchEvent | React.PointerEvent,
  ) => {
    setIsDragging(true);
    if ("touches" in e && e.touches[0]) {
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if ("clientX" in e) {
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMove = (
    e: React.MouseEvent | React.TouchEvent | React.PointerEvent,
  ) => {
    if (!isDragging) return;

    let clientX: number, clientY: number;

    if ("touches" in e && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return;
    }

    const containerWidth = originalAspectRatio * IMAGE_HEIGHT;
    const containerHeight = IMAGE_HEIGHT;
    const deltaX = ((clientX - dragStart.x) / containerWidth) * 100;
    const deltaY = ((clientY - dragStart.y) / containerHeight) * 100;

    const minOffsetX = segment.bottomRight.x * totalWidth - totalWidth;
    const maxOffsetX = segment.topLeft.x * totalWidth;
    const minOffsetY = segment.bottomRight.y * totalHeight - totalHeight;
    const maxOffsetY = segment.topLeft.y * totalHeight;

    setOffset((prev) => {
      let newX = prev.x + deltaX;
      if (newX > maxOffsetX) newX = maxOffsetX;
      if (newX < minOffsetX) newX = minOffsetX;

      let newY = prev.y + deltaY;
      if (newY > maxOffsetY) newY = maxOffsetY;
      if (newY < minOffsetY) newY = minOffsetY;
      return { x: newX, y: newY };
    });

    setDragStart({ x: clientX, y: clientY });
  };

  const updateProblem = useStore.use.updateProblem();
  const handleZoom = (zoomFactor: number) => {
    updateProblem({
      id: problemId,
      assignmentId,
      relevantImageSegment: {
        topLeft: segment.topLeft,
        bottomRight: {
          x: Math.min(segment.bottomRight.x * zoomFactor, 1),
          y: Math.min(segment.bottomRight.y * zoomFactor, 1),
        },
      },
    });
  };
  // Update the problem when the component unmounts or the offset changes
  useEffect(() => {
    const handleUpdate = () => {
      const deltaX = -offset.x / totalWidth;
      const deltaY = -offset.y / totalHeight;

      updateProblem({
        id: problemId,
        assignmentId,
        relevantImageSegment: {
          topLeft: {
            x: segment.topLeft.x + deltaX,
            y: segment.topLeft.y + deltaY,
          },
          bottomRight: {
            x: segment.bottomRight.x + deltaX,
            y: segment.bottomRight.y + deltaY,
          },
        },
      });
    };

    // Update when component unmounts or problem changes
    return () => {
      if (offset.x !== 0 || offset.y !== 0) {
        handleUpdate();
        setOffset({ x: 0, y: 0 });
      }
    };
  }, [
    problemId,
    offset,
    totalWidth,
    totalHeight,
    segment,
    assignmentId,
    updateProblem,
  ]);

  const stopDragging = () => setIsDragging(false);

  return (
    <div className="relative">
      <div
        className="absolute z-10 mt-8 touch-none overflow-hidden rounded-md"
        style={{
          height: `${IMAGE_HEIGHT}px`,
          width: `${IMAGE_HEIGHT * originalAspectRatio}px`,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={startDragging}
        onTouchStart={startDragging}
        onPointerDown={startDragging}
        onMouseMove={handleMove}
        onTouchMove={handleMove}
        onPointerMove={handleMove}
        onMouseUp={stopDragging}
        onTouchEnd={stopDragging}
        onPointerUp={stopDragging}
        onMouseLeave={stopDragging}
        onTouchCancel={stopDragging}
        onPointerCancel={stopDragging}
      >
        <div
          className="absolute"
          style={{
            width: `${totalWidth}%`,
            height: `${totalHeight}%`,
            left: `${(-left / width) * 100 + offset.x}%`,
            top: `${(-top / height) * 100 + offset.y}%`,
            transition: isDragging ? "none" : "all 0.1s ease-out",
          }}
        >
          <Image
            src={imageUrl}
            alt="Problem image"
            priority
            width={IMAGE_HEIGHT * width * originalAspectRatio}
            height={IMAGE_HEIGHT * height}
            style={{}}
            onLoad={handleImageLoad}
            draggable={false}
          />
        </div>
        <div className="absolute right-2 top-2 z-20 flex flex-col gap-2">
          <Button
            className="shadow-md"
            variant="outline"
            size="sm"
            onClick={() => handleZoom(3 / 4)}
            disabled={totalWidth > 1000}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            className="shadow-md"
            variant="outline"
            size="sm"
            onClick={() => handleZoom(4 / 3)}
            disabled={totalWidth < 100}
          >
            <Minus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProblemRenderer({ problem }: { problem: UserProblem }) {
  const hasRelevantImageSegment =
    problem.imageUrl && problem.relevantImageSegment;

  return (
    <div>
      <div className="current-problem flex flex-row items-center gap-1">
        <span className="mr-1 text-muted-foreground">
          {problem.problemNumber}
        </span>
        <Latex className="whitespace-pre-wrap">{problem.problem}</Latex>
      </div>
      {hasRelevantImageSegment &&
        problem.imageUrl &&
        problem.relevantImageSegment && (
          <ImageSegmentRenderer
            imageUrl={problem.imageUrl}
            segment={problem.relevantImageSegment}
            problemId={problem.id}
            assignmentId={problem.assignmentId}
          />
        )}
    </div>
  );
}
