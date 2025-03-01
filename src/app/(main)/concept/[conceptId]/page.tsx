import { Breadcrumbs } from "@/app/_components/Breadcrumbs";
import { Header } from "@/app/_components/Header";
import { dbAdapter } from "@/core/adapters/dbAdapter";
import { ConceptView } from "../_components/ConceptView";
import { MasteryLevelPill } from "../_components/MasteryLevelPill";

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ conceptId: string }>;
}) {
  const { conceptId } = await params;
  const concept = await dbAdapter.getConceptWithGoalByConceptId(conceptId);

  return (
    <div className="mx-auto max-w-screen-md">
      <Header>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: concept.goal.name, href: `/goal/${concept.goal.id}` },
            { label: concept.name, href: `/concept/${conceptId}` },
          ]}
        />
        <div className="mb-6">
          <h1 className="flex items-center justify-between text-3xl font-bold text-foreground">
            {concept.name}
            <MasteryLevelPill level={concept.masteryLevel} />
          </h1>
        </div>
      </Header>
      <main className="space-y-6">
        <p className="text-muted-foreground">{concept.description}</p>
        <ConceptView concept={concept} />
      </main>
    </div>
  );
}
