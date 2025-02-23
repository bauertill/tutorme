import ConceptsList from "@/app/(main)/concept/_components/ConceptsList";
import { dbAdapter } from "@/core/adapters/dbAdapter";
import { getGoalById } from "@/core/goal/goalDomain";

interface LearningGoalPageProps {
  params: Promise<{
    goalId: string;
  }>;
}

export default async function LearningGoalPage({
  params,
}: LearningGoalPageProps) {
  const { goalId } = await params;

  const goal = await getGoalById(dbAdapter, goalId);

  return (
    <main>
      <h1 className="text-3xl font-bold mb-6">{goal.name}</h1>
      <ConceptsList goalId={goalId} />
    </main>
  );
}
