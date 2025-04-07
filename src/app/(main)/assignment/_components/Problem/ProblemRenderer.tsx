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
  const [reposition, setReposition] = useState({ x: 0, y: 0 });

  return (
    <div className="absolute z-10 mt-8 h-60 w-60">
      <Image
        src={imageUrl}
        alt="Problem image"
        className="rounded-md"
        priority
        width={300}
        height={300}
        onMouseDown={(e) => {
          console.log(e.clientX, e.clientY);
          setReposition({ x: e.clientX, y: e.clientY });
        }}
      />
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
