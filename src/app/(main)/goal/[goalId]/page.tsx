import ConceptsList from "@/app/(main)/concept/_components/ConceptsList";
import { Breadcrumbs } from "@/app/_components/Breadcrumbs";
import { Header } from "@/app/_components/Header";
import { dbAdapter } from "@/core/adapters/dbAdapter";
import { getGoalById } from "@/core/goal/goalDomain";
import { api, HydrateClient } from "@/trpc/server";

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
  await api.goal.byIdIncludeConcepts.prefetch(goalId);

  return (
    <div className="mx-auto max-w-screen-md">
      <Header>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: goal.name, href: `/goal/${goalId}` },
          ]}
        />
        <div className="mb-6">
          <p className="text-lg text-muted-foreground">Your Goal</p>
          <h1 className="text-3xl font-bold text-foreground">{goal.name}</h1>
        </div>
      </Header>
      <main className="space-y-6">
        <p className="text-muted-foreground">
          Here are the key concepts you need to learn to achieve your goal. You
          can see your progress in each concept. Click on a concept to start
          learning.
        </p>
        <HydrateClient>
          <ConceptsList goalId={goalId} />
        </HydrateClient>
      </main>
    </div>
  );
}
