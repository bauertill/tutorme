import { type Concept } from "@/core/goal/types";
import Link from "next/link";
import { MasteryLevelPill } from "./MasteryLevelPill";

export default function ConceptsList({ concepts }: { concepts: Concept[] }) {
  return (
    <div>
      {concepts.map((concept) => (
        <div
          key={concept.id}
          className="p-4 bg-gray-900 rounded-lg shadow-md mb-4 hover:bg-gray-800 transition-colors"
        >
          <Link href={`/concept/${concept.id}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-100">
                  {concept.name}
                </h3>
                <p className="text-gray-400 mt-2">{concept.description}</p>
              </div>
              <MasteryLevelPill level={concept.masteryLevel} />
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
