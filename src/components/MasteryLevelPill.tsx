import { MasteryLevel } from "@/core/goal/types";

interface MasteryLevelPillProps {
  level: MasteryLevel;
}

const MASTERY_LEVEL_STYLES: Record<MasteryLevel, { bg: string; text: string }> =
  {
    unknown: {
      bg: "bg-gray-100",
      text: "text-gray-600",
    },
    beginner: {
      bg: "bg-blue-100",
      text: "text-blue-600",
    },
    intermediate: {
      bg: "bg-green-100",
      text: "text-green-600",
    },
    advanced: {
      bg: "bg-purple-100",
      text: "text-purple-600",
    },
    expert: {
      bg: "bg-yellow-100",
      text: "text-yellow-600",
    },
  };

export function MasteryLevelPill({ level }: MasteryLevelPillProps) {
  const styles = MASTERY_LEVEL_STYLES[level];
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-3 rounded-full text-xs font-medium min-w-[80px] ${styles.bg} ${styles.text}`}
    >
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}
