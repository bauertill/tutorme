"use client";
import React, { useState } from "react";
const UserGoal = () => {
  const [goal, setGoal] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/goal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goal }),
      });

      const data = await response.json();
      console.log("Goal saved successfully:", data);
      // You might want to add some success feedback here
    } catch (error) {
      console.error("Error saving goal:", error);
      // You might want to add some error feedback here
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Set Your Goal</h1>
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label htmlFor="goal" className="block text-sm font-medium mb-2">
            What is your main goal?
          </label>
          <textarea
            id="goal"
            value={goal}
            onChange={e => setGoal(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={4}
            placeholder="Enter your goal here..."
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Submit Goal
        </button>
      </form>
    </div>
  );
};

export default UserGoal;
