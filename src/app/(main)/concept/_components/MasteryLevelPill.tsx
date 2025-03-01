import { Badge } from "@/components/ui/badge";
import { type MasteryLevel } from "@/core/goal/types";
import { cn } from "@/lib/utils";

interface MasteryLevelPillProps {
  level: MasteryLevel;
}

const MASTERY_LEVEL_DEFINITIONS: Record<
  MasteryLevel,
  { label: string; bg: string; text: string }
> = {
  UNKNOWN: {
    label: "Unknown Skill",
    bg: "bg-gray-100",
    text: "text-gray-600",
  },
  BEGINNER: {
    label: "Beginner",
    bg: "bg-blue-100",
    text: "text-blue-600",
  },
  INTERMEDIATE: {
    label: "Intermediate",
    bg: "bg-green-100",
    text: "text-green-600",
  },
  ADVANCED: {
    label: "Advanced",
    bg: "bg-purple-100",
    text: "text-purple-600",
  },
  EXPERT: {
    label: "Expert",
    bg: "bg-yellow-100",
    text: "text-yellow-600",
  },
};

export function MasteryLevelPill({ level }: MasteryLevelPillProps) {
  const styles = MASTERY_LEVEL_DEFINITIONS[level];
  return (
    <Badge
      variant="secondary"
      className={cn(
        "min-w-[80px]",
        styles.bg,
        styles.text,
        "hover:bg-opacity-100", // Prevent hover color change
      )}
    >
      {MASTERY_LEVEL_DEFINITIONS[level].label}
    </Badge>
  );
}
