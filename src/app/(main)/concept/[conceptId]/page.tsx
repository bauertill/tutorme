import { Breadcrumbs } from "@/app/_components/Breadcrumbs";
import { Header } from "@/app/_components/Header";
import { Card, CardContent } from "@/components/ui/card";
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
        <Card className="transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{concept.name}</h3>
                <p className="mt-2">{concept.description}</p>
              </div>
              <MasteryLevelPill level={concept.masteryLevel} />
            </div>
          </CardContent>
        </Card>
      </Header>
      <main>
        <ConceptView concept={concept} />
      </main>
    </div>
  );
}
