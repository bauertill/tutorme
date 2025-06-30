"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, TrendingDown, Users, Award, Clock, User, FileText } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronRight } from "lucide-react"

interface StudentResult {
  id: string
  studentName: string
  group: string
  assignment: string
  score: number
  maxScore: number
  timeSpent: number
  submissionDate: string
  status: "Completed" | "In Progress" | "Overdue"
}

interface GroupPerformance {
  groupName: string
  averageScore: number
  completionRate: number
  totalStudents: number
  completedAssignments: number
  trend: "up" | "down" | "stable"
}

interface StudentSolution {
  problemId: string
  problemText: string
  studentSolution: string
  isCorrect: boolean
  timeSpent: number
  aiPrompts: {
    prompt: string
    response: string
    timestamp: string
    helpful: boolean
  }[]
  attempts: {
    attempt: number
    solution: string
    timestamp: string
    feedback: string
  }[]
}

interface DetailedStudentProgress {
  studentId: string
  studentName: string
  group: string
  assignments: {
    assignmentId: string
    assignmentTitle: string
    status: "Completed" | "In Progress" | "Overdue" | "Not Started"
    score?: number
    maxScore?: number
    timeSpent: number
    progress: number
    lastActivity: string
    dueDate?: string
    submissionDate?: string
    solutions: StudentSolution[]
  }[]
}

interface AssignmentDetails {
  id: string
  title: string
  description: string
  subject: string
  dueDate: string
  estimatedTime: number
  difficulty: "Easy" | "Medium" | "Hard"
  status: "Draft" | "Active" | "Completed"
  assignedGroups: string[]
  createdDate: string
  totalProblems: number
  averageScore: number
  completionRate: number
  averageTimeSpent: number
  studentResults: {
    studentName: string
    score: number
    maxScore: number
    timeSpent: number
    status: "Completed" | "In Progress" | "Overdue"
    submissionDate?: string
    solutions: StudentSolution[]
  }[]
}

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
]

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
]

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
            studentSolution: "x = 4\n\nMy work:\n2x + 5 = 13\n2x = 13 - 5\n2x = 8\nx = 8 ÷ 2\nx = 4",
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
            studentSolution: "x = 4\n\nMy work:\n2x + 5 = 13\nI need to get x alone\n2x = 13 - 5\n2x = 8\nx = 4",
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
                feedback: "Not quite right. Check your arithmetic when dividing.",
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
]

const detailedStudentData: DetailedStudentProgress[] = [
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
            studentSolution: "x = 4\n\nMy work:\n2x + 5 = 13\n2x = 13 - 5\n2x = 8\nx = 8 ÷ 2\nx = 4",
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
            studentSolution: "y = 7\n\nSolution:\n3y - 7 = 14\n3y = 14 + 7\n3y = 21\ny = 21 ÷ 3\ny = 7",
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
            problemText: "Calculate the mean of the following data set: 12, 15, 18, 22, 25, 28",
            studentSolution: "Mean = (12 + 15 + 18 + 22 + 25 + 28) ÷ 6\nMean = 120 ÷ 6\nMean = 20",
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
            problemText: "Prove that the sum of angles in a triangle equals 180°",
            studentSolution:
              "I'm working on this proof. So far I know that:\n- Triangle ABC has angles A, B, and C\n- I need to show A + B + C = 180°\n\nI'm thinking about using parallel lines...",
            isCorrect: false,
            timeSpent: 25,
            aiPrompts: [
              {
                prompt: "What's the best way to approach triangle angle proofs?",
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
                feedback: "Good start! Continue developing your proof using the parallel line method.",
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
            studentSolution: "x = 4\n\nMy work:\n2x + 5 = 13\nI need to get x alone\n2x = 13 - 5\n2x = 8\nx = 4",
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
                feedback: "Not quite right. Check your arithmetic when dividing.",
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
            problemText: "Prove that the sum of angles in a triangle equals 180°",
            studentSolution:
              "I'm just starting this problem. I know triangles have three angles but I'm not sure how to prove they add up to 180°.",
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
                feedback: "Incorrect. You added 5 instead of subtracting it. Try again.",
              },
            ],
          },
        ],
      },
    ],
  },
]

const groupBreakdown = (groupName: string) => {
  const groupResults = studentResults.filter((r) => r.group === groupName)
  const studentData: {
    [key: string]: {
      name: string
      scores: number[]
      maxScores: number[]
      timeSpent: number
      completed: number
      total: number
      assignments: StudentResult[]
    }
  } = {}

  groupResults.forEach((result) => {
    if (!studentData[result.studentName]) {
      studentData[result.studentName] = {
        name: result.studentName,
        scores: [],
        maxScores: [],
        timeSpent: 0,
        completed: 0,
        total: 0,
        assignments: [],
      }
    }
    const student = studentData[result.studentName]
    student.total += 1
    student.timeSpent += result.timeSpent
    student.assignments.push(result)
    if (result.status === "Completed") {
      student.completed += 1
      student.scores.push(result.score)
      student.maxScores.push(result.maxScore)
    }
  })

  return Object.values(studentData).map((student) => {
    const totalScore = student.scores.reduce((acc, score) => acc + score, 0)
    const totalMaxScore = student.maxScores.reduce((acc, max) => acc + max, 0)
    const averageScore = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0
    return {
      ...student,
      averageScore,
    }
  })
}

export default function Results() {
  const [selectedGroup, setSelectedGroup] = useState<string>("all")
  const [selectedAssignment, setSelectedAssignment] = useState<string>("all")
  const [viewingStudentDetails, setViewingStudentDetails] = useState<string | null>(null)
  const [viewingGroupDetails, setViewingGroupDetails] = useState<string | null>(null)
  const [viewingAssignmentDetails, setViewingAssignmentDetails] = useState<string | null>(null)

  const filteredResults = studentResults.filter((result) => {
    const groupMatch = selectedGroup === "all" || result.group === selectedGroup
    const assignmentMatch = selectedAssignment === "all" || result.assignment === selectedAssignment
    return groupMatch && assignmentMatch
  })

  const getStatusBadgeVariant = (status: StudentResult["status"]) => {
    switch (status) {
      case "Completed":
        return "default"
      case "In Progress":
        return "secondary"
      case "Overdue":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getTrendIcon = (trend: GroupPerformance["trend"]) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />
    }
  }

  const getDetailedStudentData = (studentName: string) => {
    return detailedStudentData.find((student) => student.studentName === studentName)
  }

  const getAssignmentDetails = (assignmentTitle: string) => {
    return assignmentDetailsData.find((assignment) => assignment.title === assignmentTitle)
  }

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getDifficultyBadgeVariant = (difficulty: AssignmentDetails["difficulty"]) => {
    switch (difficulty) {
      case "Easy":
        return "outline"
      case "Medium":
        return "secondary"
      case "Hard":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Results & Analytics</h2>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">83.2%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">63 min</div>
            <p className="text-xs text-muted-foreground">-3 min from target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Students above 90%</p>
          </CardContent>
        </Card>
      </div>

      {/* Group Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Group Performance Overview</CardTitle>
          <CardDescription>
            Performance metrics by student group. Click a group for a detailed breakdown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {groupPerformance.map((group) => (
              <div
                key={group.groupName}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setViewingGroupDetails(group.groupName)}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold">{group.groupName}</h4>
                    {getTrendIcon(group.trend)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {group.totalStudents} students • {group.completedAssignments} assignments completed
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-2xl font-bold">{group.averageScore.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">{group.completionRate}% completion rate</div>
                  <Progress value={group.completionRate} className="w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Results</CardTitle>
          <CardDescription>Detailed view of student performance on assignments</CardDescription>
          <div className="flex space-x-4">
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                <SelectItem value="Advanced Math">Advanced Math</SelectItem>
                <SelectItem value="Basic Math">Basic Math</SelectItem>
                <SelectItem value="Geometry Focus">Geometry Focus</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignments</SelectItem>
                <SelectItem value="Linear Equations Practice">Linear Equations Practice</SelectItem>
                <SelectItem value="Geometry Proofs">Geometry Proofs</SelectItem>
                <SelectItem value="Statistics Basics">Statistics Basics</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Time Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow
                    key={result.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setViewingStudentDetails(result.studentName)}
                  >
                    <TableCell className="font-medium">{result.studentName}</TableCell>
                    <TableCell>{result.group}</TableCell>
                    <TableCell>{result.assignment}</TableCell>
                    <TableCell>
                      <span className={getScoreColor(result.score, result.maxScore)}>
                        {result.score}/{result.maxScore}
                        {result.status === "Completed" && (
                          <span className="ml-1 text-sm text-muted-foreground">
                            ({Math.round((result.score / result.maxScore) * 100)}%)
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>{result.timeSpent > 0 ? `${result.timeSpent} min` : "-"}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(result.status)}>{result.status}</Badge>
                    </TableCell>
                    <TableCell>{result.submissionDate || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No results found for the selected filters.</div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Students with highest average scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {studentResults
                .filter((r) => r.status === "Completed")
                .sort((a, b) => b.score / b.maxScore - a.score / a.maxScore)
                .slice(0, 5)
                .map((result, index) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-2 -m-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setViewingStudentDetails(result.studentName)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{result.studentName}</p>
                        <p className="text-sm text-muted-foreground">{result.group}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {Math.round((result.score / result.maxScore) * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
            <CardDescription>Students who may need additional support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {studentResults
                .filter((r) => r.status === "Overdue" || (r.status === "Completed" && r.score / r.maxScore < 0.7))
                .slice(0, 5)
                .map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-2 -m-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setViewingStudentDetails(result.studentName)}
                  >
                    <div>
                      <p className="font-medium">{result.studentName}</p>
                      <p className="text-sm text-muted-foreground">{result.group}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusBadgeVariant(result.status)}>{result.status}</Badge>
                      {result.status === "Completed" && (
                        <p className="text-sm text-red-600 mt-1">
                          {Math.round((result.score / result.maxScore) * 100)}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Student Details Dialog */}
      <Dialog open={!!viewingStudentDetails} onOpenChange={() => setViewingStudentDetails(null)}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{viewingStudentDetails} - Detailed Progress</span>
            </DialogTitle>
            <DialogDescription>Complete assignment progress with solutions and AI assistance history</DialogDescription>
          </DialogHeader>

          {viewingStudentDetails &&
            (() => {
              const studentData = getDetailedStudentData(viewingStudentDetails)
              if (!studentData) return <div>No data found</div>

              return (
                <div className="space-y-6">
                  {/* Student Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Student Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Name:</span> {studentData.studentName}
                        </div>
                        <div>
                          <span className="font-medium">Group:</span> {studentData.group}
                        </div>
                        <div>
                          <span className="font-medium">Total Assignments:</span> {studentData.assignments.length}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Assignments */}
                  {studentData.assignments.map((assignment) => (
                    <Card key={assignment.assignmentId}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{assignment.assignmentTitle}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getStatusBadgeVariant(assignment.status as StudentResult["status"])}>
                              {assignment.status}
                            </Badge>
                            {assignment.score !== undefined && assignment.maxScore !== undefined && (
                              <Badge variant="outline">
                                {assignment.score}/{assignment.maxScore} (
                                {Math.round((assignment.score / assignment.maxScore) * 100)}%)
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>Time Spent: {assignment.timeSpent} minutes</div>
                          <div>Progress: {assignment.progress}%</div>
                          <div>Due: {assignment.dueDate ? formatDate(assignment.dueDate) : "No due date"}</div>
                          <div>
                            {assignment.submissionDate
                              ? `Submitted: ${formatDate(assignment.submissionDate)}`
                              : "Not submitted"}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {assignment.solutions.map((solution, idx) => (
                            <Collapsible key={solution.problemId}>
                              <div className="border rounded-lg">
                                <CollapsibleTrigger asChild>
                                  <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
                                    <div className="flex items-center space-x-3">
                                      <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                                      <div>
                                        <h4 className="font-medium text-sm">Problem {idx + 1}</h4>
                                        <p className="text-xs text-muted-foreground truncate max-w-96">
                                          {solution.problemText}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Badge
                                        variant={solution.isCorrect ? "default" : "destructive"}
                                        className="text-xs"
                                      >
                                        {solution.isCorrect ? "Correct" : "Needs Work"}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">{solution.timeSpent} min</span>
                                      {solution.aiPrompts.length > 0 && (
                                        <Badge variant="outline" className="text-xs">
                                          {solution.aiPrompts.length} AI prompts
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="px-4 pb-4 space-y-4 border-t bg-gray-50/50">
                                    {/* Problem */}
                                    <div>
                                      <h5 className="font-medium text-sm mb-2 text-blue-700">Problem:</h5>
                                      <p className="text-sm bg-white p-3 rounded border-l-4 border-blue-500">
                                        {solution.problemText}
                                      </p>
                                    </div>

                                    {/* Student Solution */}
                                    <div>
                                      <h5 className="font-medium text-sm mb-2 text-gray-700">Student Solution:</h5>
                                      <div
                                        className={`text-sm p-3 rounded border-l-4 whitespace-pre-line ${
                                          solution.isCorrect
                                            ? "bg-green-50 border-green-500"
                                            : "bg-red-50 border-red-500"
                                        }`}
                                      >
                                        {solution.studentSolution}
                                      </div>
                                    </div>

                                    {/* AI Prompts */}
                                    {solution.aiPrompts.length > 0 && (
                                      <div>
                                        <h5 className="font-medium text-sm mb-2 text-purple-700">
                                          AI Assistance ({solution.aiPrompts.length} prompts):
                                        </h5>
                                        <div className="space-y-3">
                                          {solution.aiPrompts.map((prompt, promptIdx) => (
                                            <div
                                              key={promptIdx}
                                              className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                                            >
                                              <div className="flex items-start justify-between mb-2">
                                                <span className="text-xs font-medium text-blue-700">
                                                  Student Question:
                                                </span>
                                                <div className="flex items-center space-x-2">
                                                  <Badge
                                                    variant={prompt.helpful ? "default" : "secondary"}
                                                    className="text-xs"
                                                  >
                                                    {prompt.helpful ? "Helpful" : "Not Helpful"}
                                                  </Badge>
                                                  <span className="text-xs text-muted-foreground">
                                                    {formatLastActivity(prompt.timestamp)}
                                                  </span>
                                                </div>
                                              </div>
                                              <p className="text-sm mb-3 italic">"{prompt.prompt}"</p>
                                              <div className="text-xs font-medium text-blue-700 mb-1">AI Response:</div>
                                              <p className="text-sm bg-white p-2 rounded border">{prompt.response}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Attempts */}
                                    <div>
                                      <h5 className="font-medium text-sm mb-2 text-orange-700">
                                        Solution Attempts ({solution.attempts.length}):
                                      </h5>
                                      <div className="space-y-2">
                                        {solution.attempts.map((attempt, attemptIdx) => (
                                          <div key={attemptIdx} className="bg-white border rounded p-3">
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="text-xs font-medium">Attempt {attempt.attempt}</span>
                                              <span className="text-xs text-muted-foreground">
                                                {formatLastActivity(attempt.timestamp)}
                                              </span>
                                            </div>
                                            <p className="text-sm mb-2 font-mono">{attempt.solution}</p>
                                            <p className="text-sm text-muted-foreground italic">
                                              Feedback: {attempt.feedback}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            })()}
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setViewingStudentDetails(null)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Group Details Dialog */}
      <Dialog open={!!viewingGroupDetails} onOpenChange={() => setViewingGroupDetails(null)}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>{viewingGroupDetails} - Student Breakdown</span>
            </DialogTitle>
            <DialogDescription>
              Detailed performance for each student in the {viewingGroupDetails} group.
            </DialogDescription>
          </DialogHeader>

          {viewingGroupDetails && (
            <div className="rounded-md border mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Avg. Score</TableHead>
                    <TableHead className="text-right">Completion</TableHead>
                    <TableHead className="text-right">Time Spent</TableHead>
                  </TableRow>
                </TableHeader>
                {groupBreakdown(viewingGroupDetails)
                  .sort((a, b) => b.averageScore - a.averageScore)
                  .map((st) => (
                    <Collapsible asChild key={st.name}>
                      <tbody>
                        <CollapsibleTrigger asChild>
                          <TableRow className="cursor-pointer hover:bg-muted/50">
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
                                <span>{st.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className={`text-right font-semibold ${getScoreColor(st.averageScore, 100)}`}>
                              {st.averageScore ? `${st.averageScore.toFixed(1)}%` : "N/A"}
                            </TableCell>
                            <TableCell className="text-right">
                              {st.completed}/{st.total}
                              <Progress value={(st.completed / st.total) * 100} className="w-20 inline ml-2" />
                            </TableCell>
                            <TableCell className="text-right">{st.timeSpent} min</TableCell>
                          </TableRow>
                        </CollapsibleTrigger>
                        <CollapsibleContent asChild>
                          <TableRow>
                            <TableCell colSpan={4} className="bg-muted/50 p-2">
                              <div className="p-4 rounded-md border bg-background">
                                <h4 className="font-semibold text-base mb-4">Assignment Breakdown for {st.name}</h4>
                                <div className="grid gap-4">
                                  {st.assignments.map((assignment) => (
                                    <div
                                      key={assignment.id}
                                      className="border rounded-lg p-4 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                                      onClick={() => setViewingAssignmentDetails(assignment.assignment)}
                                    >
                                      <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-semibold text-sm flex items-center space-x-2">
                                          <FileText className="h-4 w-4" />
                                          <span>{assignment.assignment}</span>
                                        </h5>
                                        <div className="flex items-center space-x-2">
                                          <Badge variant={getStatusBadgeVariant(assignment.status)}>
                                            {assignment.status}
                                          </Badge>
                                          {assignment.status === "Completed" && (
                                            <Badge variant="outline">
                                              {Math.round((assignment.score / assignment.maxScore) * 100)}%
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                                        <div>
                                          <span className="font-medium">Score:</span>{" "}
                                          <span className={getScoreColor(assignment.score, assignment.maxScore)}>
                                            {assignment.score}/{assignment.maxScore}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="font-medium">Time:</span> {assignment.timeSpent} min
                                        </div>
                                        <div>
                                          <span className="font-medium">Submitted:</span>{" "}
                                          {assignment.submissionDate || "Not submitted"}
                                        </div>
                                        <div>
                                          <span className="font-medium">Status:</span> {assignment.status}
                                        </div>
                                      </div>
                                      {assignment.status === "Overdue" && (
                                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                          <strong>Attention needed:</strong> This assignment is overdue and requires
                                          follow-up.
                                        </div>
                                      )}
                                      {assignment.status === "In Progress" && (
                                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                                          <strong>In progress:</strong> Student is currently working on this assignment.
                                        </div>
                                      )}
                                      <div className="mt-2 text-xs text-blue-600 hover:text-blue-800">
                                        Click to view assignment details →
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </tbody>
                    </Collapsible>
                  ))}
              </Table>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingGroupDetails(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Details Dialog */}
      <Dialog open={!!viewingAssignmentDetails} onOpenChange={() => setViewingAssignmentDetails(null)}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>{viewingAssignmentDetails} - Assignment Details</span>
            </DialogTitle>
            <DialogDescription>Complete assignment overview with student performance data</DialogDescription>
          </DialogHeader>

          {viewingAssignmentDetails &&
            (() => {
              const assignmentData = getAssignmentDetails(viewingAssignmentDetails)
              if (!assignmentData) return <div>No assignment data found</div>

              return (
                <div className="space-y-6">
                  {/* Assignment Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Assignment Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Subject:</span> {assignmentData.subject}
                        </div>
                        <div>
                          <span className="font-medium">Due Date:</span> {formatDate(assignmentData.dueDate)}
                        </div>
                        <div>
                          <span className="font-medium">Difficulty:</span>{" "}
                          <Badge variant={getDifficultyBadgeVariant(assignmentData.difficulty)} className="ml-1">
                            {assignmentData.difficulty}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">Est. Time:</span> {assignmentData.estimatedTime} min
                        </div>
                        <div>
                          <span className="font-medium">Total Problems:</span> {assignmentData.totalProblems}
                        </div>
                        <div>
                          <span className="font-medium">Assigned Groups:</span>{" "}
                          {assignmentData.assignedGroups.join(", ")}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {formatDate(assignmentData.createdDate)}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>{" "}
                          <Badge variant={assignmentData.status === "Active" ? "default" : "secondary"}>
                            {assignmentData.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-4">
                        <span className="font-medium">Description:</span>
                        <p className="text-sm text-muted-foreground mt-1">{assignmentData.description}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Metrics */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Average Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {assignmentData.averageScore.toFixed(1)}%
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Completion Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{assignmentData.completionRate}%</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Avg. Time Spent</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{assignmentData.averageTimeSpent} min</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Student Results */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Student Results ({assignmentData.studentResults.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {assignmentData.studentResults.map((result, idx) => (
                          <div key={idx} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">{result.studentName}</h4>
                              <div className="flex items-center space-x-2">
                                <Badge variant={getStatusBadgeVariant(result.status)}>{result.status}</Badge>
                                {result.status === "Completed" && (
                                  <Badge variant="outline">
                                    {result.score}/{result.maxScore} (
                                    {Math.round((result.score / result.maxScore) * 100)}%)
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">Score:</span>{" "}
                                <span className={getScoreColor(result.score, result.maxScore)}>
                                  {result.score}/{result.maxScore}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Time Spent:</span> {result.timeSpent} min
                              </div>
                              <div>
                                <span className="font-medium">Submitted:</span>{" "}
                                {result.submissionDate ? formatDate(result.submissionDate) : "Not submitted"}
                              </div>
                              <div>
                                <span className="font-medium">Problems Solved:</span> {result.solutions.length}
                              </div>
                            </div>

                            {/* Individual Solutions */}
                            {result.solutions.length > 0 && (
                              <div className="mt-4">
                                <h5 className="font-medium text-sm mb-2">Problem Solutions:</h5>
                                <div className="space-y-2">
                                  {result.solutions.map((solution, solutionIdx) => (
                                    <Collapsible key={solution.problemId}>
                                      <div className="border rounded p-3 bg-gray-50">
                                        <CollapsibleTrigger asChild>
                                          <div className="flex items-center justify-between cursor-pointer">
                                            <div className="flex items-center space-x-2">
                                              <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]:rotate-90" />
                                              <span className="text-sm font-medium">Problem {solutionIdx + 1}</span>
                                              <Badge
                                                variant={solution.isCorrect ? "default" : "destructive"}
                                                className="text-xs"
                                              >
                                                {solution.isCorrect ? "Correct" : "Incorrect"}
                                              </Badge>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                              {solution.timeSpent} min
                                            </span>
                                          </div>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="mt-2">
                                          <div className="text-xs text-muted-foreground mb-1">Problem:</div>
                                          <p className="text-sm mb-2">{solution.problemText}</p>
                                          <div className="text-xs text-muted-foreground mb-1">Student Solution:</div>
                                          <div
                                            className={`text-sm p-2 rounded border-l-2 whitespace-pre-line ${
                                              solution.isCorrect
                                                ? "bg-green-50 border-green-300"
                                                : "bg-red-50 border-red-300"
                                            }`}
                                          >
                                            {solution.studentSolution}
                                          </div>
                                          {solution.aiPrompts.length > 0 && (
                                            <div className="mt-2">
                                              <div className="text-xs text-muted-foreground mb-1">
                                                AI Assistance: {solution.aiPrompts.length} prompts
                                              </div>
                                            </div>
                                          )}
                                        </CollapsibleContent>
                                      </div>
                                    </Collapsible>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })()}
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setViewingAssignmentDetails(null)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
