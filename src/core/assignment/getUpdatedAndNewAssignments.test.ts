import { v4 as uuidv4 } from "uuid";
import { describe, expect, it } from "vitest";
import { getUpdatedAndNewAssignments } from "./assignmentDomain";
import { type Assignment, type UserProblem } from "./types";

// Helper function to create a test assignment
function createTestAssignment(
  id = uuidv4(),
  name = "Test Assignment",
  problemCount = 1,
): Assignment {
  const problems: UserProblem[] = [];

  for (let i = 0; i < problemCount; i++) {
    problems.push({
      id: uuidv4(),
      assignmentId: id,
      problem: `Problem ${i + 1}`,
      problemNumber: `${i + 1}`,
      referenceSolution: null,
      status: "INITIAL",
      canvas: { paths: [] },
      evaluation: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return {
    id,
    name,
    problems,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("mergeAssignments", () => {
  it("should return empty arrays when both inputs are empty", () => {
    const result = getUpdatedAndNewAssignments([], []);
    expect(result.newAssignments).toEqual([]);
    expect(result.updateAssignments).toEqual([]);
  });

  it("should identify new assignments correctly", () => {
    const existingAssignments: Assignment[] = [];
    const incomingAssignment = createTestAssignment();
    const incomingAssignments = [incomingAssignment];

    const result = getUpdatedAndNewAssignments(
      existingAssignments,
      incomingAssignments,
    );

    expect(result.newAssignments).toHaveLength(1);
    expect(result.newAssignments[0]).toEqual(incomingAssignment);
    expect(result.updateAssignments).toHaveLength(0);
  });

  it("should not identify any changes when assignments are identical", () => {
    const assignmentId = uuidv4();
    const existingAssignment = createTestAssignment(assignmentId);
    // Create a deep copy to ensure they're separate objects but with identical content
    const incomingAssignment = JSON.parse(
      JSON.stringify(existingAssignment),
    ) as Assignment;

    // Ensure dates are properly converted back to Date objects
    incomingAssignment.createdAt = new Date(incomingAssignment.createdAt);
    incomingAssignment.updatedAt = new Date(incomingAssignment.updatedAt);
    incomingAssignment.problems.forEach((problem) => {
      problem.createdAt = new Date(problem.createdAt);
      problem.updatedAt = new Date(problem.updatedAt);
    });

    const result = getUpdatedAndNewAssignments(
      [existingAssignment],
      [incomingAssignment],
    );

    expect(result.newAssignments).toHaveLength(0);
    expect(result.updateAssignments).toHaveLength(0);
  });

  it("should identify updated assignments correctly", () => {
    const assignmentId = uuidv4();
    const existingAssignment = createTestAssignment(
      assignmentId,
      "Original Name",
    );
    const incomingAssignment = createTestAssignment(
      assignmentId,
      "Updated Name",
    );

    const result = getUpdatedAndNewAssignments(
      [existingAssignment],
      [incomingAssignment],
    );

    expect(result.newAssignments).toHaveLength(0);
    expect(result.updateAssignments).toHaveLength(1);
    expect(result.updateAssignments[0]!).toEqual(incomingAssignment);
  });

  it("should identify updated problems within assignments", () => {
    const assignmentId = uuidv4();
    const existingAssignment = createTestAssignment(
      assignmentId,
      "Test Assignment",
      2,
    );

    // Create a modified copy of the existing assignment
    const incomingAssignment = JSON.parse(
      JSON.stringify(existingAssignment),
    ) as Assignment;
    incomingAssignment.problems[0]!.status = "SOLVED";

    // Ensure dates are properly converted back to Date objects
    incomingAssignment.createdAt = new Date(incomingAssignment.createdAt);
    incomingAssignment.updatedAt = new Date(incomingAssignment.updatedAt);
    incomingAssignment.problems.forEach((problem) => {
      problem.createdAt = new Date(problem.createdAt);
      problem.updatedAt = new Date(problem.updatedAt);
    });

    const result = getUpdatedAndNewAssignments(
      [existingAssignment],
      [incomingAssignment],
    );

    expect(result.newAssignments).toHaveLength(0);
    expect(result.updateAssignments).toHaveLength(1);
    expect(result.updateAssignments[0]!.problems[0]!.status).toBe("SOLVED");
  });

  it("should handle mixed scenarios with new and updated assignments", () => {
    const existingId = uuidv4();
    const existingAssignment = createTestAssignment(existingId);
    const updatedAssignment = createTestAssignment(existingId, "Updated Name");
    const newAssignment = createTestAssignment();

    const result = getUpdatedAndNewAssignments(
      [existingAssignment],
      [updatedAssignment, newAssignment],
    );

    expect(result.newAssignments).toHaveLength(1);
    expect(result.newAssignments[0]!).toEqual(newAssignment);
    expect(result.updateAssignments).toHaveLength(1);
    expect(result.updateAssignments[0]!).toEqual(updatedAssignment);
  });

  it("should handle when incoming assignments is empty", () => {
    const existingAssignment = createTestAssignment();

    const result = getUpdatedAndNewAssignments([existingAssignment], []);

    expect(result.newAssignments).toHaveLength(0);
    expect(result.updateAssignments).toHaveLength(0);
  });

  it("should handle a complex scenario", () => {
    const existingAssignment = createTestAssignment("1", "Assignment 1", 2);
    const existingAssignment2 = createTestAssignment("2", "Assignment 2", 2);

    const updatedAssignment: Assignment = {
      ...existingAssignment,
      problems: existingAssignment.problems.map((problem) => {
        if (problem.problem === "Problem 1") {
          return {
            ...problem,
            status: "SOLVED",
          };
        }
        return problem;
      }),
    };
    const result = getUpdatedAndNewAssignments(
      [existingAssignment, existingAssignment2],
      [updatedAssignment],
    );

    expect(result.newAssignments).toHaveLength(0);
    expect(result.updateAssignments).toEqual([updatedAssignment]);
  });
});
