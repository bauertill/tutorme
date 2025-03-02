export const CHOOSE_PROBLEM_SYSTEM_PROMPT = `You are an expert tutor.
Your task is to choose a problem from the following list of problems.

Follow these guidelines:
1. Carefully read the lesson goal.
2. Carefully read the list of problems.
3. Choose the problem that is most relevant to the lesson goal.

Your output should be the index of the problem to choose.`;

export const CHOOSE_PROBLEM_HUMAN_TEMPLATE = `Please choose a problem from the following list of problems.

Lesson Goal: {lessonGoal}

Problems:
{problems}
`;
