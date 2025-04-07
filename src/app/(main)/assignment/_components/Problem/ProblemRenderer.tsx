import { Latex } from "@/app/_components/richtext/Latex";
import { type UserProblem } from "@/core/assignment/types";
import Image from "next/image";
import { useState } from "react";

interface ImageSegmentRendererProps {
  imageUrl: string;
  segment: {
    topLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
  };
}

function ImageSegmentRenderer({
  imageUrl,
  segment,
}: ImageSegmentRendererProps) {
  const IMAGE_HEIGHT = 240;
  // Calculate the crop percentages
  const left = segment.topLeft.x * 100;
  const top = segment.topLeft.y * 100;
  const width = (segment.bottomRight.x - segment.topLeft.x) * 100;
  const height = (segment.bottomRight.y - segment.topLeft.y) * 100;

  // Calculate the aspect ratio of the cropped segment
  const [originalAspectRatio, setOriginalAspectRatio] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Function to calculate original aspect ratio
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setOriginalAspectRatio(img.naturalWidth / img.naturalHeight);
  };

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    // Calculate the movement as percentage of the visible area
    const containerWidth = originalAspectRatio * IMAGE_HEIGHT;
    const containerHeight = IMAGE_HEIGHT;

    const deltaX = ((e.clientX - dragStart.x) / containerWidth) * 100;
    const deltaY = ((e.clientY - dragStart.y) / containerHeight) * 100;

    // Calculate constraints to prevent seeing outside the image
    // These ensure we never see black space outside the image boundaries
    const maxOffsetX = 0; // Right edge (can't go beyond right edge of image)
    const minOffsetX = 100 - (100 / width) * 100; // Left edge (can't go beyond left edge of image)
    const maxOffsetY = 0; // Bottom edge (can't go beyond bottom edge of image)
    const minOffsetY = 100 - (100 / height) * 100; // Top edge (can't go beyond top edge of image)

    // Update offset with constraints and drag start position
    setOffset((prev) => {
      const newX = Math.min(maxOffsetX, Math.max(minOffsetX, prev.x + deltaX));
      const newY = Math.min(maxOffsetY, Math.max(minOffsetY, prev.y + deltaY));
      return { x: newX, y: newY };
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle mouse leave to prevent "sticky" dragging
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="absolute z-10 mt-8 overflow-hidden rounded-md"
      style={{
        height: `${IMAGE_HEIGHT}px`,
        width: `${IMAGE_HEIGHT * originalAspectRatio}px`,
        maxWidth: "100%",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="absolute"
        style={{
          width: `${(100 / width) * 100}%`,
          height: `${(100 / height) * 100}%`,
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
    </div>
  );
}

export function ProblemRenderer({ problem }: { problem: UserProblem }) {
  const hasRelevantImageSegment =
    problem.imageUrl && problem.relevantImageSegment;

  console.log(problem.relevantImageSegment);

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
          />
        )}
    </div>
  );
}
