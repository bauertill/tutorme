export interface StudentResult {
  id: string;
  studentName: string;
  group: string;
  assignment: string;
  score: number;
  maxScore: number;
  timeSpent: number;
  submissionDate: string;
  status: "Completed" | "In Progress" | "Overdue";
}

export interface GroupPerformance {
  groupName: string;
  averageScore: number;
  completionRate: number;
  totalStudents: number;
  completedAssignments: number;
  trend: "up" | "down" | "stable";
}
