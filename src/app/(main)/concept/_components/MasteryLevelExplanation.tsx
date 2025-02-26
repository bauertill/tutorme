import type { MasteryLevel } from "@/core/goal/types";

export function MasteryLevelExplanation({
  masteryLevel,
}: {
  masteryLevel: MasteryLevel;
}) {
  const explanationMap: Record<MasteryLevel, string> = {
    UNKNOWN: "Let's begin the assessment to see your mastery level.",
    BEGINNER: "You're at the beginning of your journey.",
    INTERMEDIATE:
      "You're making progress and understand some basics. Let's focus on the complex questions to master this concept.",
    ADVANCED:
      "You're starting to master the complicated questions, with some practice you will be an expert soon.",
    EXPERT: "You're officially an expert on this topic!",
  };
  return (
    <div>
      <p>{explanationMap[masteryLevel]}</p>
    </div>
  );
}
