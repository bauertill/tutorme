import { Breadcrumbs } from "@/app/_components/Breadcrumbs";
import { Header } from "@/app/_components/Header";
import { dbAdapter } from "@/core/adapters/dbAdapter";
import { AssessmentInput } from "./_components/AssessmentInput";

export default async function AssessmentPage({
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
            { label: "Assessment", href: `/concept/${conceptId}/assessment` },
          ]}
        />
        <h1 className="mb-6 text-3xl font-bold">{concept.goal.name}</h1>
      </Header>
      <main>
        <AssessmentInput conceptId={conceptId} />
      </main>
    </div>
  );
}
