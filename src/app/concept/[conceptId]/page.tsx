import { ConceptView } from "../../../components/ConceptView";

export default async function ConceptPage({
  params,
}: {
  params: { conceptId: string };
}) {
  const { conceptId } = await params;

  return <ConceptView conceptId={conceptId} />;
}
