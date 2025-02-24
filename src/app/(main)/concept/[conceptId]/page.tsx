import { Breadcrumbs } from "@/app/_components/Breadcrumbs";
import { Header } from "@/app/_components/Header";
import { dbAdapter } from "@/core/adapters/dbAdapter";
import { ConceptView } from "../_components/ConceptView";

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ conceptId: string }>;
}) {
  const { conceptId } = await params;
  const concept = await dbAdapter.getConceptWithGoalByConceptId(conceptId);

  return (
    <>
      <Header>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: concept.goal.name, href: `/goal/${concept.goal.id}` },
            { label: concept.name, href: `/concept/${conceptId}` },
          ]}
        />
        <h1 className="mb-6 text-3xl font-bold">{concept.goal.name}</h1>
      </Header>
      <main>
        <ConceptView concept={concept} />
      </main>
    </>
  );
}
