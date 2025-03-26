import { Latex } from "@/app/_components/richtext/Latex";
import { UserProblem } from "@/core/assignment/types";
import Image from "next/image";

// We don't need to import ImageRegion, as we can just define it inline based on the shape
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
    <div className="relative mt-2 w-full max-w-xl overflow-hidden rounded-md border border-muted">
      <div className="relative aspect-[4/3] w-full">
        <div
          className="absolute z-10 rounded-sm border-2 border-primary"
          style={{
            left: `${segment.topLeft.x * 100}%`,
            top: `${segment.topLeft.y * 100}%`,
            width: `${(segment.bottomRight.x - segment.topLeft.x) * 100}%`,
            height: `${(segment.bottomRight.y - segment.topLeft.y) * 100}%`,
          }}
        />
        <Image
          src={imageUrl}
          alt="Problem image"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  );
}

export function ProblemRenderer({ problem }: { problem: UserProblem }) {
  const hasRelevantImageSegment =
    problem.imageUrl && problem.relevantImageSegment;

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center gap-1">
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
