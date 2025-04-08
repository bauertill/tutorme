import { Button } from "@/components/ui/button";
import { type UserProblem } from "@/core/assignment/types";
import { useStore } from "@/store";
import { ChevronUp, Image as ImageIcon, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const DEFAULT_SEGMENT = {
  topLeft: { x: 0, y: 0 },
  bottomRight: { x: 0, y: 0 },
};

export function ImageSegmentRenderer({ problem }: { problem: UserProblem }) {
  const IMAGE_HEIGHT = 240;
  const [isMinimized, setIsMinimized] = useState(false);

  // Calculate the aspect ratio of the cropped segment
  const [originalAspectRatio, setOriginalAspectRatio] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const updateProblem = useStore.use.updateProblem();

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

  const segment = problem.relevantImageSegment ?? DEFAULT_SEGMENT;
  const imageUrl = problem.imageUrl;
  // Calculate the crop percentages
  const left = segment.topLeft.x * 100;
  const top = segment.topLeft.y * 100;
  const width = (segment.bottomRight.x - segment.topLeft.x) * 100;
  const height = (segment.bottomRight.y - segment.topLeft.y) * 100;
  const totalWidth = (100 / width) * 100;
  const totalHeight = (100 / height) * 100;
  const handleZoom = (zoomFactor: number) => {
    updateProblem({
      id: problem.id,
      assignmentId: problem.assignmentId,
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
        id: problem.id,
        assignmentId: problem.assignmentId,
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
  }, [problem, offset, totalWidth, totalHeight, segment, updateProblem]);

  const stopDragging = () => setIsDragging(false);
  if (!imageUrl || segment === DEFAULT_SEGMENT) return null;

  return (
    <div className="absolute z-10 mt-8">
      <Button
        className="absolute left-2 top-2 z-20 gap-2 shadow-md"
        variant="outline"
        size="icon"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        {isMinimized ? (
          <>
            <ImageIcon className="h-4 w-4" />
          </>
        ) : (
          <ChevronUp className="h-3 w-3 text-muted-foreground" />
        )}
      </Button>
      {!isMinimized && (
        <div
          className="absolute z-10 touch-none overflow-hidden rounded-md"
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
              size="icon"
              onClick={() => handleZoom(3 / 4)}
              disabled={totalWidth > 1000}
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              className="shadow-md"
              variant="outline"
              size="icon"
              onClick={() => handleZoom(4 / 3)}
              disabled={totalWidth < 100}
            >
              <Minus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
