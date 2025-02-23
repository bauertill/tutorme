"use client";

import { api } from "@/trpc/react";
import { useEffect, useState } from "react";

export function CreateGoalButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [goalText, setGoalText] = useState("");

  const utils = api.useUtils();
  const createGoal = api.goal.create.useMutation({
    onSuccess: () => {
      void utils.goal.all.invalidate();
      setIsOpen(false);
    },
  });

  useEffect(() => {
    if (!isOpen) {
      setGoalText("");
    }
  }, [isOpen]);

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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createGoal.mutate({ name: goalText });
              }}
            >
              <textarea
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                className="w-full p-2 border rounded-md mb-4 dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter your learning goal..."
                rows={4}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={createGoal.isPending}
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createGoal.isPending}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  {createGoal.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
