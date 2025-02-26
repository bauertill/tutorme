"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Assessment } from "@/core/concept/types";
import { api } from "@/trpc/react";
import { useState } from "react";

export function AssessmentInput({ conceptId }: { conceptId: string }) {
  const [input, setInput] = useState("");
  const [assessment, setAssessment] = useState<Assessment>();
  const [question, setQuestion] = useState("");

  const {
    mutate: createAssessment,
    isPending,
    isError,
    error,
  } = api.concept.createAssessment.useMutation({
    onSuccess: (data) => {
      setAssessment(data.assessment);
      setQuestion(data.question.question);
    },
  });

  const {
    mutate: addUserResponseToAssessment,
    isPending: isAddingUserResponsePending,
    isError: isAddingUserResponseError,
    error: addingUserResponseError,
  } = api.concept.addUserResponseToAssessment.useMutation({
    onSuccess: (data) => {
      console.log(data);
      setQuestion(JSON.stringify(data, null, 2));
    },
  });

  const handleSubmit = () => {
    if (!assessment) {
      throw new Error("Assessment not found");
    }
    addUserResponseToAssessment({
      assessmentId: assessment.id,
      userResponse: input,
    });
  };

  const handleGenerateQuestion = () => {
    createAssessment({ conceptId });
  };

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={handleGenerateQuestion}>Generate Question</Button>
      {isError && <div>Error: {error.message}</div>}
      {isPending && <div>Loading...</div>}
      {question && <pre>{question}</pre>}
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your answer here..."
        className="min-h-[150px]"
      />
      <Button onClick={handleSubmit} className="self-end">
        Submit
      </Button>
    </div>
  );
}
