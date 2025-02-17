import React, { useState } from "react";

const UserGoal = () => {
  const [goal, setGoal] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Add logic to save the goal
    console.log("Submitted goal:", goal);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Set Your Goal</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="goal" className="block text-gray-700 text-lg font-medium mb-3">
                What is your main goal?
              </label>
              <textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                rows={4}
                placeholder="Enter your goal here..."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium text-lg hover:from-blue-600 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit Goal
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserGoal;
