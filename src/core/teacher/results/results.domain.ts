import { getAllStudentProgress } from "../assignments/assignments.domain";
import type { GroupPerformance, StudentResult } from "./results.types";

export const getStudentResults = (): StudentResult[] => {
  const studentProgressData = getAllStudentProgress();
  const results: StudentResult[] = [];

  studentProgressData.forEach((student) => {
    student.assignments.forEach((assignment) => {
      // Only include assignments that have been started or completed
      if (assignment.status !== "Not Started") {
        results.push({
          id: `${student.studentId}-${assignment.assignmentId}`,
          studentId: student.studentId,
          group: student.group,
          assignment: assignment.assignmentTitle,
          score: assignment.score ?? 0,
          maxScore: assignment.maxScore ?? 100,
          timeSpent: assignment.timeSpent,
          submissionDate: assignment.submissionDate ?? "",
          status: assignment.status,
        });
      }
    });
  });

  return results;
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
