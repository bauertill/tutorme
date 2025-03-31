import { Latex } from "@/app/_components/richtext/Latex";
import { type UserProblem } from "@/core/assignment/types";
import Image from "next/image";

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
  return (
    <Image
      src={imageUrl}
      alt="Problem image"
      fill
      className="object-contain"
      sizes="100vw"
      priority
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 10,
        clipPath: `inset(${segment.topLeft.y * 100}% ${(1 - segment.bottomRight.x) * 100}% ${(1 - segment.bottomRight.y) * 100}% ${segment.topLeft.x * 100}%)`,
      }}
    />
  );
}

export function ProblemRenderer({ problem }: { problem: UserProblem }) {
  const hasRelevantImageSegment =
    problem.imageUrl && problem.relevantImageSegment;

  return (
    <div className="current-problem flex flex-row items-center gap-1">
      <span className="mr-1 text-muted-foreground">
        {problem.problemNumber}
      </span>
      <Latex className="whitespace-pre-wrap">{problem.problem}</Latex>

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
