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

export const getGroupPerformance = (): GroupPerformance[] => {
  const studentProgressData = getAllStudentProgress();
  const groupStats = new Map<
    string,
    {
      totalScore: number;
      totalMaxScore: number;
      completedAssignments: number;
      totalAssignments: number;
      students: Set<string>;
      previousAverageScore?: number; // For trend calculation
    }
  >();

  // Initialize group statistics
  studentProgressData.forEach((student) => {
    if (!groupStats.has(student.group)) {
      groupStats.set(student.group, {
        totalScore: 0,
        totalMaxScore: 0,
        completedAssignments: 0,
        totalAssignments: 0,
        students: new Set(),
      });
    }

    const groupStat = groupStats.get(student.group);
    if (!groupStat) return;
    groupStat.students.add(student.studentId);

    student.assignments.forEach((assignment) => {
      // Count all assignments that are not "Not Started"
      if (assignment.status !== "Not Started") {
        groupStat.totalAssignments++;

        // Add scores for completed assignments
        if (
          assignment.status === "Completed" &&
          assignment.score !== undefined &&
          assignment.maxScore !== undefined
        ) {
          groupStat.totalScore += assignment.score;
          groupStat.totalMaxScore += assignment.maxScore;
          groupStat.completedAssignments++;
        }
      }
    });
  });

  // Convert to GroupPerformance array
  const groupPerformance: GroupPerformance[] = [];

  groupStats.forEach((stats, groupName) => {
    const averageScore =
      stats.totalMaxScore > 0
        ? (stats.totalScore / stats.totalMaxScore) * 100
        : 0;
    const completionRate =
      stats.totalAssignments > 0
        ? (stats.completedAssignments / stats.totalAssignments) * 100
        : 0;

    // Simple trend calculation based on group performance patterns
    // For now, we'll use a simple heuristic based on average score
    let trend: "up" | "down" | "stable" = "stable";
    if (averageScore >= 90) {
      trend = "up";
    } else if (averageScore < 75) {
      trend = "down";
    }

    groupPerformance.push({
      groupName,
      averageScore: Math.round(averageScore * 10) / 10, // Round to 1 decimal place
      completionRate: Math.round(completionRate),
      totalStudents: stats.students.size,
      completedAssignments: stats.completedAssignments,
      trend,
    });
  });

  return groupPerformance.sort((a, b) =>
    a.groupName.localeCompare(b.groupName),
  );
};
