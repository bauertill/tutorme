import { Latex } from "@/app/_components/Latex";
import { type LessonExerciseTurn } from "@/core/lesson/types";

export function LessonExercise({ exercise }: { exercise: LessonExerciseTurn }) {
  return (
    <div className="my-2 rounded bg-muted p-3">
      <p className="text-m font-semibold capitalize">Exercise</p>
      <p className="mt-2 whitespace-pre-wrap">
        <Latex>{exercise.text}</Latex>
      </p>
    </div>
  );
}
