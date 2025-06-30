import { GroupPerformance, StudentResult } from "./results.types";

export const getStudentResults = () => {
  return studentResults;
};

export const getGroupPerformance = () => {
  return groupPerformance;
};

const groupPerformance: GroupPerformance[] = [
  {
    groupName: "Advanced Math",
    averageScore: 91.5,
    completionRate: 95,
    totalStudents: 2,
    completedAssignments: 23,
    trend: "up",
  },
  {
    groupName: "Basic Math",
    averageScore: 72.3,
    completionRate: 78,
    totalStudents: 2,
    completedAssignments: 28,
    trend: "stable",
  },
  {
    groupName: "Geometry Focus",
    averageScore: 85.7,
    completionRate: 88,
    totalStudents: 1,
    completedAssignments: 14,
    trend: "up",
  },
];

const studentResults: StudentResult[] = [
  {
    id: "1",
    studentName: "Anna Müller",
    group: "Advanced Math",
    assignment: "Linear Equations Practice",
    score: 95,
    maxScore: 100,
    timeSpent: 45,
    submissionDate: "2025-06-26",
    status: "Completed",
  },
  {
    id: "2",
    studentName: "Max Schmidt",
    group: "Basic Math",
    assignment: "Linear Equations Practice",
    score: 78,
    maxScore: 100,
    timeSpent: 65,
    submissionDate: "2025-06-25",
    status: "Completed",
  },
  {
    id: "3",
    studentName: "Lisa Weber",
    group: "Advanced Math",
    assignment: "Geometry Proofs",
    score: 88,
    maxScore: 100,
    timeSpent: 75,
    submissionDate: "2025-06-27",
    status: "Completed",
  },
  {
    id: "4",
    studentName: "Tom Fischer",
    group: "Basic Math",
    assignment: "Linear Equations Practice",
    score: 0,
    maxScore: 100,
    timeSpent: 0,
    submissionDate: "",
    status: "Overdue",
  },
  {
    id: "5",
    studentName: "Emma Bauer",
    group: "Geometry Focus",
    assignment: "Geometry Proofs",
    score: 92,
    maxScore: 100,
    timeSpent: 80,
    submissionDate: "2025-06-25",
    status: "Completed",
  },
  {
    id: "6",
    studentName: "Anna Müller",
    group: "Advanced Math",
    assignment: "Statistics Basics",
    score: 87,
    maxScore: 100,
    timeSpent: 52,
    submissionDate: "2025-06-28",
    status: "Completed",
  },
  {
    id: "7",
    studentName: "Max Schmidt",
    group: "Basic Math",
    assignment: "Geometry Proofs",
    score: 0,
    maxScore: 100,
    timeSpent: 12,
    submissionDate: "",
    status: "In Progress",
  },
];
