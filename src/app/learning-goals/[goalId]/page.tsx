import ConceptsList from "@/components/ConceptsList";
import { DBAdapter } from "@/core/adapters/dbAdapter";
import { LLMAdapter } from "@/core/adapters/llmAdapter";
import { getConceptsForGoal } from "@/core/goal/goalDomain";
import { notFound } from "next/navigation";

interface LearningGoalPageProps {
  params: {
    goalId: string;
  };
}

export default async function LearningGoalPage({
  params,
}: LearningGoalPageProps) {
  const db = new DBAdapter();
  const llmAdapter = new LLMAdapter();
  const goal = await db.getGoalById(params.goalId);
  const concepts = await getConceptsForGoal(llmAdapter, db, goal);
  if (!goal) {
    notFound();
  }

  return (
    <main>
      <h1 className="text-3xl font-bold mb-6">{goal.goal}</h1>
      <ConceptsList concepts={concepts} />
    </main>
  );
}
