import { Latex } from "@/app/_components/richtext/Latex";
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

  // Calculate the aspect ratio of the cropped segment
  const [originalAspectRatio, setOriginalAspectRatio] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setOriginalAspectRatio(img.naturalWidth / img.naturalHeight);
  };

  const startDragging = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const containerWidth = originalAspectRatio * IMAGE_HEIGHT;
    const containerHeight = IMAGE_HEIGHT;
    const deltaX = ((e.clientX - dragStart.x) / containerWidth) * 100;
    const deltaY = ((e.clientY - dragStart.y) / containerHeight) * 100;

    // NOTE the offset is negative because we are moving the image segment to the left and up
    // e.g. shifted 200% to the right means the offset is -200
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

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const updateProblem = useStore.use.updateProblem();
  const handleZoom = (zoomFactor: number) => {
    const newBottomRight = {
      x:
        segment.bottomRight.x * zoomFactor > 1
          ? 1
          : segment.bottomRight.x * zoomFactor,
      y:
        segment.bottomRight.y * zoomFactor > 1
          ? 1
          : segment.bottomRight.y * zoomFactor,
    };
    updateProblem({
      id: problemId,
      assignmentId,
      relevantImageSegment: {
        topLeft: segment.topLeft,
        bottomRight: newBottomRight,
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
        className="absolute z-10 mt-8 overflow-hidden rounded-md"
        style={{
          height: `${IMAGE_HEIGHT}px`,
          width: `${IMAGE_HEIGHT * originalAspectRatio}px`,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={startDragging}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
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
        <div className="absolute left-2 top-2 z-20 flex flex-col gap-2">
          <button
            className="rounded-full bg-background p-2 shadow-md hover:bg-accent"
            onClick={() => handleZoom(0.75)}
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            className="rounded-full bg-background p-2 shadow-md hover:bg-accent"
            onClick={() => handleZoom(1.5)}
          >
            <Minus className="h-4 w-4" />
          </button>
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
