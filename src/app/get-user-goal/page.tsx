"use client";
import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

const UserGoal = () => {
  const [goalText, setGoalText] = useState("");

  const createMutation = useMutation({
    mutationFn: async (newGoal: string) => {
      const response = await fetch("/api/goal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goal: newGoal }),
      });
      return response.json();
    },
    onSuccess: data => {
      console.log("Goal saved successfully:", data);
      setGoalText(""); // Reset form after successful submission
    },
    onError: error => {
      console.error("Error saving goal:", error);
    },
  });

  const { data: goal, isLoading } = useQuery({
    queryKey: ["goal"],
    queryFn: async () => {
      const response = await fetch("/api/goal");
      return response.json();
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createMutation.mutate(goalText);
  };
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (goal) {
    return <div>Goal: {goal.goal.goal}</div>;
  }

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">Set Your Goal</h1>
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label htmlFor="goal" className="block text-sm font-medium mb-2">
            What is your main goal?
          </label>
          <textarea
            id="goal"
            value={goalText}
            onChange={e => setGoalText(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={4}
            placeholder="Enter your goal here..."
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Submitting..." : "Submit Goal"}
        </button>

        {createMutation.isSuccess && (
          <p className="text-green-500 mt-2">Goal saved successfully!</p>
        )}
      </form>
    </main>
  );
};

export default UserGoal;
