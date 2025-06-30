"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Edit,
  Eye,
  Pause,
  Play,
  Plus,
  Trash2,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";

// Copied from students/page.tsx for the dialog
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  group: string;
  performance: "Excellent" | "Good" | "Average" | "Needs Improvement";
  joinDate: string;
}

interface BookProblem {
  id: string;
  bookTitle: string;
  chapter: string;
  section: string;
  problemNumber: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  problemText: string;
  solution: string;
  estimatedTime: number;
}

interface CustomProblem {
  id: string;
  problemText: string;
  solution: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedTime: number;
  topic: string;
}

interface Assignment {
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
  book?: string;
  chapters?: string[];
  bookProblems?: BookProblem[];
  customProblems?: CustomProblem[];
}

interface ProblemAttempt {
  problemId: string;
  problemText: string;
  expectedSolution: string;
  studentSolution: string;
  status: "Correct" | "Incorrect" | "Partially Correct";
  aiPrompts: string[];
}

interface StudentProgress {
  studentId: string;
  studentName: string;
  assignmentId: string;
  assignmentTitle: string;
  status: "Not Started" | "In Progress" | "Completed" | "Overdue";
  timeSpent: number; // in minutes
  aiPromptsUsed: number;
  progress: number; // percentage 0-100
  lastActivity: string;
  score?: number;
  maxScore?: number;
  problemAttempts?: ProblemAttempt[];
}

interface StudentWorkload {
  studentId: string;
  studentName: string;
  group: string;
  activeAssignments: number;
  completedThisWeek: number;
  totalTimeSpent: number;
  averageScore: number;
  upcomingDeadlines: number;
}

// Using the full AIEvaluation interface from students/page.tsx
interface AIEvaluation {
  studentId: string;
  lastUpdated: string;
  strengths: {
    [concept: string]: {
      score: number; // 0-100
      evidence: string[];
    };
  };
  weaknesses: {
    [concept: string]: {
      score: number; // 0-100 (lower is weaker)
      evidence: string[];
    };
  };
  characterTraits: {
    trait: string;
    level: "Low" | "Moderate" | "High";
    description: string;
  }[];
  motivationStrategies: {
    strategy: string;
    effectiveness: number; // 0-100
    examples: string[];
  }[];
  quickOverview: {
    overallScore: number;
    primaryStrength: string;
    primaryWeakness: string;
    recommendedFocus: string;
    motivationStyle: string;
  };
}

// Copied from students/page.tsx for the dialog
const initialStudents: Student[] = [
  {
    id: "1",
    firstName: "Anna",
    lastName: "Müller",
    email: "anna.mueller@school.de",
    grade: "10A",
    group: "Advanced Math",
    performance: "Excellent",
    joinDate: "2025-01-15",
  },
  {
    id: "2",
    firstName: "Max",
    lastName: "Schmidt",
    email: "max.schmidt@school.de",
    grade: "10A",
    group: "Basic Math",
    performance: "Good",
    joinDate: "2025-02-10",
  },
  {
    id: "3",
    firstName: "Lisa",
    lastName: "Weber",
    email: "lisa.weber@school.de",
    grade: "9B",
    group: "Advanced Math",
    performance: "Excellent",
    joinDate: "2025-03-01",
  },
  {
    id: "4",
    firstName: "Tom",
    lastName: "Fischer",
    email: "tom.fischer@school.de",
    grade: "9B",
    group: "Basic Math",
    performance: "Average",
    joinDate: "2025-04-15",
  },
  {
    id: "5",
    firstName: "Sarah",
    lastName: "Klein",
    email: "sarah.klein@school.de",
    grade: "10B",
    group: "Basic Math",
    performance: "Good",
    joinDate: "2025-01-20",
  },
  {
    id: "6",
    firstName: "Emma",
    lastName: "Bauer",
    email: "emma.bauer@school.de",
    grade: "10A",
    group: "Geometry Focus",
    performance: "Excellent",
    joinDate: "2025-02-15",
  },
  {
    id: "7",
    firstName: "Leon",
    lastName: "Hoffmann",
    email: "leon.hoffmann@school.de",
    grade: "9B",
    group: "Geometry Focus",
    performance: "Good",
    joinDate: "2025-03-10",
  },
];

// Add helper function to get focus recommendations
const getFocusRecommendations = (studentId: string) => {
  const evaluation = aiEvaluationData.find(
    (evaluationData) => evaluationData.studentId === studentId,
  );
  if (!evaluation) return null;

  return {
    shouldFocus:
      evaluation.quickOverview.overallScore < 70 ||
      Object.values(evaluation.weaknesses).some((w: any) => w.score < 50),
    primaryWeakness: evaluation.quickOverview.primaryWeakness,
    recommendedFocus: evaluation.quickOverview.recommendedFocus,
    motivationStyle: evaluation.quickOverview.motivationStyle,
  };
};

// Mock book problems from scanned books
const availableBookProblems: BookProblem[] = [
  // Mathematik für Ingenieure und Naturwissenschaftler
  {
    id: "bp1",
    bookTitle: "Mathematik für Ingenieure und Naturwissenschaftler",
    chapter: "Kapitel 3",
    section: "3.1",
    problemNumber: "3.1.1",
    difficulty: "Easy",
    topic: "Lineare Gleichungen",
    problemText: "Lösen Sie die Gleichung: 2x + 5 = 13",
    solution: "x = 4\n\nLösungsweg:\n2x + 5 = 13\n2x = 13 - 5\n2x = 8\nx = 4",
    estimatedTime: 5,
  },
  {
    id: "bp2",
    bookTitle: "Mathematik für Ingenieure und Naturwissenschaftler",
    chapter: "Kapitel 3",
    section: "3.2",
    problemNumber: "3.2.3",
    difficulty: "Medium",
    topic: "Quadratische Gleichungen",
    problemText: "Lösen Sie die quadratische Gleichung: x² - 5x + 6 = 0",
    solution:
      "x₁ = 2, x₂ = 3\n\nLösungsweg:\nx² - 5x + 6 = 0\n(x - 2)(x - 3) = 0\nx = 2 oder x = 3",
    estimatedTime: 10,
  },
  {
    id: "bp3",
    bookTitle: "Mathematik für Ingenieure und Naturwissenschaftler",
    chapter: "Kapitel 4",
    section: "4.1",
    problemNumber: "4.1.2",
    difficulty: "Hard",
    topic: "Funktionen",
    problemText: "Bestimmen Sie die Ableitung von f(x) = x³ - 2x² + 3x - 1",
    solution:
      "f'(x) = 3x² - 4x + 3\n\nLösungsweg:\nf(x) = x³ - 2x² + 3x - 1\nf'(x) = 3x² - 4x + 3",
    estimatedTime: 15,
  },
  {
    id: "bp4",
    bookTitle: "Mathematik für Ingenieure und Naturwissenschaftler",
    chapter: "Kapitel 5",
    section: "5.3",
    problemNumber: "5.3.1",
    difficulty: "Medium",
    topic: "Integrale",
    problemText: "Berechnen Sie das Integral: ∫(3x² + 2x - 1)dx",
    solution:
      "x³ + x² - x + C\n\nLösungsweg:\n∫(3x² + 2x - 1)dx = 3∫x²dx + 2∫xdx - ∫1dx = x³ + x² - x + C",
    estimatedTime: 12,
  },

  // Grundlagen der Mathematik für Dummies
  {
    id: "bp5",
    bookTitle: "Grundlagen der Mathematik für Dummies",
    chapter: "Kapitel 2",
    section: "2.1",
    problemNumber: "2.1.1",
    difficulty: "Easy",
    topic: "Grundrechenarten",
    problemText: "Berechnen Sie: 15 + 23 - 8",
    solution: "30\n\nLösungsweg:\n15 + 23 = 38\n38 - 8 = 30",
    estimatedTime: 3,
  },
  {
    id: "bp6",
    bookTitle: "Grundlagen der Mathematik für Dummies",
    chapter: "Kapitel 5",
    section: "5.2",
    problemNumber: "5.2.4",
    difficulty: "Medium",
    topic: "Bruchrechnung",
    problemText: "Vereinfachen Sie: 3/4 + 2/3",
    solution: "17/12\n\nLösungsweg:\n3/4 + 2/3 = 9/12 + 8/12 = 17/12",
    estimatedTime: 8,
  },
];

const availableBooks = [
  {
    id: "book1",
    title: "Mathematik für Ingenieure und Naturwissenschaftler",
    author: "Lothar Papula",
    isbn: "9783827420923",
  },
  {
    id: "book2",
    title: "Grundlagen der Mathematik für Dummies",
    author: "Mark Zegarelli",
    isbn: "9783446451827",
  },
  {
    id: "book3",
    title: "Lineare Algebra",
    author: "Gerd Fischer",
    isbn: "9783662616789",
  },
  {
    id: "book4",
    title: "Analysis 1",
    author: "Otto Forster",
    isbn: "9783825252847",
  },
];

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
    book: "Mathematik für Ingenieure und Naturwissenschaftler",
    chapters: ["Chapter 3", "Chapter 4"],
    bookProblems: [availableBookProblems[0], availableBookProblems[1]],
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
    book: "Mathematik für Ingenieure und Naturwissenschaftler",
    chapters: ["Chapter 4"],
    bookProblems: [availableBookProblems[2]],
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
        problemText:
          "Calculate the mean of the following numbers: 2, 4, 6, 8, 10",
        solution: "Mean = (2+4+6+8+10) / 5 = 30 / 5 = 6",
        difficulty: "Easy",
        estimatedTime: 5,
        topic: "Mean",
      },
      {
        id: "custom2",
        problemText: "Find the median of: 7, 1, 3, 8, 2",
        solution:
          "Sorted list: 1, 2, 3, 7, 8. The median is the middle number, which is 3.",
        difficulty: "Easy",
        estimatedTime: 5,
        topic: "Median",
      },
      {
        id: "custom3",
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

// Mock student progress data with problem attempts
const studentProgressData: StudentProgress[] = [
  // Advanced Math Group
  {
    studentId: "1",
    studentName: "Anna Müller",
    assignmentId: "1",
    assignmentTitle: "Linear Equations Practice",
    status: "Completed",
    timeSpent: 45,
    aiPromptsUsed: 3,
    progress: 100,
    lastActivity: "2025-06-26T10:30:00Z",
    score: 95,
    maxScore: 100,
    problemAttempts: [
      {
        problemId: "bp1",
        problemText: "Lösen Sie die Gleichung: 2x + 5 = 13",
        expectedSolution:
          "x = 4\n\nLösungsweg:\n2x + 5 = 13\n2x = 13 - 5\n2x = 8\nx = 4",
        studentSolution: "2x = 13 - 5\n2x = 8\nx = 4",
        status: "Correct",
        aiPrompts: ["How to start solving for x in 2x+5=13?"],
      },
      {
        problemId: "bp2",
        problemText: "Lösen Sie die quadratische Gleichung: x² - 5x + 6 = 0",
        expectedSolution:
          "x₁ = 2, x₂ = 3\n\nLösungsweg:\nx² - 5x + 6 = 0\n(x - 2)(x - 3) = 0\nx = 2 oder x = 3",
        studentSolution:
          "I used the quadratic formula. x = (5 ± sqrt(25 - 24)) / 2. x = (5 ± 1) / 2. So x = 3. I missed the second solution.",
        status: "Partially Correct",
        aiPrompts: [
          "What is the quadratic formula?",
          "How to factor x^2 - 5x + 6?",
        ],
      },
    ],
  },
  {
    studentId: "1",
    studentName: "Anna Müller",
    assignmentId: "2",
    assignmentTitle: "Geometry Proofs",
    status: "In Progress",
    timeSpent: 25,
    aiPromptsUsed: 7,
    progress: 60,
    lastActivity: "2025-06-27T14:15:00Z",
  },
  {
    studentId: "3",
    studentName: "Lisa Weber",
    assignmentId: "1",
    assignmentTitle: "Linear Equations Practice",
    status: "Completed",
    timeSpent: 38,
    aiPromptsUsed: 2,
    progress: 100,
    lastActivity: "2025-06-24T16:45:00Z",
    score: 88,
    maxScore: 100,
  },
  {
    studentId: "3",
    studentName: "Lisa Weber",
    assignmentId: "2",
    assignmentTitle: "Geometry Proofs",
    status: "In Progress",
    timeSpent: 42,
    aiPromptsUsed: 5,
    progress: 75,
    lastActivity: "2025-06-27T11:20:00Z",
  },
  // Basic Math Group
  {
    studentId: "2",
    studentName: "Max Schmidt",
    assignmentId: "1",
    assignmentTitle: "Linear Equations Practice",
    status: "Completed",
    timeSpent: 65,
    aiPromptsUsed: 12,
    progress: 100,
    lastActivity: "2025-06-25T09:30:00Z",
    score: 78,
    maxScore: 100,
    problemAttempts: [
      {
        problemId: "bp1",
        problemText: "Lösen Sie die Gleichung: 2x + 5 = 13",
        expectedSolution:
          "x = 4\n\nLösungsweg:\n2x + 5 = 13\n2x = 13 - 5\n2x = 8\nx = 4",
        studentSolution: "2x = 13 - 5\n2x = 8\nx = 4",
        status: "Correct",
        aiPrompts: ["how to solve 2x+5=13", "what is 13-5"],
      },
      {
        problemId: "bp2",
        problemText: "Lösen Sie die quadratische Gleichung: x² - 5x + 6 = 0",
        expectedSolution:
          "x₁ = 2, x₂ = 3\n\nLösungsweg:\nx² - 5x + 6 = 0\n(x - 2)(x - 3) = 0\nx = 2 oder x = 3",
        studentSolution: "x = 2",
        status: "Incorrect",
        aiPrompts: [
          "how to solve x^2 - 5x + 6 = 0",
          "what are factors of 6",
          "what is the quadratic formula",
          "can you solve it for me",
        ],
      },
    ],
  },
  {
    studentId: "4",
    studentName: "Tom Fischer",
    assignmentId: "1",
    assignmentTitle: "Linear Equations Practice",
    status: "Overdue",
    timeSpent: 15,
    aiPromptsUsed: 8,
    progress: 30,
    lastActivity: "2025-06-23T13:45:00Z",
  },
  {
    studentId: "5",
    studentName: "Sarah Klein",
    assignmentId: "1",
    assignmentTitle: "Linear Equations Practice",
    status: "In Progress",
    timeSpent: 32,
    aiPromptsUsed: 6,
    progress: 45,
    lastActivity: "2025-06-26T15:30:00Z",
  },
  // Geometry Focus Group
  {
    studentId: "6",
    studentName: "Emma Bauer",
    assignmentId: "2",
    assignmentTitle: "Geometry Proofs",
    status: "Completed",
    timeSpent: 80,
    aiPromptsUsed: 4,
    progress: 100,
    lastActivity: "2025-06-25T12:00:00Z",
    score: 92,
    maxScore: 100,
  },
  {
    studentId: "7",
    studentName: "Leon Hoffmann",
    assignmentId: "2",
    assignmentTitle: "Geometry Proofs",
    status: "In Progress",
    timeSpent: 55,
    aiPromptsUsed: 9,
    progress: 80,
    lastActivity: "2025-06-27T16:45:00Z",
  },
];

const studentWorkloadData: StudentWorkload[] = [
  {
    studentId: "1",
    studentName: "Anna Müller",
    group: "Advanced Math",
    activeAssignments: 1,
    completedThisWeek: 1,
    totalTimeSpent: 70,
    averageScore: 95,
    upcomingDeadlines: 1,
  },
  {
    studentId: "3",
    studentName: "Lisa Weber",
    group: "Advanced Math",
    activeAssignments: 1,
    completedThisWeek: 1,
    totalTimeSpent: 80,
    averageScore: 88,
    upcomingDeadlines: 1,
  },
  {
    studentId: "2",
    studentName: "Max Schmidt",
    group: "Basic Math",
    activeAssignments: 0,
    completedThisWeek: 1,
    totalTimeSpent: 65,
    averageScore: 78,
    upcomingDeadlines: 0,
  },
  {
    studentId: "4",
    studentName: "Tom Fischer",
    group: "Basic Math",
    activeAssignments: 1,
    completedThisWeek: 0,
    totalTimeSpent: 15,
    averageScore: 0,
    upcomingDeadlines: 1,
  },
  {
    studentId: "5",
    studentName: "Sarah Klein",
    group: "Basic Math",
    activeAssignments: 1,
    completedThisWeek: 0,
    totalTimeSpent: 32,
    averageScore: 0,
    upcomingDeadlines: 1,
  },
  {
    studentId: "6",
    studentName: "Emma Bauer",
    group: "Geometry Focus",
    activeAssignments: 0,
    completedThisWeek: 1,
    totalTimeSpent: 80,
    averageScore: 92,
    upcomingDeadlines: 0,
  },
  {
    studentId: "7",
    studentName: "Leon Hoffmann",
    group: "Geometry Focus",
    activeAssignments: 1,
    completedThisWeek: 0,
    totalTimeSpent: 55,
    averageScore: 0,
    upcomingDeadlines: 1,
  },
];

// Using the full AI evaluation data from students/page.tsx
const aiEvaluationData: AIEvaluation[] = [
  {
    studentId: "1",
    lastUpdated: "2025-06-27",
    strengths: {
      "Linear Equations": {
        score: 95,
        evidence: [
          "Solved complex equations quickly",
          "Showed multiple solution methods",
          "Helped other students",
        ],
      },
      "Problem Solving": {
        score: 88,
        evidence: [
          "Breaks down complex problems systematically",
          "Uses logical reasoning effectively",
        ],
      },
      "Mathematical Communication": {
        score: 92,
        evidence: [
          "Explains solutions clearly",
          "Uses proper mathematical notation",
        ],
      },
    },
    weaknesses: {
      "Geometry Proofs": {
        score: 65,
        evidence: [
          "Struggles with formal proof structure",
          "Needs more practice with logical flow",
        ],
      },
      "Time Management": {
        score: 70,
        evidence: [
          "Sometimes rushes through problems",
          "Could benefit from more careful checking",
        ],
      },
    },
    characterTraits: [
      {
        trait: "Perfectionism",
        level: "High",
        description:
          "Tends to spend too much time on details, sometimes at the expense of completing all problems",
      },
      {
        trait: "Collaboration",
        level: "High",
        description: "Enjoys helping classmates and working in groups",
      },
      {
        trait: "Persistence",
        level: "High",
        description: "Doesn't give up easily when facing difficult problems",
      },
    ],
    motivationStrategies: [
      {
        strategy: "Leadership Opportunities",
        effectiveness: 90,
        examples: [
          "Let Anna explain solutions to the class",
          "Assign her as a peer tutor",
        ],
      },
      {
        strategy: "Advanced Challenges",
        effectiveness: 85,
        examples: [
          "Provide extension problems",
          "Introduce competition-level questions",
        ],
      },
      {
        strategy: "Real-world Applications",
        effectiveness: 80,
        examples: [
          "Engineering problems",
          "Architecture and design challenges",
        ],
      },
    ],
    quickOverview: {
      overallScore: 87,
      primaryStrength: "Linear Equations & Problem Solving",
      primaryWeakness: "Geometry Proofs",
      recommendedFocus: "Formal proof writing and logical structure",
      motivationStyle: "Leadership and advanced challenges",
    },
  },
  {
    studentId: "2",
    lastUpdated: "2025-06-26",
    strengths: {
      Perseverance: {
        score: 90,
        evidence: [
          "Never gives up on difficult problems",
          "Shows improvement over time",
          "Asks thoughtful questions",
        ],
      },
      "Basic Arithmetic": {
        score: 82,
        evidence: [
          "Strong foundation in calculations",
          "Accurate with basic operations",
        ],
      },
    },
    weaknesses: {
      "Abstract Thinking": {
        score: 45,
        evidence: [
          "Struggles with algebraic concepts",
          "Needs concrete examples",
          "Difficulty with variables",
        ],
      },
      Speed: {
        score: 50,
        evidence: [
          "Takes longer than average to complete problems",
          "Needs more time for processing",
        ],
      },
      Confidence: {
        score: 40,
        evidence: [
          "Often second-guesses correct answers",
          "Relies heavily on AI assistance",
          "Hesitant to participate",
        ],
      },
    },
    characterTraits: [
      {
        trait: "Self-doubt",
        level: "High",
        description:
          "Frequently questions his own abilities despite making progress",
      },
      {
        trait: "Methodical",
        level: "High",
        description: "Prefers step-by-step approaches and clear instructions",
      },
      {
        trait: "Effort",
        level: "High",
        description: "Consistently puts in effort even when struggling",
      },
    ],
    motivationStrategies: [
      {
        strategy: "Sports Analogies",
        effectiveness: 95,
        examples: [
          "Football field measurements",
          "Soccer statistics and probability",
          "Basketball shooting angles",
        ],
      },
      {
        strategy: "Confidence Building",
        effectiveness: 88,
        examples: [
          "Celebrate small wins",
          "Start with easier problems",
          "Positive reinforcement",
        ],
      },
      {
        strategy: "Concrete Examples",
        effectiveness: 85,
        examples: [
          "Use physical objects",
          "Real-world scenarios",
          "Visual representations",
        ],
      },
    ],
    quickOverview: {
      overallScore: 62,
      primaryStrength: "Perseverance & Work Ethic",
      primaryWeakness: "Abstract Thinking & Confidence",
      recommendedFocus:
        "Building confidence through concrete examples and sports-related problems",
      motivationStyle: "Sports analogies and confidence building",
    },
  },
  {
    studentId: "3",
    lastUpdated: "2025-06-27",
    strengths: {
      "Pattern Recognition": {
        score: 93,
        evidence: [
          "Quickly identifies mathematical patterns",
          "Excellent at sequence problems",
          "Strong visual-spatial skills",
        ],
      },
      Geometry: {
        score: 89,
        evidence: [
          "Natural understanding of shapes and angles",
          "Good spatial reasoning",
        ],
      },
      "Independent Learning": {
        score: 91,
        evidence: [
          "Self-motivated",
          "Researches topics beyond curriculum",
          "Minimal AI assistance needed",
        ],
      },
    },
    weaknesses: {
      "Computational Accuracy": {
        score: 68,
        evidence: [
          "Makes careless arithmetic errors",
          "Rushes through calculations",
        ],
      },
      "Showing Work": {
        score: 55,
        evidence: [
          "Often skips steps",
          "Difficulty explaining reasoning",
          "Assumes others understand her thinking",
        ],
      },
    },
    characterTraits: [
      {
        trait: "Impatience",
        level: "Moderate",
        description:
          "Gets frustrated with repetitive practice and wants to move on quickly",
      },
      {
        trait: "Independence",
        level: "High",
        description: "Prefers working alone and figuring things out herself",
      },
      {
        trait: "Creativity",
        level: "High",
        description: "Often finds unique approaches to problems",
      },
    ],
    motivationStrategies: [
      {
        strategy: "Animal-themed Problems",
        effectiveness: 92,
        examples: [
          "Horse breeding genetics",
          "Animal population growth",
          "Veterinary calculations",
        ],
      },
      {
        strategy: "Creative Challenges",
        effectiveness: 87,
        examples: [
          "Open-ended problems",
          "Multiple solution methods",
          "Design projects",
        ],
      },
      {
        strategy: "Advanced Topics",
        effectiveness: 83,
        examples: [
          "Preview higher-level concepts",
          "Mathematical art projects",
        ],
      },
    ],
    quickOverview: {
      overallScore: 81,
      primaryStrength: "Pattern Recognition & Geometry",
      primaryWeakness: "Showing Work & Computational Accuracy",
      recommendedFocus:
        "Developing clear communication of mathematical reasoning",
      motivationStyle: "Animal themes and creative challenges",
    },
  },
  {
    studentId: "4",
    lastUpdated: "2025-06-25",
    strengths: {
      Creativity: {
        score: 78,
        evidence: [
          "Thinks outside the box",
          "Comes up with unique approaches when engaged",
        ],
      },
    },
    weaknesses: {
      Focus: {
        score: 25,
        evidence: [
          "Easily distracted",
          "Difficulty completing assignments",
          "Mind wanders during explanations",
        ],
      },
      "Basic Operations": {
        score: 35,
        evidence: [
          "Struggles with fundamental arithmetic",
          "Needs review of multiplication tables",
        ],
      },
      Organization: {
        score: 30,
        evidence: [
          "Loses track of steps",
          "Messy work",
          "Forgets to complete assignments",
        ],
      },
      Motivation: {
        score: 20,
        evidence: [
          "Often appears disengaged",
          "Minimal effort on assignments",
          "Avoids challenging problems",
        ],
      },
    },
    characterTraits: [
      {
        trait: "Procrastination",
        level: "High",
        description:
          "Consistently delays starting assignments until the last minute",
      },
      {
        trait: "Avoidance",
        level: "High",
        description: "Tends to avoid difficult tasks and gives up quickly",
      },
      {
        trait: "Social",
        level: "Moderate",
        description:
          "Enjoys group work but can be easily distracted by social interactions",
      },
    ],
    motivationStrategies: [
      {
        strategy: "Gaming Elements",
        effectiveness: 85,
        examples: [
          "Math games and competitions",
          "Point systems",
          "Achievement badges",
        ],
      },
      {
        strategy: "Short Bursts",
        effectiveness: 80,
        examples: [
          "Break work into 10-minute segments",
          "Frequent breaks",
          "Quick wins",
        ],
      },
      {
        strategy: "Peer Support",
        effectiveness: 75,
        examples: ["Partner work", "Study groups", "Peer accountability"],
      },
    ],
    quickOverview: {
      overallScore: 38,
      primaryStrength: "Creative Thinking",
      primaryWeakness: "Focus & Basic Skills",
      recommendedFocus:
        "Building fundamental skills through engaging, short activities",
      motivationStyle: "Gaming elements and peer support",
    },
  },
  {
    studentId: "5",
    lastUpdated: "2025-06-26",
    strengths: {
      "Problem Solving": {
        score: 85,
        evidence: [
          "Good at breaking down problems",
          "Can apply concepts to new situations",
        ],
      },
    },
    weaknesses: {
      "Attention to Detail": {
        score: 60,
        evidence: ["Makes careless mistakes", "Needs to double-check work"],
      },
    },
    characterTraits: [
      {
        trait: "Enthusiasm",
        level: "High",
        description: "Eager to learn and participate",
      },
    ],
    motivationStrategies: [
      {
        strategy: "Group Projects",
        effectiveness: 80,
        examples: ["Collaborative problem-solving", "Team competitions"],
      },
    ],
    quickOverview: {
      overallScore: 75,
      primaryStrength: "Problem Solving",
      primaryWeakness: "Attention to Detail",
      recommendedFocus: "Developing careful work habits",
      motivationStyle: "Collaborative learning",
    },
  },
  {
    studentId: "6",
    lastUpdated: "2025-06-27",
    strengths: {
      "Spatial Reasoning": {
        score: 95,
        evidence: [
          "Excellent at visualizing 3D shapes",
          "Strong understanding of geometric transformations",
        ],
      },
    },
    weaknesses: {
      "Algebraic Skills": {
        score: 70,
        evidence: [
          "Sometimes struggles with complex algebraic manipulation in geometry problems",
        ],
      },
    },
    characterTraits: [
      {
        trait: "Precision",
        level: "High",
        description: "Very careful and accurate in her work",
      },
    ],
    motivationStrategies: [
      {
        strategy: "Visual Puzzles",
        effectiveness: 90,
        examples: ["Geometric puzzles", "Tangrams", "3D modeling challenges"],
      },
    ],
    quickOverview: {
      overallScore: 88,
      primaryStrength: "Spatial Reasoning",
      primaryWeakness: "Algebraic Skills",
      recommendedFocus: "Integrating algebra with geometry",
      motivationStyle: "Visual and hands-on challenges",
    },
  },
  {
    studentId: "7",
    lastUpdated: "2025-06-27",
    strengths: {
      "Logical Thinking": {
        score: 82,
        evidence: [
          "Good at following logical steps in proofs",
          "Can identify flaws in arguments",
        ],
      },
    },
    weaknesses: {
      Confidence: {
        score: 55,
        evidence: ["Hesitant to share answers", "Second-guesses his work"],
      },
    },
    characterTraits: [
      {
        trait: "Quiet",
        level: "High",
        description: "Prefers to listen rather than speak in class",
      },
    ],
    motivationStrategies: [
      {
        strategy: "One-on-one feedback",
        effectiveness: 85,
        examples: ["Regular check-ins", "Private encouragement"],
      },
    ],
    quickOverview: {
      overallScore: 72,
      primaryStrength: "Logical Thinking",
      primaryWeakness: "Confidence",
      recommendedFocus:
        "Building self-assurance through positive reinforcement",
      motivationStyle: "Supportive and encouraging feedback",
    },
  },
];

const availableGroups = [
  "Advanced Math",
  "Basic Math",
  "Geometry Focus",
  "Statistics Group",
  "Algebra Specialists",
];

// Helper functions for the student details dialog
const getPerformanceBadgeVariant = (performance: Student["performance"]) => {
  switch (performance) {
    case "Excellent":
      return "default";
    case "Good":
      return "secondary";
    case "Average":
      return "outline";
    case "Needs Improvement":
      return "destructive";
    default:
      return "outline";
  }
};

const getStudentProgress = (studentId: string) => {
  return studentProgressData.filter(
    (progress) => progress.studentId === studentId,
  );
};

const getStudentWorkload = (studentId: string) => {
  return studentWorkloadData.find(
    (workload) => workload.studentId === studentId,
  );
};

const getAIEvaluation = (studentId: string) => {
  return aiEvaluationData.find(
    (evaluation) => evaluation.studentId === studentId,
  );
};

const getConceptScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
};

const getTraitLevelColor = (level: string) => {
  switch (level) {
    case "High":
      return "text-red-600";
    case "Moderate":
      return "text-yellow-600";
    case "Low":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
};

const getProblemStatusIcon = (status: ProblemAttempt["status"]) => {
  switch (status) {
    case "Correct":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "Incorrect":
      return <XCircle className="h-5 w-5 text-red-500" />;
    case "Partially Correct":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  }
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] =
    useState<Assignment[]>(initialAssignments);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null,
  );
  const [assignGroupsAssignment, setAssignGroupsAssignment] =
    useState<Assignment | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  // Assignment overview state
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(
    null,
  );
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Problem selection states
  const [selectedBookProblems, setSelectedBookProblems] = useState<string[]>(
    [],
  );
  const [customProblems, setCustomProblems] = useState<CustomProblem[]>([]);
  const [newCustomProblem, setNewCustomProblem] = useState({
    problemText: "",
    solution: "",
    difficulty: "Medium" as CustomProblem["difficulty"],
    estimatedTime: 10,
    topic: "",
  });

  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    subject: "",
    dueDate: "",
    estimatedTime: 60,
    difficulty: "Medium" as Assignment["difficulty"],
    selectedBook: "",
  });

  // Progress view state
  const [showProgressView, setShowProgressView] = useState(false);
  const [selectedProgressGroup, setSelectedProgressGroup] =
    useState<string>("all");

  const handleViewStudent = (studentId: string) => {
    const student = initialStudents.find((s) => s.id === studentId);
    if (student) {
      setViewingStudent(student);
    }
  };

  const resetForm = () => {
    setNewAssignment({
      title: "",
      description: "",
      subject: "",
      dueDate: "",
      estimatedTime: 60,
      difficulty: "Medium",
      selectedBook: "",
    });
    setSelectedBookProblems([]);
    setCustomProblems([]);
    setNewCustomProblem({
      problemText: "",
      solution: "",
      difficulty: "Medium",
      estimatedTime: 10,
      topic: "",
    });
  };

  const handleAddAssignment = () => {
    const selectedBookProblemsData = getFilteredBookProblems().filter((p) =>
      selectedBookProblems.includes(p.id),
    );
    const totalEstimatedTime = [
      ...selectedBookProblemsData.map((p) => p.estimatedTime),
      ...customProblems.map((p) => p.estimatedTime),
    ].reduce((sum, time) => sum + time, 0);

    const selectedBookData = availableBooks.find(
      (book) => book.id === newAssignment.selectedBook,
    );

    const assignment: Assignment = {
      id: Date.now().toString(),
      ...newAssignment,
      estimatedTime: totalEstimatedTime || newAssignment.estimatedTime,
      status: "Draft",
      assignedGroups: [],
      createdDate: new Date().toISOString().split("T")[0],
      book: selectedBookData?.title,
      bookProblems: selectedBookProblemsData,
      customProblems: [...customProblems],
    };

    setAssignments([...assignments, assignment]);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleBookProblemSelection = (problemId: string) => {
    setSelectedBookProblems((prev) =>
      prev.includes(problemId)
        ? prev.filter((id) => id !== problemId)
        : [...prev, problemId],
    );
  };

  const handleAddCustomProblem = () => {
    if (newCustomProblem.problemText.trim()) {
      const customProblem: CustomProblem = {
        id: `custom_${Date.now()}`,
        ...newCustomProblem,
      };
      setCustomProblems([...customProblems, customProblem]);
      setNewCustomProblem({
        problemText: "",
        solution: "",
        difficulty: "Medium",
        estimatedTime: 10,
        topic: "",
      });
    }
  };

  const handleRemoveCustomProblem = (problemId: string) => {
    setCustomProblems(customProblems.filter((p) => p.id !== problemId));
  };

  const handleEditAssignment = (assignment: Assignment) => {
    const bookId =
      availableBooks.find((b) => b.title === assignment.book)?.id || "";

    setEditingAssignment(assignment);
    setNewAssignment({
      title: assignment.title,
      description: assignment.description,
      subject: assignment.subject,
      dueDate: assignment.dueDate,
      estimatedTime: assignment.estimatedTime,
      difficulty: assignment.difficulty,
      selectedBook: bookId,
    });
    setSelectedBookProblems(assignment.bookProblems?.map((p) => p.id) || []);
    setCustomProblems(assignment.customProblems || []);
  };

  const handleUpdateAssignment = () => {
    if (editingAssignment) {
      const selectedBookProblemsData = availableBookProblems.filter((p) =>
        selectedBookProblems.includes(p.id),
      );

      const totalEstimatedTime = [
        ...selectedBookProblemsData.map((p) => p.estimatedTime),
        ...customProblems.map((p) => p.estimatedTime),
      ].reduce((sum, time) => sum + time, 0);

      const selectedBookData = availableBooks.find(
        (book) => book.id === newAssignment.selectedBook,
      );

      const updatedAssignment = {
        ...editingAssignment,
        ...newAssignment,
        estimatedTime: totalEstimatedTime || newAssignment.estimatedTime,
        book: selectedBookData?.title,
        bookProblems: selectedBookProblemsData,
        customProblems: [...customProblems],
      };

      setAssignments(
        assignments.map((a) =>
          a.id === editingAssignment.id ? updatedAssignment : a,
        ),
      );
      setEditingAssignment(null);
      resetForm();
    }
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments(assignments.filter((a) => a.id !== id));
  };

  const handleAssignToGroups = (assignment: Assignment) => {
    setAssignGroupsAssignment(assignment);
    setSelectedGroups([...assignment.assignedGroups]);
  };

  const handleUpdateAssignedGroups = () => {
    if (assignGroupsAssignment) {
      setAssignments(
        assignments.map((a) =>
          a.id === assignGroupsAssignment.id
            ? {
                ...a,
                assignedGroups: selectedGroups,
                status: selectedGroups.length > 0 ? "Active" : "Draft",
              }
            : a,
        ),
      );
      setAssignGroupsAssignment(null);
      setSelectedGroups([]);
    }
  };

  const handleViewAssignment = (assignment: Assignment) => {
    setViewingAssignment(assignment);
  };

  const handleToggleStatus = (assignment: Assignment) => {
    const newStatus = assignment.status === "Draft" ? "Active" : "Draft";
    setAssignments(
      assignments.map((a) =>
        a.id === assignment.id ? { ...a, status: newStatus } : a,
      ),
    );
    setViewingAssignment({ ...assignment, status: newStatus });
  };

  const getStatusBadgeVariant = (status: Assignment["status"]) => {
    switch (status) {
      case "Active":
        return "default";
      case "Draft":
        return "secondary";
      case "Completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getDifficultyBadgeVariant = (difficulty: Assignment["difficulty"]) => {
    switch (difficulty) {
      case "Easy":
        return "outline";
      case "Medium":
        return "secondary";
      case "Hard":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600";
      case "Medium":
        return "text-yellow-600";
      case "Hard":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getTotalProblemsCount = () => {
    return selectedBookProblems.length + customProblems.length;
  };

  const getTotalEstimatedTime = () => {
    const bookTime = availableBookProblems
      .filter((p) => selectedBookProblems.includes(p.id))
      .reduce((sum, p) => sum + p.estimatedTime, 0);
    const customTime = customProblems.reduce(
      (sum, p) => sum + p.estimatedTime,
      0,
    );
    return bookTime + customTime;
  };

  const getFilteredBookProblems = () => {
    if (!newAssignment.selectedBook) return [];
    const selectedBookTitle = availableBooks.find(
      (book) => book.id === newAssignment.selectedBook,
    )?.title;
    return availableBookProblems.filter(
      (problem) => problem.bookTitle === selectedBookTitle,
    );
  };

  const getProgressStatusBadgeVariant = (status: StudentProgress["status"]) => {
    switch (status) {
      case "Completed":
        return "default";
      case "In Progress":
        return "secondary";
      case "Not Started":
        return "outline";
      case "Overdue":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getWorkloadColor = (activeAssignments: number) => {
    if (activeAssignments === 0) return "text-green-600";
    if (activeAssignments <= 2) return "text-yellow-600";
    return "text-red-600";
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getGroupedProgress = () => {
    const grouped: { [key: string]: StudentProgress[] } = {};

    studentProgressData.forEach((progress) => {
      const workload = studentWorkloadData.find(
        (w) => w.studentId === progress.studentId,
      );
      const group = workload?.group || "Unknown";

      if (selectedProgressGroup === "all" || group === selectedProgressGroup) {
        if (!grouped[group]) {
          grouped[group] = [];
        }
        grouped[group].push(progress);
      }
    });

    return grouped;
  };

  const getFilteredWorkload = () => {
    return studentWorkloadData.filter(
      (workload) =>
        selectedProgressGroup === "all" ||
        workload.group === selectedProgressGroup,
    );
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Assignments</h2>
        <div className="flex space-x-2">
          <Button
            variant={showProgressView ? "outline" : "default"}
            onClick={() => setShowProgressView(false)}
          >
            Assignments
          </Button>
          <Button
            variant={showProgressView ? "default" : "outline"}
            onClick={() => setShowProgressView(true)}
          >
            Student Progress
          </Button>
          {!showProgressView && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[900px]">
                <DialogHeader>
                  <DialogTitle>Create New Assignment</DialogTitle>
                  <DialogDescription>
                    Create a new assignment by selecting problems from books or
                    adding your own.
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">
                      Assignment Details
                    </TabsTrigger>
                    <TabsTrigger value="problems">Select Problems</TabsTrigger>
                    <TabsTrigger value="custom">Custom Problems</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                          Title
                        </Label>
                        <Input
                          id="title"
                          value={newAssignment.title}
                          onChange={(e) =>
                            setNewAssignment({
                              ...newAssignment,
                              title: e.target.value,
                            })
                          }
                          className="col-span-3"
                          placeholder="Assignment title"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="subject" className="text-right">
                          Subject
                        </Label>
                        <Input
                          id="subject"
                          value={newAssignment.subject}
                          onChange={(e) =>
                            setNewAssignment({
                              ...newAssignment,
                              subject: e.target.value,
                            })
                          }
                          className="col-span-3"
                          placeholder="e.g., Mathematics"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="difficulty" className="text-right">
                          Difficulty
                        </Label>
                        <Select
                          value={newAssignment.difficulty}
                          onChange={(value: Assignment["difficulty"]) =>
                            setNewAssignment({
                              ...newAssignment,
                              difficulty: value,
                            })
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dueDate" className="text-right">
                          Due Date
                        </Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={newAssignment.dueDate}
                          onChange={(e) =>
                            setNewAssignment({
                              ...newAssignment,
                              dueDate: e.target.value,
                            })
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={newAssignment.description}
                          onChange={(e) =>
                            setNewAssignment({
                              ...newAssignment,
                              description: e.target.value,
                            })
                          }
                          className="col-span-3"
                          placeholder="Assignment description..."
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="problems" className="space-y-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="book" className="text-right">
                          Select Book
                        </Label>
                        <Select
                          value={newAssignment.selectedBook}
                          onChange={(value) =>
                            setNewAssignment({
                              ...newAssignment,
                              selectedBook: value,
                            })
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Choose a book" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableBooks.map((book) => (
                              <SelectItem key={book.id} value={book.id}>
                                {book.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {newAssignment.selectedBook && (
                        <div className="space-y-4">
                          <h4 className="font-medium">Available Problems:</h4>
                          <div className="max-h-96 space-y-2 overflow-y-auto">
                            {getFilteredBookProblems().map((problem) => (
                              <div
                                key={problem.id}
                                className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                                  selectedBookProblems.includes(problem.id)
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() =>
                                  handleBookProblemSelection(problem.id)
                                }
                              >
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <h5 className="text-sm font-medium">
                                      {problem.problemNumber} - {problem.topic}
                                    </h5>
                                    <p className="text-xs text-muted-foreground">
                                      {problem.chapter} •{" "}
                                      {problem.estimatedTime} min
                                    </p>
                                    <p className="text-sm">
                                      {problem.problemText}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={getDifficultyColor(
                                      problem.difficulty,
                                    )}
                                  >
                                    {problem.difficulty}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="custom" className="space-y-4">
                    <div className="space-y-4">
                      <h4 className="font-medium">Add Custom Problem:</h4>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="customTopic" className="text-right">
                            Topic
                          </Label>
                          <Input
                            id="customTopic"
                            value={newCustomProblem.topic}
                            onChange={(e) =>
                              setNewCustomProblem({
                                ...newCustomProblem,
                                topic: e.target.value,
                              })
                            }
                            className="col-span-3"
                            placeholder="Problem topic"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="customProblem" className="text-right">
                            Problem
                          </Label>
                          <Textarea
                            id="customProblem"
                            value={newCustomProblem.problemText}
                            onChange={(e) =>
                              setNewCustomProblem({
                                ...newCustomProblem,
                                problemText: e.target.value,
                              })
                            }
                            className="col-span-3"
                            placeholder="Enter the problem statement..."
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="customSolution"
                            className="text-right"
                          >
                            Solution
                          </Label>
                          <Textarea
                            id="customSolution"
                            value={newCustomProblem.solution}
                            onChange={(e) =>
                              setNewCustomProblem({
                                ...newCustomProblem,
                                solution: e.target.value,
                              })
                            }
                            className="col-span-3"
                            placeholder="Enter the solution..."
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="customDifficulty"
                            className="text-right"
                          >
                            Difficulty
                          </Label>
                          <Select
                            value={newCustomProblem.difficulty}
                            onChange={(value: CustomProblem["difficulty"]) =>
                              setNewCustomProblem({
                                ...newCustomProblem,
                                difficulty: value,
                              })
                            }
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Easy">Easy</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="customTime" className="text-right">
                            Est. Time (min)
                          </Label>
                          <Input
                            id="customTime"
                            type="number"
                            value={newCustomProblem.estimatedTime}
                            onChange={(e) =>
                              setNewCustomProblem({
                                ...newCustomProblem,
                                estimatedTime:
                                  Number.parseInt(e.target.value) || 0,
                              })
                            }
                            className="col-span-3"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button onClick={handleAddCustomProblem}>
                            Add Problem
                          </Button>
                        </div>
                      </div>

                      {customProblems.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">
                            Custom Problems Added:
                          </h4>
                          {customProblems.map((problem) => (
                            <div
                              key={problem.id}
                              className="rounded-lg border bg-gray-50 p-3"
                            >
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <h5 className="text-sm font-medium">
                                    {problem.topic}
                                  </h5>
                                  <p className="text-sm">
                                    {problem.problemText}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {problem.estimatedTime} min
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    variant="outline"
                                    className={getDifficultyColor(
                                      problem.difficulty,
                                    )}
                                  >
                                    {problem.difficulty}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveCustomProblem(problem.id)
                                    }
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {getTotalProblemsCount()} problems •{" "}
                    {getTotalEstimatedTime()} min estimated
                  </div>
                  <Button onClick={handleAddAssignment}>
                    Create Assignment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {!showProgressView ? (
        // Assignments List View
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Management</CardTitle>
              <CardDescription>
                Create and manage assignments for your students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assignments.map((assignment) => (
                  <Card key={assignment.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">
                            {assignment.title}
                          </CardTitle>
                          <CardDescription>
                            {assignment.description}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={getStatusBadgeVariant(assignment.status)}
                          >
                            {assignment.status}
                          </Badge>
                          <Badge
                            variant={getDifficultyBadgeVariant(
                              assignment.difficulty,
                            )}
                          >
                            {assignment.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-grow flex-col justify-between space-y-4">
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Subject:</strong> {assignment.subject}
                        </p>
                        <p>
                          <strong>Due Date:</strong> {assignment.dueDate}
                        </p>
                        <p>
                          <strong>Est. Time:</strong> {assignment.estimatedTime}{" "}
                          minutes
                        </p>
                        {assignment.assignedGroups.length > 0 && (
                          <div>
                            <strong>Groups:</strong>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {assignment.assignedGroups.map((group) => (
                                <Badge
                                  key={group}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {group}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAssignment(assignment)}
                          className="flex-1"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAssignment(assignment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignToGroups(assignment)}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {assignments.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <p>
                    No assignments created yet. Click "Create Assignment" to get
                    started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        // Student Progress View
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Progress Overview</CardTitle>
              <CardDescription>
                Monitor student progress across all assignments
              </CardDescription>
              <div className="flex space-x-4">
                <Select
                  value={selectedProgressGroup}
                  onChange={setSelectedProgressGroup}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    <SelectItem value="Advanced Math">Advanced Math</SelectItem>
                    <SelectItem value="Basic Math">Basic Math</SelectItem>
                    <SelectItem value="Geometry Focus">
                      Geometry Focus
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {/* Student Workload Summary */}
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-semibold">
                  Student Workload Summary
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {getFilteredWorkload().map((workload) => {
                    const focusRec = getFocusRecommendations(
                      workload.studentId,
                    );
                    const needsFocus = focusRec?.shouldFocus || false;

                    return (
                      <Card
                        key={workload.studentId}
                        className={`cursor-pointer transition-shadow hover:shadow-lg ${
                          needsFocus ? "border-orange-300 bg-orange-50" : ""
                        }`}
                        onClick={() => handleViewStudent(workload.studentId)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              {workload.studentName}
                            </CardTitle>
                            {needsFocus && (
                              <Badge
                                variant="outline"
                                className="border-orange-300 text-orange-700"
                              >
                                Needs Focus
                              </Badge>
                            )}
                          </div>
                          <CardDescription>{workload.group}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="rounded border p-2 text-center">
                              <div
                                className={`font-bold ${getWorkloadColor(workload.activeAssignments)}`}
                              >
                                {workload.activeAssignments}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Active
                              </div>
                            </div>
                            <div className="rounded border p-2 text-center">
                              <div className="font-bold text-green-600">
                                {workload.completedThisWeek}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Completed
                              </div>
                            </div>
                            <div className="rounded border p-2 text-center">
                              <div className="font-bold text-blue-600">
                                {workload.totalTimeSpent}min
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Time Spent
                              </div>
                            </div>
                            <div className="rounded border p-2 text-center">
                              <div className="font-bold text-purple-600">
                                {workload.averageScore > 0
                                  ? `${workload.averageScore}%`
                                  : "N/A"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Avg Score
                              </div>
                            </div>
                          </div>

                          {needsFocus && focusRec && (
                            <div className="mt-3 rounded border border-orange-200 bg-orange-100 p-2 text-xs">
                              <p className="font-medium text-orange-800">
                                Focus Area:
                              </p>
                              <p className="text-orange-700">
                                {focusRec.primaryWeakness}
                              </p>
                              <p className="mt-1 font-medium text-orange-800">
                                Recommended:
                              </p>
                              <p className="text-orange-700">
                                {focusRec.recommendedFocus}
                              </p>
                              <p className="mt-1 font-medium text-orange-800">
                                Motivation:
                              </p>
                              <p className="text-orange-700">
                                {focusRec.motivationStyle}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Progress by Group */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">
                  Detailed Progress by Group
                </h3>
                {Object.entries(getGroupedProgress()).map(
                  ([group, progress]) => (
                    <Card key={group}>
                      <CardHeader>
                        <CardTitle className="text-base">{group}</CardTitle>
                        <CardDescription>
                          {progress.length} students
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Assignment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>AI Prompts</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Last Activity</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {progress.map((item) => (
                                <TableRow
                                  key={`${item.studentId}-${item.assignmentId}`}
                                  className="cursor-pointer hover:bg-muted/50"
                                  onClick={() =>
                                    handleViewStudent(item.studentId)
                                  }
                                >
                                  <TableCell className="font-medium">
                                    {item.studentName}
                                  </TableCell>
                                  <TableCell>{item.assignmentTitle}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={getProgressStatusBadgeVariant(
                                        item.status,
                                      )}
                                    >
                                      {item.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <div className="h-2 flex-1 rounded-full bg-gray-200">
                                        <div
                                          className="h-2 rounded-full bg-blue-600 transition-all"
                                          style={{ width: `${item.progress}%` }}
                                        />
                                      </div>
                                      <span className="text-sm">
                                        {item.progress}%
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{item.timeSpent} min</TableCell>
                                  <TableCell>
                                    <span
                                      className={
                                        item.aiPromptsUsed > 10
                                          ? "font-medium text-red-600"
                                          : ""
                                      }
                                    >
                                      {item.aiPromptsUsed}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    {item.score !== undefined ? (
                                      <span className="font-medium">
                                        {item.score}/{item.maxScore}
                                      </span>
                                    ) : (
                                      "-"
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {formatLastActivity(item.lastActivity)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assignment Details Dialog */}
      <Dialog
        open={!!viewingAssignment}
        onOpenChange={() => setViewingAssignment(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{viewingAssignment?.title}</DialogTitle>
            <DialogDescription>
              Assignment details and management
            </DialogDescription>
          </DialogHeader>
          {viewingAssignment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Subject:</strong> {viewingAssignment.subject}
                </div>
                <div>
                  <strong>Due Date:</strong> {viewingAssignment.dueDate}
                </div>
                <div>
                  <strong>Difficulty:</strong> {viewingAssignment.difficulty}
                </div>
                <div>
                  <strong>Est. Time:</strong> {viewingAssignment.estimatedTime}{" "}
                  min
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  <Badge
                    variant={getStatusBadgeVariant(viewingAssignment.status)}
                  >
                    {viewingAssignment.status}
                  </Badge>
                </div>
                <div>
                  <strong>Created:</strong> {viewingAssignment.createdDate}
                </div>
              </div>
              <div>
                <strong>Description:</strong>
                <p className="mt-1 text-sm text-muted-foreground">
                  {viewingAssignment.description}
                </p>
              </div>
              {viewingAssignment.assignedGroups.length > 0 && (
                <div>
                  <strong>Assigned Groups:</strong>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {viewingAssignment.assignedGroups.map((group) => (
                      <Badge key={group} variant="outline">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewingAssignment(null)}
            >
              Close
            </Button>
            <Button
              onClick={() =>
                viewingAssignment && handleToggleStatus(viewingAssignment)
              }
            >
              {viewingAssignment?.status === "Draft" ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Activate
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Deactivate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog
        open={!!editingAssignment}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditingAssignment(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>
              Update assignment details and manage problems.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Assignment Details</TabsTrigger>
              <TabsTrigger value="problems">Select Problems</TabsTrigger>
              <TabsTrigger value="custom">Custom Problems</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title-edit" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title-edit"
                    value={newAssignment.title}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        title: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Assignment title"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject-edit" className="text-right">
                    Subject
                  </Label>
                  <Input
                    id="subject-edit"
                    value={newAssignment.subject}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        subject: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="e.g., Mathematics"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="difficulty-edit" className="text-right">
                    Difficulty
                  </Label>
                  <Select
                    value={newAssignment.difficulty}
                    onChange={(value: Assignment["difficulty"]) =>
                      setNewAssignment({ ...newAssignment, difficulty: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dueDate-edit" className="text-right">
                    Due Date
                  </Label>
                  <Input
                    id="dueDate-edit"
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        dueDate: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description-edit" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description-edit"
                    value={newAssignment.description}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        description: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Assignment description..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="problems" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="book-edit" className="text-right">
                    Select Book
                  </Label>
                  <Select
                    value={newAssignment.selectedBook}
                    onChange={(value) =>
                      setNewAssignment({
                        ...newAssignment,
                        selectedBook: value,
                      })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Choose a book" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBooks.map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newAssignment.selectedBook && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Available Problems:</h4>
                    <div className="max-h-96 space-y-2 overflow-y-auto">
                      {getFilteredBookProblems().map((problem) => (
                        <div
                          key={problem.id}
                          className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                            selectedBookProblems.includes(problem.id)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleBookProblemSelection(problem.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h5 className="text-sm font-medium">
                                {problem.problemNumber} - {problem.topic}
                              </h5>
                              <p className="text-xs text-muted-foreground">
                                {problem.chapter} • {problem.estimatedTime} min
                              </p>
                              <p className="text-sm">{problem.problemText}</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={getDifficultyColor(problem.difficulty)}
                            >
                              {problem.difficulty}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 pt-4">
              <div className="space-y-4">
                <h4 className="font-medium">Add Custom Problem:</h4>
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="customTopic-edit" className="text-right">
                      Topic
                    </Label>
                    <Input
                      id="customTopic-edit"
                      value={newCustomProblem.topic}
                      onChange={(e) =>
                        setNewCustomProblem({
                          ...newCustomProblem,
                          topic: e.target.value,
                        })
                      }
                      className="col-span-3"
                      placeholder="Problem topic"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="customProblem-edit" className="text-right">
                      Problem
                    </Label>
                    <Textarea
                      id="customProblem-edit"
                      value={newCustomProblem.problemText}
                      onChange={(e) =>
                        setNewCustomProblem({
                          ...newCustomProblem,
                          problemText: e.target.value,
                        })
                      }
                      className="col-span-3"
                      placeholder="Enter the problem statement..."
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="customSolution-edit" className="text-right">
                      Solution
                    </Label>
                    <Textarea
                      id="customSolution-edit"
                      value={newCustomProblem.solution}
                      onChange={(e) =>
                        setNewCustomProblem({
                          ...newCustomProblem,
                          solution: e.target.value,
                        })
                      }
                      className="col-span-3"
                      placeholder="Enter the solution..."
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="customDifficulty-edit"
                      className="text-right"
                    >
                      Difficulty
                    </Label>
                    <Select
                      value={newCustomProblem.difficulty}
                      onChange={(value: CustomProblem["difficulty"]) =>
                        setNewCustomProblem({
                          ...newCustomProblem,
                          difficulty: value,
                        })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="customTime-edit" className="text-right">
                      Est. Time (min)
                    </Label>
                    <Input
                      id="customTime-edit"
                      type="number"
                      value={newCustomProblem.estimatedTime}
                      onChange={(e) =>
                        setNewCustomProblem({
                          ...newCustomProblem,
                          estimatedTime: Number.parseInt(e.target.value) || 0,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleAddCustomProblem}>
                      Add Problem
                    </Button>
                  </div>
                </div>

                {customProblems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Custom Problems Added:</h4>
                    {customProblems.map((problem) => (
                      <div
                        key={problem.id}
                        className="rounded-lg border bg-gray-50 p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h5 className="text-sm font-medium">
                              {problem.topic}
                            </h5>
                            <p className="text-sm">{problem.problemText}</p>
                            <p className="text-xs text-muted-foreground">
                              {problem.estimatedTime} min
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className={getDifficultyColor(problem.difficulty)}
                            >
                              {problem.difficulty}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleRemoveCustomProblem(problem.id)
                              }
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              {getTotalProblemsCount()} problems • {getTotalEstimatedTime()} min
              estimated
            </div>
            <Button onClick={handleUpdateAssignment}>Update Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Groups Dialog */}
      <Dialog
        open={!!assignGroupsAssignment}
        onOpenChange={() => setAssignGroupsAssignment(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign to Groups</DialogTitle>
            <DialogDescription>
              Select which groups should receive this assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {availableGroups.map((group) => (
              <div key={group} className="flex items-center space-x-2">
                <Checkbox
                  id={group}
                  checked={selectedGroups.includes(group)}
                  onChange={(checked) => {
                    if (checked) {
                      setSelectedGroups([...selectedGroups, group]);
                    } else {
                      setSelectedGroups(
                        selectedGroups.filter((g) => g !== group),
                      );
                    }
                  }}
                />
                <Label htmlFor={group} className="cursor-pointer">
                  {group}
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <div className="flex w-full justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedGroups.length} groups selected
              </p>
              <Button onClick={handleUpdateAssignedGroups}>
                Update Assignment
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Details Dialog */}
      <Dialog
        open={!!viewingStudent}
        onOpenChange={() => setViewingStudent(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>
                {viewingStudent?.firstName} {viewingStudent?.lastName}
              </span>
            </DialogTitle>
            <DialogDescription>
              Student details, current workload, and assignment progress
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Student Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Student Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Email:</span>{" "}
                    {viewingStudent?.email}
                  </div>
                  <div>
                    <span className="font-medium">Grade:</span>{" "}
                    {viewingStudent?.grade}
                  </div>
                  <div>
                    <span className="font-medium">Group:</span>{" "}
                    {viewingStudent?.group}
                  </div>
                  <div>
                    <span className="font-medium">Performance:</span>
                    <Badge
                      variant={getPerformanceBadgeVariant(
                        viewingStudent?.performance || "Average",
                      )}
                      className="ml-2"
                    >
                      {viewingStudent?.performance}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Join Date:</span>{" "}
                    {viewingStudent?.joinDate}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workload Summary */}
            {viewingStudent &&
              (() => {
                const workload = getStudentWorkload(viewingStudent.id);
                return workload ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Current Workload
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        <div className="rounded-lg border p-3 text-center">
                          <div
                            className={`text-2xl font-bold ${getWorkloadColor(workload.activeAssignments)}`}
                          >
                            {workload.activeAssignments}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Active Assignments
                          </div>
                        </div>
                        <div className="rounded-lg border p-3 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {workload.completedThisWeek}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Completed This Week
                          </div>
                        </div>
                        <div className="rounded-lg border p-3 text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {workload.totalTimeSpent}min
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Time Spent
                          </div>
                        </div>
                        <div className="rounded-lg border p-3 text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {workload.averageScore > 0
                              ? `${workload.averageScore}%`
                              : "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Average Score
                          </div>
                        </div>
                        <div className="rounded-lg border p-3 text-center">
                          <div
                            className={`text-2xl font-bold ${
                              workload.upcomingDeadlines > 2
                                ? "text-red-600"
                                : "text-orange-600"
                            }`}
                          >
                            {workload.upcomingDeadlines}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Upcoming Deadlines
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
              })()}

            {/* Assignment Progress */}
            {viewingStudent &&
              (() => {
                const progress = getStudentProgress(viewingStudent.id);
                return (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Assignment Progress ({progress.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {progress.map((assignment) => (
                          <Collapsible
                            key={assignment.assignmentId}
                            className="group rounded-lg border"
                          >
                            <CollapsibleTrigger className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50">
                              <div className="text-left">
                                <h4 className="font-medium">
                                  {assignment.assignmentTitle}
                                </h4>
                                <div className="mt-1 flex items-center space-x-2">
                                  <Badge
                                    variant={getProgressStatusBadgeVariant(
                                      assignment.status,
                                    )}
                                  >
                                    {assignment.status}
                                  </Badge>
                                  {assignment.score !== undefined && (
                                    <Badge variant="outline">
                                      Score: {assignment.score}/
                                      {assignment.maxScore}
                                    </Badge>
                                  )}
                                  <Badge variant="outline">
                                    Progress: {assignment.progress}%
                                  </Badge>
                                </div>
                              </div>
                              <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]:rotate-180" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="p-4 pt-0">
                              <div className="mt-4 space-y-3">
                                {assignment.problemAttempts &&
                                assignment.problemAttempts.length > 0 ? (
                                  assignment.problemAttempts.map((attempt) => (
                                    <Collapsible
                                      key={attempt.problemId}
                                      className="group/inner rounded-lg border"
                                    >
                                      <CollapsibleTrigger className="flex w-full items-center justify-between bg-muted/50 p-3 text-left transition-colors hover:bg-muted">
                                        <div className="flex items-center space-x-3">
                                          {getProblemStatusIcon(attempt.status)}
                                          <p className="flex-1 text-sm font-medium">
                                            {attempt.problemText}
                                          </p>
                                        </div>
                                        <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/inner:rotate-180" />
                                      </CollapsibleTrigger>
                                      <CollapsibleContent className="p-4">
                                        <Tabs defaultValue="student">
                                          <TabsList className="grid w-full grid-cols-3">
                                            <TabsTrigger value="student">
                                              Student's Solution
                                            </TabsTrigger>
                                            <TabsTrigger value="expected">
                                              Expected Solution
                                            </TabsTrigger>
                                            <TabsTrigger value="ai">
                                              AI Prompts
                                            </TabsTrigger>
                                          </TabsList>
                                          <TabsContent
                                            value="student"
                                            className="mt-4"
                                          >
                                            <Card>
                                              <CardContent className="p-4">
                                                <pre className="whitespace-pre-wrap font-sans text-sm">
                                                  {attempt.studentSolution}
                                                </pre>
                                              </CardContent>
                                            </Card>
                                          </TabsContent>
                                          <TabsContent
                                            value="expected"
                                            className="mt-4"
                                          >
                                            <Card>
                                              <CardContent className="p-4">
                                                <pre className="whitespace-pre-wrap font-sans text-sm">
                                                  {attempt.expectedSolution}
                                                </pre>
                                              </CardContent>
                                            </Card>
                                          </TabsContent>
                                          <TabsContent
                                            value="ai"
                                            className="mt-4"
                                          >
                                            <Card>
                                              <CardContent className="space-y-2 p-4">
                                                {attempt.aiPrompts.length >
                                                0 ? (
                                                  attempt.aiPrompts.map(
                                                    (prompt, idx) => (
                                                      <div
                                                        key={idx}
                                                        className="rounded bg-gray-100 p-2 text-sm"
                                                      >
                                                        {prompt}
                                                      </div>
                                                    ),
                                                  )
                                                ) : (
                                                  <p className="text-sm text-muted-foreground">
                                                    No AI prompts were used for
                                                    this problem.
                                                  </p>
                                                )}
                                              </CardContent>
                                            </Card>
                                          </TabsContent>
                                        </Tabs>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  ))
                                ) : (
                                  <div className="py-4 text-center text-sm text-muted-foreground">
                                    No problem details available for this
                                    assignment.
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}

                        {progress.length === 0 && (
                          <div className="py-8 text-center text-muted-foreground">
                            <p>No assignments found for this student.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

            {/* AI Evaluation */}
            {viewingStudent &&
              (() => {
                const evaluation = getAIEvaluation(viewingStudent.id);
                return evaluation ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-base">
                        AI Evaluation & Insights
                        <Badge variant="outline" className="text-xs">
                          Updated: {evaluation.lastUpdated}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Quick Overview */}
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                          <h4 className="mb-2 font-semibold text-blue-800">
                            Quick Overview
                          </h4>
                          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                            <div>
                              <span className="font-medium">
                                Overall Score:
                              </span>
                              <span
                                className={`ml-2 font-bold ${getConceptScoreColor(
                                  evaluation.quickOverview.overallScore,
                                )}`}
                              >
                                {evaluation.quickOverview.overallScore}/100
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">
                                Primary Strength:
                              </span>
                              <span className="ml-2 text-green-600">
                                {evaluation.quickOverview.primaryStrength}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">
                                Primary Weakness:
                              </span>
                              <span className="ml-2 text-red-600">
                                {evaluation.quickOverview.primaryWeakness}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">
                                Motivation Style:
                              </span>
                              <span className="ml-2 text-purple-600">
                                {evaluation.quickOverview.motivationStyle}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className="font-medium">
                              Recommended Focus:
                            </span>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {evaluation.quickOverview.recommendedFocus}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          {/* Strengths */}
                          <div>
                            <h4 className="mb-3 font-semibold text-green-700">
                              Strengths by Concept
                            </h4>
                            <div className="space-y-3">
                              {Object.entries(evaluation.strengths).map(
                                ([concept, data]) => (
                                  <div
                                    key={concept}
                                    className="rounded-lg border border-green-200 bg-green-50 p-3"
                                  >
                                    <div className="mb-2 flex items-center justify-between">
                                      <h5 className="text-sm font-medium">
                                        {concept}
                                      </h5>
                                      <Badge
                                        variant="outline"
                                        className="text-green-600"
                                      >
                                        {data.score}/100
                                      </Badge>
                                    </div>
                                    <ul className="space-y-1 text-xs text-muted-foreground">
                                      {data.evidence.map((evidence, idx) => (
                                        <li key={idx}>• {evidence}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>

                          {/* Weaknesses */}
                          <div>
                            <h4 className="mb-3 font-semibold text-red-700">
                              Weaknesses by Concept
                            </h4>
                            <div className="space-y-3">
                              {Object.entries(evaluation.weaknesses).map(
                                ([concept, data]) => (
                                  <div
                                    key={concept}
                                    className="rounded-lg border border-red-200 bg-red-50 p-3"
                                  >
                                    <div className="mb-2 flex items-center justify-between">
                                      <h5 className="text-sm font-medium">
                                        {concept}
                                      </h5>
                                      <Badge
                                        variant="outline"
                                        className="text-red-600"
                                      >
                                        {data.score}/100
                                      </Badge>
                                    </div>
                                    <ul className="space-y-1 text-xs text-muted-foreground">
                                      {data.evidence.map((evidence, idx) => (
                                        <li key={idx}>• {evidence}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Character Traits */}
                        <div>
                          <h4 className="mb-3 font-semibold text-purple-700">
                            Character Traits
                          </h4>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            {evaluation.characterTraits.map((trait, idx) => (
                              <div key={idx} className="rounded-lg border p-3">
                                <div className="mb-2 flex items-center justify-between">
                                  <h5 className="text-sm font-medium">
                                    {trait.trait}
                                  </h5>
                                  <Badge
                                    variant="outline"
                                    className={getTraitLevelColor(trait.level)}
                                  >
                                    {trait.level}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {trait.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Motivation Strategies */}
                        <div>
                          <h4 className="mb-3 font-semibold text-blue-700">
                            Motivation Strategies
                          </h4>
                          <div className="space-y-3">
                            {evaluation.motivationStrategies.map(
                              (strategy, idx) => (
                                <div
                                  key={idx}
                                  className="rounded-lg border border-blue-200 bg-blue-50 p-3"
                                >
                                  <div className="mb-2 flex items-center justify-between">
                                    <h5 className="text-sm font-medium">
                                      {strategy.strategy}
                                    </h5>
                                    <Badge
                                      variant="outline"
                                      className="text-blue-600"
                                    >
                                      {strategy.effectiveness}% effective
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    <span className="font-medium">
                                      Examples:
                                    </span>
                                    <ul className="mt-1 space-y-1">
                                      {strategy.examples.map(
                                        (example, exIdx) => (
                                          <li key={exIdx}>• {example}</li>
                                        ),
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
              })()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingStudent(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
