import Link from "next/link";
import { Concept } from "@/core/goal/types";

export default function ConceptsList({ concepts }: { concepts: Concept[] }) {
  return (
    <div>
      {concepts.map(concept => (
        <div key={concept.id} className="p-4  rounded-lg shadow-md">
          <Link href={`/concept/${concept.id}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{concept.name}</h3>
                <p className="text-gray-600 mt-2">{concept.description}</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-gray-400 text-sm">
                {concept.masteryLevel}
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
