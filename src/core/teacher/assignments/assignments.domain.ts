import type {
  Assignment,
  AssignmentDetails,
  DetailedStudentProgress,
  StudentWorkload,
} from "./assignments.types";

export const getAssignments = () => {
  return initialAssignments;
};
export const getAllStudentProgress = () => {
  return studentProgressData;
};
export const getAllStudentWorkload = () => {
  return studentWorkloadData;
};

export const getAssignmentDetails = (assignmentId: string) => {
  return assignmentDetailsData.find(
    (assignment) => assignment.id === assignmentId,
  );
};
export const getStudentProgress = (studentId: string) => {
  return studentProgressData.find((student) => student.studentId === studentId);
};

export const getStudentWorkload = (studentId: string) => {
  return studentWorkloadData.find((student) => student.studentId === studentId);
};

const initialAssignments: Assignment[] = [
  {
    id: "1",
    title: "Linear Equations Practice",
    description: "Solve various linear equations and graph their solutions",
    subject: "Algebra",
    dueDate: "2025-07-05",
    estimatedTime: 15,
    difficulty: "Medium",
    status: "Active",
    assignedGroups: ["Advanced Math", "Basic Math"],
    createdDate: "2025-06-15",
    bookId: "1",
    bookProblemIds: ["1", "2"],
  },
  {
    id: "2",
    title: "Geometry Proofs",
    description: "Complete geometric proofs for triangles and quadrilaterals",
    subject: "Geometry",
    dueDate: "2025-07-10",
    estimatedTime: 15,
    difficulty: "Hard",
    status: "Active",
    assignedGroups: ["Geometry Focus"],
    createdDate: "2025-06-20",
    bookId: "2",
    bookProblemIds: ["3"],
  },
  {
    id: "3",
    title: "Statistics Basics",
    description: "Introduction to statistical concepts and calculations",
    subject: "Statistics",
    dueDate: "2025-07-15",
    estimatedTime: 15,
    difficulty: "Easy",
    status: "Draft",
    assignedGroups: [],
    createdDate: "2025-06-22",
    customProblems: [
      {
        id: "custom1",
        title: "Mean",
        problemText:
          "Calculate the mean of the following numbers: 2, 4, 6, 8, 10",
        solution: "Mean = (2+4+6+8+10) / 5 = 30 / 5 = 6",
        difficulty: "Easy",
        estimatedTime: 5,
        topic: "Mean",
      },
      {
        id: "custom2",
        title: "Median",
        problemText: "Find the median of: 7, 1, 3, 8, 2",
        solution:
          "Sorted list: 1, 2, 3, 7, 8. The median is the middle number, which is 3.",
        difficulty: "Easy",
        estimatedTime: 5,
        topic: "Median",
      },
      {
        id: "custom3",
        title: "Mode",
        problemText: "Find the mode of: 2, 5, 3, 5, 1, 5, 2",
        solution:
          "The number 5 appears most often (3 times), so the mode is 5.",
        difficulty: "Easy",
        estimatedTime: 5,
        topic: "Mode",
      },
    ],
  },
];

const assignmentDetailsData: AssignmentDetails[] = [
  {
    id: "1",
    title: "Linear Equations Practice",
    description: "Solve various linear equations and graph their solutions",
    subject: "Algebra",
    dueDate: "2025-06-28",
    estimatedTime: 60,
    difficulty: "Medium",
    status: "Active",
    assignedGroups: ["Advanced Math", "Basic Math"],
    createdDate: "2025-06-15",
    totalProblems: 5,
    averageScore: 86.5,
    completionRate: 75,
    averageTimeSpent: 55,
    studentResults: [
      {
        studentName: "Anna Müller",
        score: 95,
        maxScore: 100,
        timeSpent: 45,
        status: "Completed",
        submissionDate: "2025-06-26",
        solutions: [
          {
            problemId: "p1",
            problemText: "Solve for x: 2x + 5 = 13",
            studentSolution:
              "x = 4\n\nMy work:\n2x + 5 = 13\n2x = 13 - 5\n2x = 8\nx = 8 ÷ 2\nx = 4",
            expectedSolution: "x = 4",
            isCorrect: true,
            timeSpent: 8,
            aiPrompts: [
              {
                prompt: "How do I isolate x in this equation?",
                response:
                  "To isolate x, you need to get x by itself on one side. Start by subtracting 5 from both sides, then divide by the coefficient of x.",
                timestamp: "2025-06-26T10:15:00Z",
                helpful: true,
              },
            ],
            attempts: [
              {
                attempt: 1,
                solution: "x = 4",
                timestamp: "2025-06-26T10:18:00Z",
                feedback: "Correct! Well done showing your work step by step.",
              },
            ],
          },
        ],
      },
      {
        studentName: "Max Schmidt",
        score: 78,
        maxScore: 100,
        timeSpent: 65,
        status: "Completed",
        submissionDate: "2025-06-25",
        solutions: [
          {
            problemId: "p1",
            problemText: "Solve for x: 2x + 5 = 13",
            studentSolution:
              "x = 4\n\nMy work:\n2x + 5 = 13\nI need to get x alone\n2x = 13 - 5\n2x = 8\nx = 4",
            expectedSolution: "x = 4",
            isCorrect: true,
            timeSpent: 15,
            aiPrompts: [
              {
                prompt: "I'm confused about which operation to do first",
                response:
                  "Think about the order of operations in reverse. Since we have 2x + 5 = 13, we want to 'undo' the +5 first by subtracting 5 from both sides.",
                timestamp: "2025-06-25T09:10:00Z",
                helpful: true,
              },
            ],
            attempts: [
              {
                attempt: 1,
                solution: "x = 6",
                timestamp: "2025-06-25T09:15:00Z",
                feedback:
                  "Not quite right. Check your arithmetic when dividing.",
              },
              {
                attempt: 2,
                solution: "x = 4",
                timestamp: "2025-06-25T09:22:00Z",
                feedback: "Correct! Good job working through the steps.",
              },
            ],
          },
        ],
      },
      {
        studentName: "Tom Fischer",
        score: 0,
        maxScore: 100,
        timeSpent: 0,
        status: "Overdue",
        solutions: [],
      },
    ],
  },
  {
    id: "2",
    title: "Geometry Proofs",
    description: "Complete geometric proofs for triangles and quadrilaterals",
    subject: "Geometry",
    dueDate: "2025-07-01",
    estimatedTime: 90,
    difficulty: "Hard",
    status: "Active",
    assignedGroups: ["Advanced Math", "Geometry Focus", "Basic Math"],
    createdDate: "2025-06-20",
    totalProblems: 3,
    averageScore: 90,
    completionRate: 67,
    averageTimeSpent: 77.5,
    studentResults: [
      {
        studentName: "Lisa Weber",
        score: 88,
        maxScore: 100,
        timeSpent: 75,
        status: "Completed",
        submissionDate: "2025-06-27",
        solutions: [],
      },
      {
        studentName: "Emma Bauer",
        score: 92,
        maxScore: 100,
        timeSpent: 80,
        status: "Completed",
        submissionDate: "2025-06-25",
        solutions: [],
      },
      {
        studentName: "Max Schmidt",
        score: 0,
        maxScore: 100,
        timeSpent: 12,
        status: "In Progress",
        solutions: [],
      },
    ],
  },
  {
    id: "3",
    title: "Statistics Basics",
    description: "Introduction to statistical concepts and calculations",
    subject: "Statistics",
    dueDate: "2025-06-30",
    estimatedTime: 45,
    difficulty: "Easy",
    status: "Active",
    assignedGroups: ["Advanced Math"],
    createdDate: "2025-06-22",
    totalProblems: 4,
    averageScore: 87,
    completionRate: 100,
    averageTimeSpent: 52,
    studentResults: [
      {
        studentName: "Anna Müller",
        score: 87,
        maxScore: 100,
        timeSpent: 52,
        status: "Completed",
        submissionDate: "2025-06-28",
        solutions: [],
      },
    ],
  },
];

const studentProgressData: DetailedStudentProgress[] = [
  {
    studentId: "1",
    studentName: "Anna Müller",
    group: "Advanced Math",
    assignments: [
      {
        assignmentId: "1",
        assignmentTitle: "Linear Equations Practice",
        status: "Completed",
        score: 95,
        maxScore: 100,
        timeSpent: 45,
        progress: 100,
        lastActivity: "2025-06-26T10:30:00Z",
        dueDate: "2025-06-28T23:59:00Z",
        submissionDate: "2025-06-26T10:30:00Z",
        solutions: [
          {
            problemId: "p1",
            problemText: "Solve for x: 2x + 5 = 13",
            studentSolution:
              "x = 4\n\nMy work:\n2x + 5 = 13\n2x = 13 - 5\n2x = 8\nx = 8 ÷ 2\nx = 4",
            expectedSolution: "x = 4",
            isCorrect: true,
            timeSpent: 8,
            aiPrompts: [
              {
                prompt: "How do I isolate x in this equation?",
                response:
                  "To isolate x, you need to get x by itself on one side. Start by subtracting 5 from both sides, then divide by the coefficient of x.",
                timestamp: "2025-06-26T10:15:00Z",
                helpful: true,
              },
            ],
            attempts: [
              {
                attempt: 1,
                solution: "x = 4",
                timestamp: "2025-06-26T10:18:00Z",
                feedback: "Correct! Well done showing your work step by step.",
              },
            ],
          },
          {
            problemId: "p2",
            problemText: "Solve for y: 3y - 7 = 14",
            studentSolution:
              "y = 7\n\nSolution:\n3y - 7 = 14\n3y = 14 + 7\n3y = 21\ny = 21 ÷ 3\ny = 7",
            expectedSolution: "y = 7",
            isCorrect: true,
            timeSpent: 6,
            aiPrompts: [],
            attempts: [
              {
                attempt: 1,
                solution: "y = 7",
                timestamp: "2025-06-26T10:25:00Z",
                feedback: "Perfect! You solved this independently.",
              },
            ],
          },
        ],
      },
      {
        assignmentId: "3",
        assignmentTitle: "Statistics Basics",
        status: "Completed",
        score: 87,
        maxScore: 100,
        timeSpent: 52,
        progress: 100,
        lastActivity: "2025-06-28T16:45:00Z",
        dueDate: "2025-06-30T23:59:00Z",
        submissionDate: "2025-06-28T16:45:00Z",
        solutions: [
          {
            problemId: "p5",
            problemText:
              "Calculate the mean of the following data set: 12, 15, 18, 22, 25, 28",
            studentSolution:
              "Mean = (12 + 15 + 18 + 22 + 25 + 28) ÷ 6\nMean = 120 ÷ 6\nMean = 20",
            expectedSolution: "Mean = 20",
            isCorrect: true,
            timeSpent: 12,
            aiPrompts: [],
            attempts: [
              {
                attempt: 1,
                solution: "Mean = 20",
                timestamp: "2025-06-28T16:30:00Z",
                feedback: "Excellent! You correctly calculated the mean.",
              },
            ],
          },
        ],
      },
      {
        assignmentId: "2",
        assignmentTitle: "Geometry Proofs",
        status: "In Progress",
        timeSpent: 25,
        progress: 60,
        lastActivity: "2025-06-27T14:15:00Z",
        dueDate: "2025-07-01T23:59:00Z",
        solutions: [
          {
            problemId: "p3",
            problemText:
              "Prove that the sum of angles in a triangle equals 180°",
            studentSolution:
              "I'm working on this proof. So far I know that:\n- Triangle ABC has angles A, B, and C\n- I need to show A + B + C = 180°\n\nI'm thinking about using parallel lines...",
            expectedSolution: "A + B + C = 180°",
            isCorrect: false,
            timeSpent: 25,
            aiPrompts: [
              {
                prompt:
                  "What's the best way to approach triangle angle proofs?",
                response:
                  "A common approach is to draw a line parallel to one side of the triangle through the opposite vertex. This creates alternate interior angles that can help you establish the relationship.",
                timestamp: "2025-06-27T14:10:00Z",
                helpful: true,
              },
              {
                prompt: "Can you explain alternate interior angles?",
                response:
                  "When a transversal crosses two parallel lines, alternate interior angles are equal. This property is key to many geometric proofs.",
                timestamp: "2025-06-27T14:12:00Z",
                helpful: true,
              },
            ],
            attempts: [
              {
                attempt: 1,
                solution: "In progress - working on parallel line approach",
                timestamp: "2025-06-27T14:15:00Z",
                feedback:
                  "Good start! Continue developing your proof using the parallel line method.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    studentId: "2",
    studentName: "Max Schmidt",
    group: "Basic Math",
    assignments: [
      {
        assignmentId: "1",
        assignmentTitle: "Linear Equations Practice",
        status: "Completed",
        score: 78,
        maxScore: 100,
        timeSpent: 65,
        progress: 100,
        lastActivity: "2025-06-25T09:30:00Z",
        dueDate: "2025-06-28T23:59:00Z",
        submissionDate: "2025-06-25T09:30:00Z",
        solutions: [
          {
            problemId: "p1",
            problemText: "Solve for x: 2x + 5 = 13",
            studentSolution:
              "x = 4\n\nMy work:\n2x + 5 = 13\nI need to get x alone\n2x = 13 - 5\n2x = 8\nx = 4",
            expectedSolution: "x = 4",
            isCorrect: true,
            timeSpent: 15,
            aiPrompts: [
              {
                prompt: "I'm confused about which operation to do first",
                response:
                  "Think about the order of operations in reverse. Since we have 2x + 5 = 13, we want to 'undo' the +5 first by subtracting 5 from both sides.",
                timestamp: "2025-06-25T09:10:00Z",
                helpful: true,
              },
              {
                prompt: "Why do I subtract 5 from both sides?",
                response:
                  "When you perform an operation on one side of an equation, you must do the same to the other side to keep the equation balanced. It's like a balance scale!",
                timestamp: "2025-06-25T09:12:00Z",
                helpful: true,
              },
              {
                prompt: "How do I check if my answer is right?",
                response:
                  "Substitute your answer back into the original equation. If 2(4) + 5 = 13, then 8 + 5 = 13, which is true!",
                timestamp: "2025-06-25T09:20:00Z",
                helpful: true,
              },
            ],
            attempts: [
              {
                attempt: 1,
                solution: "x = 6",
                timestamp: "2025-06-25T09:15:00Z",
                feedback:
                  "Not quite right. Check your arithmetic when dividing.",
              },
              {
                attempt: 2,
                solution: "x = 4",
                timestamp: "2025-06-25T09:22:00Z",
                feedback: "Correct! Good job working through the steps.",
              },
            ],
          },
        ],
      },
      {
        assignmentId: "2",
        assignmentTitle: "Geometry Proofs",
        status: "In Progress",
        timeSpent: 12,
        progress: 25,
        lastActivity: "2025-06-28T11:20:00Z",
        dueDate: "2025-07-01T23:59:00Z",
        solutions: [
          {
            problemId: "p3",
            problemText:
              "Prove that the sum of angles in a triangle equals 180°",
            studentSolution:
              "I'm just starting this problem. I know triangles have three angles but I'm not sure how to prove they add up to 180°.",
            expectedSolution: "A + B + C = 180°",
            isCorrect: false,
            timeSpent: 12,
            aiPrompts: [
              {
                prompt: "How do I start a geometry proof?",
                response:
                  "Start by drawing a clear diagram and listing what you know (given information) and what you need to prove. Then think about which geometric properties or theorems might help.",
                timestamp: "2025-06-28T11:15:00Z",
                helpful: true,
              },
            ],
            attempts: [
              {
                attempt: 1,
                solution: "Still working on understanding the problem",
                timestamp: "2025-06-28T11:20:00Z",
                feedback:
                  "Take your time to understand the problem. Consider drawing a triangle and labeling the angles.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    studentId: "4",
    studentName: "Tom Fischer",
    group: "Basic Math",
    assignments: [
      {
        assignmentId: "1",
        assignmentTitle: "Linear Equations Practice",
        status: "Overdue",
        timeSpent: 15,
        progress: 30,
        lastActivity: "2025-06-23T13:45:00Z",
        dueDate: "2025-06-28T23:59:00Z",
        solutions: [
          {
            problemId: "p1",
            problemText: "Solve for x: 2x + 5 = 13",
            studentSolution:
              "I think x = 9?\n\nI tried:\n2x + 5 = 13\n2x = 13 + 5\n2x = 18\nx = 9\n\nBut this doesn't seem right when I check it...",
            expectedSolution: "x = 4",
            isCorrect: false,
            timeSpent: 15,
            aiPrompts: [
              {
                prompt: "I'm really confused about solving equations",
                response:
                  "Let's break it down step by step. When you have 2x + 5 = 13, think about what operations are being done to x, then do the opposite operations in reverse order.",
                timestamp: "2025-06-23T13:30:00Z",
                helpful: false,
              },
              {
                prompt: "What does 'opposite operations' mean?",
                response:
                  "If the equation shows addition, you use subtraction to undo it. If it shows multiplication, you use division. The goal is to get x by itself.",
                timestamp: "2025-06-23T13:35:00Z",
                helpful: true,
              },
              {
                prompt: "I keep getting the wrong answer",
                response:
                  "I see you added 5 instead of subtracting it. Remember: to undo +5, you need to subtract 5 from both sides. Try: 2x + 5 = 13, so 2x = 13 - 5.",
                timestamp: "2025-06-23T13:40:00Z",
                helpful: true,
              },
            ],
            attempts: [
              {
                attempt: 1,
                solution: "x = 9",
                timestamp: "2025-06-23T13:42:00Z",
                feedback:
                  "Incorrect. You added 5 instead of subtracting it. Try again.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    studentId: "5",
    studentName: "Max Müller",
    group: "Advanced Math",
    assignments: [
      {
        assignmentId: "1",
        assignmentTitle: "Linear Equations Practice",
        status: "Completed",
        score: 92,
        maxScore: 100,
        timeSpent: 38,
        progress: 100,
        lastActivity: "2025-06-27T15:20:00Z",
        dueDate: "2025-06-28T23:59:00Z",
        submissionDate: "2025-06-27T15:20:00Z",
        solutions: [
          {
            problemId: "p1",
            problemText: "Solve for x: 2x + 5 = 13",
            studentSolution:
              "x = 4\n\nSolution:\n2x + 5 = 13\n2x = 13 - 5\n2x = 8\nx = 8/2\nx = 4\n\nCheck: 2(4) + 5 = 8 + 5 = 13 ✓",
            expectedSolution: "x = 4",
            isCorrect: true,
            timeSpent: 7,
            aiPrompts: [],
            attempts: [
              {
                attempt: 1,
                solution: "x = 4",
                timestamp: "2025-06-27T15:10:00Z",
                feedback:
                  "Excellent! You even verified your answer by checking.",
              },
            ],
          },
          {
            problemId: "p2",
            problemText: "Solve for y: 3y - 7 = 14",
            studentSolution:
              "y = 7\n\nStep by step:\n3y - 7 = 14\n3y = 14 + 7\n3y = 21\ny = 21/3\ny = 7",
            expectedSolution: "y = 7",
            isCorrect: true,
            timeSpent: 5,
            aiPrompts: [],
            attempts: [
              {
                attempt: 1,
                solution: "y = 7",
                timestamp: "2025-06-27T15:15:00Z",
                feedback: "Perfect! Very clean solution.",
              },
            ],
          },
        ],
      },
      {
        assignmentId: "2",
        assignmentTitle: "Geometry Proofs",
        status: "Completed",
        score: 94,
        maxScore: 100,
        timeSpent: 72,
        progress: 100,
        lastActivity: "2025-06-29T16:30:00Z",
        dueDate: "2025-07-01T23:59:00Z",
        submissionDate: "2025-06-29T16:30:00Z",
        solutions: [
          {
            problemId: "p3",
            problemText:
              "Prove that the sum of angles in a triangle equals 180°",
            studentSolution:
              "Proof:\nGiven: Triangle ABC with angles ∠A, ∠B, ∠C\nTo Prove: ∠A + ∠B + ∠C = 180°\n\nConstruction: Draw line DE through vertex A parallel to side BC\n\nProof:\n1. ∠DAB = ∠ABC (alternate interior angles)\n2. ∠EAC = ∠ACB (alternate interior angles)\n3. ∠DAB + ∠BAC + ∠EAC = 180° (angles on a straight line)\n4. Substituting from steps 1 and 2:\n   ∠ABC + ∠BAC + ∠ACB = 180°\n\nTherefore, the sum of angles in triangle ABC = 180°",
            expectedSolution: "A + B + C = 180°",
            isCorrect: true,
            timeSpent: 45,
            aiPrompts: [
              {
                prompt: "What's the key insight for this proof?",
                response:
                  "The key is to use parallel lines to create alternate interior angles that are equal to the triangle's angles, then use the fact that angles on a straight line sum to 180°.",
                timestamp: "2025-06-29T16:00:00Z",
                helpful: true,
              },
            ],
            attempts: [
              {
                attempt: 1,
                solution: "Complete proof using parallel lines",
                timestamp: "2025-06-29T16:30:00Z",
                feedback:
                  "Outstanding proof! Clear construction and logical steps.",
              },
            ],
          },
        ],
      },
      {
        assignmentId: "3",
        assignmentTitle: "Statistics Basics",
        status: "In Progress",
        timeSpent: 18,
        progress: 40,
        lastActivity: "2025-06-30T10:15:00Z",
        dueDate: "2025-06-30T23:59:00Z",
        solutions: [
          {
            problemId: "p5",
            problemText:
              "Calculate the mean of the following data set: 12, 15, 18, 22, 25, 28",
            studentSolution:
              "Working on this...\nSum = 12 + 15 + 18 + 22 + 25 + 28 = 120\nCount = 6 numbers\nMean = 120/6 = 20",
            expectedSolution: "Mean = 20",
            isCorrect: true,
            timeSpent: 8,
            aiPrompts: [],
            attempts: [
              {
                attempt: 1,
                solution: "Mean = 20",
                timestamp: "2025-06-30T10:15:00Z",
                feedback: "Correct! Continue with the remaining problems.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    studentId: "6",
    studentName: "Sarah Klein",
    group: "Geometry Focus",
    assignments: [
      {
        assignmentId: "2",
        assignmentTitle: "Geometry Proofs",
        status: "Completed",
        score: 96,
        maxScore: 100,
        timeSpent: 85,
        progress: 100,
        lastActivity: "2025-06-28T19:45:00Z",
        dueDate: "2025-07-01T23:59:00Z",
        submissionDate: "2025-06-28T19:45:00Z",
        solutions: [
          {
            problemId: "p3",
            problemText:
              "Prove that the sum of angles in a triangle equals 180°",
            studentSolution:
              "Proof by Construction:\n\nGiven: Triangle PQR\nTo Prove: ∠P + ∠Q + ∠R = 180°\n\nConstruction: Extend side QR to point S, and draw line PT parallel to QR\n\nProof:\n1. ∠TPQ = ∠PQR (corresponding angles, PT || QR)\n2. ∠RPT = ∠PRQ (alternate angles, PT || QR)\n3. ∠TPQ + ∠QPR + ∠RPT = 180° (straight line angles)\n4. Substituting:\n   ∠PQR + ∠QPR + ∠PRQ = 180°\n\nHence proved that sum of angles in triangle = 180°",
            expectedSolution: "A + B + C = 180°",
            isCorrect: true,
            timeSpent: 55,
            aiPrompts: [
              {
                prompt: "Is there an alternative method to prove this?",
                response:
                  "Yes! You could also extend one side and use exterior angle theorem, or use coordinate geometry. Your parallel line approach is excellent though.",
                timestamp: "2025-06-28T19:20:00Z",
                helpful: true,
              },
            ],
            attempts: [
              {
                attempt: 1,
                solution: "Complete geometric proof with construction",
                timestamp: "2025-06-28T19:45:00Z",
                feedback:
                  "Exceptional work! Clear diagram, construction, and logical proof steps.",
              },
            ],
          },
          {
            problemId: "p4",
            problemText:
              "Prove that opposite angles in a parallelogram are equal",
            studentSolution:
              "Given: ABCD is a parallelogram\nTo Prove: ∠A = ∠C and ∠B = ∠D\n\nProof:\nSince ABCD is a parallelogram:\n1. AB || DC and AD || BC (definition of parallelogram)\n2. Draw diagonal AC\n3. ∠BAC = ∠DCA (alternate angles, AB || DC)\n4. ∠BCA = ∠DAC (alternate angles, AD || BC)\n5. In triangles ABC and CDA:\n   - AC = AC (common side)\n   - ∠BAC = ∠DCA (from step 3)\n   - ∠BCA = ∠DAC (from step 4)\n6. Therefore, △ABC ≅ △CDA (ASA)\n7. Hence, ∠ABC = ∠CDA and ∠BCD = ∠DAB\n\nTherefore, opposite angles are equal.",
            expectedSolution: "∠A = ∠C and ∠B = ∠D",
            isCorrect: true,
            timeSpent: 30,
            aiPrompts: [],
            attempts: [
              {
                attempt: 1,
                solution: "Complete proof using triangle congruence",
                timestamp: "2025-06-28T19:40:00Z",
                feedback:
                  "Brilliant! You used congruent triangles beautifully.",
              },
            ],
          },
        ],
      },
      {
        assignmentId: "1",
        assignmentTitle: "Linear Equations Practice",
        status: "Completed",
        score: 89,
        maxScore: 100,
        timeSpent: 42,
        progress: 100,
        lastActivity: "2025-06-26T14:30:00Z",
        dueDate: "2025-06-28T23:59:00Z",
        submissionDate: "2025-06-26T14:30:00Z",
        solutions: [
          {
            problemId: "p1",
            problemText: "Solve for x: 2x + 5 = 13",
            studentSolution: "x = 4\n\n2x + 5 = 13\n2x = 13 - 5\n2x = 8\nx = 4",
            expectedSolution: "x = 4",
            isCorrect: true,
            timeSpent: 6,
            aiPrompts: [],
            attempts: [
              {
                attempt: 1,
                solution: "x = 4",
                timestamp: "2025-06-26T14:25:00Z",
                feedback: "Correct! Clean and efficient solution.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    studentId: "7",
    studentName: "Leon Hoffman",
    group: "Statistics Group",
    assignments: [
      {
        assignmentId: "1",
        assignmentTitle: "Linear Equations Practice",
        status: "In Progress",
        timeSpent: 28,
        progress: 65,
        lastActivity: "2025-06-29T12:45:00Z",
        dueDate: "2025-06-28T23:59:00Z",
        solutions: [
          {
            problemId: "p1",
            problemText: "Solve for x: 2x + 5 = 13",
            studentSolution:
              "x = 4\n\nMy work:\n2x + 5 = 13\nSubtract 5 from both sides:\n2x = 13 - 5\n2x = 8\nDivide both sides by 2:\nx = 8 ÷ 2\nx = 4\n\nCheck: 2(4) + 5 = 8 + 5 = 13 ✓",
            expectedSolution: "x = 4",
            isCorrect: true,
            timeSpent: 12,
            aiPrompts: [
              {
                prompt: "Should I always check my answer?",
                response:
                  "Yes! Checking your answer by substituting it back into the original equation is a great habit. It helps you catch any arithmetic errors.",
                timestamp: "2025-06-29T12:30:00Z",
                helpful: true,
              },
            ],
            attempts: [
              {
                attempt: 1,
                solution: "x = 4",
                timestamp: "2025-06-29T12:35:00Z",
                feedback: "Excellent work! Great explanation and verification.",
              },
            ],
          },
          {
            problemId: "p2",
            problemText: "Solve for y: 3y - 7 = 14",
            studentSolution:
              "I'm working on this one...\n3y - 7 = 14\nI need to add 7 to both sides first\n3y = 14 + 7\n3y = 21\nNow divide by 3\ny = 21 ÷ 3\ny = 7",
            expectedSolution: "y = 7",
            isCorrect: true,
            timeSpent: 16,
            aiPrompts: [
              {
                prompt: "What's the first step when I see 3y - 7?",
                response:
                  "Great question! When you see subtraction like '- 7', you want to undo it by adding 7 to both sides. This isolates the term with the variable.",
                timestamp: "2025-06-29T12:40:00Z",
                helpful: true,
              },
              {
                prompt: "How do I know if I did it right?",
                response:
                  "You can check by substituting your answer back: 3(7) - 7 = 21 - 7 = 14. Since this equals the right side of the original equation, you're correct!",
                timestamp: "2025-06-29T12:42:00Z",
                helpful: true,
              },
            ],
            attempts: [
              {
                attempt: 1,
                solution: "y = 7",
                timestamp: "2025-06-29T12:45:00Z",
                feedback:
                  "Well done! You showed good understanding of the steps.",
              },
            ],
          },
        ],
      },
      {
        assignmentId: "2",
        assignmentTitle: "Geometry Proofs",
        status: "Not Started",
        timeSpent: 0,
        progress: 0,
        lastActivity: "2025-06-29T12:45:00Z",
        dueDate: "2025-07-01T23:59:00Z",
        solutions: [],
      },
    ],
  },
];

const studentWorkloadData: StudentWorkload[] = [
  {
    studentId: "1",
    group: "Advanced Math",
    activeAssignments: 1,
    completedThisWeek: 1,
    totalTimeSpent: 70,
    averageScore: 95,
    upcomingDeadlines: 1,
  },
  {
    studentId: "2",
    group: "Basic Math",
    activeAssignments: 1,
    completedThisWeek: 1,
    totalTimeSpent: 80,
    averageScore: 78,
    upcomingDeadlines: 2,
  },
  {
    studentId: "3",
    group: "Advanced Math",
    activeAssignments: 1,
    completedThisWeek: 1,
    totalTimeSpent: 80,
    averageScore: 88,
    upcomingDeadlines: 1,
  },
  {
    studentId: "4",
    group: "Basic Math",
    activeAssignments: 2,
    completedThisWeek: 0,
    totalTimeSpent: 15,
    averageScore: 0,
    upcomingDeadlines: 2,
  },
  {
    studentId: "5",
    group: "Advanced Math",
    activeAssignments: 1,
    completedThisWeek: 1,
    totalTimeSpent: 80,
    averageScore: 88,
    upcomingDeadlines: 1,
  },
  {
    studentId: "6",
    group: "Advanced Math",
    activeAssignments: 1,
    completedThisWeek: 1,
    totalTimeSpent: 80,
    averageScore: 88,
    upcomingDeadlines: 1,
  },
  {
    studentId: "7",
    group: "Basic Math",
    activeAssignments: 1,
    completedThisWeek: 1,
    totalTimeSpent: 80,
    averageScore: 88,
    upcomingDeadlines: 1,
  },
];
