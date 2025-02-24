import ConceptsList from "@/app/(main)/concept/_components/ConceptsList";
import { Breadcrumbs } from "@/app/_components/Breadcrumbs";
import { Header } from "@/app/_components/Header";
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
    <>
      <Header>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: goal.name, href: `/goal/${goalId}` },
          ]}
        />
        <h1 className="mb-6 text-3xl font-bold">{goal.name}</h1>
      </Header>
      <main>
        <ConceptsList goalId={goalId} />
      </main>
    </>
  );
}
