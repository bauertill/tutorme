import { Breadcrumbs } from "@/app/_components/Breadcrumbs";
import { Header } from "@/app/_components/Header";
import { api, HydrateClient } from "@/trpc/server";
import { ConceptHeader } from "../_components/ConceptHeader";
import { ConceptView } from "../_components/ConceptView";

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ conceptId: string }>;
}) {
  const { conceptId } = await params;
  await api.concept.byId.prefetch(conceptId);
  const concept = await api.concept.byId(conceptId);

  return (
    <HydrateClient>
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
            <ConceptHeader conceptId={conceptId} />
          </div>
        </Header>
        <main className="space-y-6">
          <p className="text-muted-foreground">{concept.description}</p>
          <ConceptView conceptId={conceptId} />
        </main>
      </div>
    </HydrateClient>
  );
}
