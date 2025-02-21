"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateGoalButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [goalText, setGoalText] = useState("");
  const router = useRouter();

  // @TODO Make this use tRPC
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/goal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goalText }),
      });

      if (!response.ok) {
        throw new Error("Failed to create goal");
      }

      setGoalText("");
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        Create Goal
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Create New Learning Goal</h2>
            <form onSubmit={handleSubmit}>
              <textarea
                value={goalText}
                onChange={e => setGoalText(e.target.value)}
                className="w-full p-2 border rounded-md mb-4 dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter your learning goal..."
                rows={4}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
