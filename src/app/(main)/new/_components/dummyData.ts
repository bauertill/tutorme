import { type UserProblem } from "@/core/problem/types";

export type Assignment = {
  id: string;
  name: string;
  problems: UserProblem[];
  createdAt: Date;
  updatedAt: Date;
};
export const dummyUserProblems: UserProblem[] = [
  {
    id: "1",
    problem: "Find all roots of the equation $x^2 - 4x + 3 = 0$",
    referenceSolution: "The roots are $x = 1$ and $x = 3$.",
    isCorrect: true,
    status: "SOLVED",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "1",
  },
  {
    id: "2",
    problem: "What are the common factors of 12 and 18?",
    referenceSolution: "The common factors are 1, 2, 3, and 6.",
    isCorrect: false,
    status: "FAILED",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "1",
  },
  {
    id: "3",
    problem: "Solve for x: 2x + 3 = 7",
    referenceSolution: "x = 2",
    isCorrect: false,
    status: "INITIAL",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "1",
  },
  {
    id: "4",
    problem: "Solve for x: 2x + 3 = 7",
    referenceSolution: "x = 2",
    isCorrect: false,
    status: "IN_PROGRESS",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "1",
  },
];

export const dummyAssignments: Assignment[] = [
  {
    id: "1",
    name: "Assignment 1",
    problems: dummyUserProblems,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Assignment 2",
    problems: dummyUserProblems,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
