import { Breadcrumbs } from "@/app/_components/Breadcrumbs";
import { Header } from "@/app/_components/Header";
import { api, HydrateClient } from "@/trpc/server";
import { ConceptPageComponent } from "../_components/Concept/ConceptPageComponent";

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
          <div className="mb-6"></div>
        </Header>
        <main className="space-y-6">
          <ConceptPageComponent conceptId={conceptId} />
        </main>
      </div>
    </HydrateClient>
  );
}
