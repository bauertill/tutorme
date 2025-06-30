import type { Book, TopicGroup } from "../books/books.types";
import type { StudentGroup } from "../groups/groups.types";

export interface WeekProblem {
  id: string;
  title: string;
  difficulty: number;
  estimatedTime: number;
  solution: string;
  problemText: string;
  topic: string;
}

export interface SemesterWeek {
  week: number;
  startDate: Date;
  type: "content" | "review";
  title: string;
  topics: TopicGroup[];
  problems: WeekProblem[];
  totalProblems: number;
  estimatedHours: number;
  learningObjectives?: string[];
}

export interface SemesterPlanSummary {
  totalWeeks: number;
  contentWeeks: number;
  reviewWeeks: number;
  totalProblems: number;
  totalHours: number;
  averageDifficulty: string;
}

export interface SemesterPlan {
  book: Book;
  group: StudentGroup;
  topics: TopicGroup[];
  weeks: SemesterWeek[];
  summary: SemesterPlanSummary;
}

export type DifficultyProgression = "linear" | "adaptive" | "mixed";

export interface SemesterPlanningConfig {
  selectedBookId: string;
  selectedGroup: string;
  selectedTopics: string[];
  semesterWeeks: number;
  problemsPerWeek: number;
  maxHoursPerWeek: number;
  difficultyProgression: DifficultyProgression;
  includeReviews: boolean;
  reviewFrequency: number;
  startDate: string;
}
