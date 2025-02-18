import { Concept } from "@/core/goal/types";

interface ConceptsListProps {
  concepts: Concept[];
}

export default function ConceptsList({ concepts }: ConceptsListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Concepts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {concepts.map(concept => (
          <div key={concept.id} className="p-4  rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{concept.name}</h3>
                <p className="text-gray-600 mt-2">{concept.description}</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-gray-400 text-sm">
                {concept.masteryLevel}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
