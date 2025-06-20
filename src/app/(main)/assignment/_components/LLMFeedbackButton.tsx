"use client";

import { Button } from "@/components/ui/button";
import { type StudentSolution } from "@/core/studentSolution/studentSolution.types";
import { useAuth } from "@/lib/react-auth";
import { ThumbsDown, ThumbsUp } from "lucide-react";

const ADMINS = [
  "max@mxgr.de",
  "bauertill@gmail.com",
  "maksymiukdavid@gmail.com",
];

export function LLMFeedbackButton({
  studentSolution,
}: {
  studentSolution?: StudentSolution;
}) {
  const { session } = useAuth();

  // Only show for superadmins
  const isAdmin = session?.user?.email && ADMINS.includes(session.user.email);

  if (!isAdmin || !studentSolution) {
    return null;
  }

  const handleFeedback = (type: "up" | "down") => {
    console.log(`LLM Feedback: ${type}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="lg"
        onClick={() => handleFeedback("up")}
        className="flex items-center gap-2"
      >
        <ThumbsUp className="h-6 w-6" />
        Good
      </Button>
      <Button
        variant="outline"
        size="lg"
        onClick={() => handleFeedback("down")}
        className="flex items-center gap-2"
      >
        <ThumbsDown className="h-6 w-6" />
        Bad
      </Button>
    </div>
  );
}
