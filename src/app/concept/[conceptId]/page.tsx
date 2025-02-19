import { ConceptView } from "../../../components/ConceptView";

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ conceptId: string }>;
}) {
  const { conceptId } = await params;

  return <ConceptView conceptId={conceptId} />;
}
