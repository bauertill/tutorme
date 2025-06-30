export type ProblemDifficulty = "Easy" | "Medium" | "Hard";

export interface CustomProblem {
  id: string;
  title: string;
  problemText: string;
  solution: string;
  difficulty: ProblemDifficulty;
  estimatedTime: number;
  topic: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  estimatedTime: number;
  difficulty: ProblemDifficulty;
  status: "Draft" | "Active" | "Completed";
  assignedGroups: string[];
  createdDate: string;
  bookId?: string;
  bookProblemIds?: string[];
  customProblems?: CustomProblem[];
  generatedFromPlan?: boolean;
  planWeek?: number;
}

export interface ProblemAttempt {
  problemId: string;
  problemText: string;
  expectedSolution: string;
  studentSolution: string;
  status: "Correct" | "Incorrect" | "Partially Correct";
  aiPrompts: string[];
}

export interface StudentSolution {
  problemId: string;
  problemText: string;
  studentSolution: string;
  expectedSolution: string;
  isCorrect: boolean;
  timeSpent: number;
  aiPrompts: {
    prompt: string;
    response: string;
    timestamp: string;
    helpful: boolean;
  }[];
  attempts: {
    attempt: number;
    solution: string;
    timestamp: string;
    feedback: string;
  }[];
}

export interface AssignmentDetails {
  id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  estimatedTime: number;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Draft" | "Active" | "Completed";
  assignedGroups: string[];
  createdDate: string;
  totalProblems: number;
  averageScore: number;
  completionRate: number;
  averageTimeSpent: number;
  studentResults: {
    studentName: string;
    score: number;
    maxScore: number;
    timeSpent: number;
    status: "Completed" | "In Progress" | "Overdue";
    submissionDate?: string;
    solutions: StudentSolution[];
  }[];
}

export interface DetailedStudentProgress {
  studentId: string;
  studentName: string;
  group: string;
  assignments: {
    assignmentId: string;
    assignmentTitle: string;
    status: "Completed" | "In Progress" | "Overdue" | "Not Started";
    score?: number;
    maxScore?: number;
    timeSpent: number;
    progress: number;
    lastActivity: string;
    dueDate?: string;
    submissionDate?: string;
    solutions: StudentSolution[];
  }[];
}

export interface StudentWorkload {
  studentId: string;
  studentName: string;
  group: string;
  activeAssignments: number;
  completedThisWeek: number;
  totalTimeSpent: number;
  averageScore: number;
  upcomingDeadlines: number;
}
