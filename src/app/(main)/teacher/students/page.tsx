"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  grade: string
  group: string
  performance: "Excellent" | "Good" | "Average" | "Needs Improvement"
  joinDate: string
}

// Add after the existing interfaces
interface AIEvaluation {
  studentId: string
  lastUpdated: string
  strengths: {
    [concept: string]: {
      score: number // 0-100
      evidence: string[]
    }
  }
  weaknesses: {
    [concept: string]: {
      score: number // 0-100 (lower is weaker)
      evidence: string[]
    }
  }
  characterTraits: {
    trait: string
    level: "Low" | "Moderate" | "High"
    description: string
  }[]
  motivationStrategies: {
    strategy: string
    effectiveness: number // 0-100
    examples: string[]
  }[]
  quickOverview: {
    overallScore: number
    primaryStrength: string
    primaryWeakness: string
    recommendedFocus: string
    motivationStyle: string
  }
}

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
]

// Mock student progress data
const studentProgressData = [
  {
    studentId: "1",
    studentName: "Anna Müller",
    assignmentId: "1",
    assignmentTitle: "Linear Equations Practice",
    status: "Completed" as const,
    timeSpent: 45,
    aiPromptsUsed: 3,
    progress: 100,
    lastActivity: "2025-06-26T10:30:00Z",
    score: 95,
    maxScore: 100,
  },
  {
    studentId: "1",
    studentName: "Anna Müller",
    assignmentId: "2",
    assignmentTitle: "Geometry Proofs",
    status: "In Progress" as const,
    timeSpent: 25,
    aiPromptsUsed: 7,
    progress: 60,
    lastActivity: "2025-06-27T14:15:00Z",
  },
  {
    studentId: "2",
    studentName: "Max Schmidt",
    assignmentId: "1",
    assignmentTitle: "Linear Equations Practice",
    status: "Completed" as const,
    timeSpent: 65,
    aiPromptsUsed: 12,
    progress: 100,
    lastActivity: "2025-06-25T09:30:00Z",
    score: 78,
    maxScore: 100,
  },
  {
    studentId: "2",
    studentName: "Max Schmidt",
    assignmentId: "3",
    assignmentTitle: "Statistics Basics",
    status: "Overdue" as const,
    timeSpent: 15,
    aiPromptsUsed: 8,
    progress: 30,
    lastActivity: "2025-06-22T13:45:00Z",
  },
  {
    studentId: "3",
    studentName: "Lisa Weber",
    assignmentId: "1",
    assignmentTitle: "Linear Equations Practice",
    status: "Completed" as const,
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
    status: "In Progress" as const,
    timeSpent: 42,
    aiPromptsUsed: 5,
    progress: 75,
    lastActivity: "2025-06-27T11:20:00Z",
  },
  {
    studentId: "4",
    studentName: "Tom Fischer",
    assignmentId: "1",
    assignmentTitle: "Linear Equations Practice",
    status: "Overdue" as const,
    timeSpent: 15,
    aiPromptsUsed: 8,
    progress: 30,
    lastActivity: "2025-06-23T13:45:00Z",
  },
  {
    studentId: "4",
    studentName: "Tom Fischer",
    assignmentId: "4",
    assignmentTitle: "Algebra Fundamentals",
    status: "Not Started" as const,
    timeSpent: 0,
    aiPromptsUsed: 0,
    progress: 0,
    lastActivity: "2025-06-21T08:00:00Z",
  },
]

const studentWorkloadData = [
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
    studentId: "2",
    studentName: "Max Schmidt",
    group: "Basic Math",
    activeAssignments: 1,
    completedThisWeek: 1,
    totalTimeSpent: 80,
    averageScore: 78,
    upcomingDeadlines: 2,
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
    studentId: "4",
    studentName: "Tom Fischer",
    group: "Basic Math",
    activeAssignments: 2,
    completedThisWeek: 0,
    totalTimeSpent: 15,
    averageScore: 0,
    upcomingDeadlines: 2,
  },
]

// Add the AI evaluation data after studentWorkloadData
const aiEvaluationData: AIEvaluation[] = [
  {
    studentId: "1",
    lastUpdated: "2025-06-27",
    strengths: {
      "Linear Equations": {
        score: 95,
        evidence: ["Solved complex equations quickly", "Showed multiple solution methods", "Helped other students"],
      },
      "Problem Solving": {
        score: 88,
        evidence: ["Breaks down complex problems systematically", "Uses logical reasoning effectively"],
      },
      "Mathematical Communication": {
        score: 92,
        evidence: ["Explains solutions clearly", "Uses proper mathematical notation"],
      },
    },
    weaknesses: {
      "Geometry Proofs": {
        score: 65,
        evidence: ["Struggles with formal proof structure", "Needs more practice with logical flow"],
      },
      "Time Management": {
        score: 70,
        evidence: ["Sometimes rushes through problems", "Could benefit from more careful checking"],
      },
    },
    characterTraits: [
      {
        trait: "Perfectionism",
        level: "High",
        description: "Tends to spend too much time on details, sometimes at the expense of completing all problems",
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
        examples: ["Let Anna explain solutions to the class", "Assign her as a peer tutor"],
      },
      {
        strategy: "Advanced Challenges",
        effectiveness: 85,
        examples: ["Provide extension problems", "Introduce competition-level questions"],
      },
      {
        strategy: "Real-world Applications",
        effectiveness: 80,
        examples: ["Engineering problems", "Architecture and design challenges"],
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
        evidence: ["Never gives up on difficult problems", "Shows improvement over time", "Asks thoughtful questions"],
      },
      "Basic Arithmetic": {
        score: 82,
        evidence: ["Strong foundation in calculations", "Accurate with basic operations"],
      },
    },
    weaknesses: {
      "Abstract Thinking": {
        score: 45,
        evidence: ["Struggles with algebraic concepts", "Needs concrete examples", "Difficulty with variables"],
      },
      Speed: {
        score: 50,
        evidence: ["Takes longer than average to complete problems", "Needs more time for processing"],
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
        description: "Frequently questions his own abilities despite making progress",
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
        examples: ["Football field measurements", "Soccer statistics and probability", "Basketball shooting angles"],
      },
      {
        strategy: "Confidence Building",
        effectiveness: 88,
        examples: ["Celebrate small wins", "Start with easier problems", "Positive reinforcement"],
      },
      {
        strategy: "Concrete Examples",
        effectiveness: 85,
        examples: ["Use physical objects", "Real-world scenarios", "Visual representations"],
      },
    ],
    quickOverview: {
      overallScore: 62,
      primaryStrength: "Perseverance & Work Ethic",
      primaryWeakness: "Abstract Thinking & Confidence",
      recommendedFocus: "Building confidence through concrete examples and sports-related problems",
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
        evidence: ["Natural understanding of shapes and angles", "Good spatial reasoning"],
      },
      "Independent Learning": {
        score: 91,
        evidence: ["Self-motivated", "Researches topics beyond curriculum", "Minimal AI assistance needed"],
      },
    },
    weaknesses: {
      "Computational Accuracy": {
        score: 68,
        evidence: ["Makes careless arithmetic errors", "Rushes through calculations"],
      },
      "Showing Work": {
        score: 55,
        evidence: ["Often skips steps", "Difficulty explaining reasoning", "Assumes others understand her thinking"],
      },
    },
    characterTraits: [
      {
        trait: "Impatience",
        level: "Moderate",
        description: "Gets frustrated with repetitive practice and wants to move on quickly",
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
        examples: ["Horse breeding genetics", "Animal population growth", "Veterinary calculations"],
      },
      {
        strategy: "Creative Challenges",
        effectiveness: 87,
        examples: ["Open-ended problems", "Multiple solution methods", "Design projects"],
      },
      {
        strategy: "Advanced Topics",
        effectiveness: 83,
        examples: ["Preview higher-level concepts", "Mathematical art projects"],
      },
    ],
    quickOverview: {
      overallScore: 81,
      primaryStrength: "Pattern Recognition & Geometry",
      primaryWeakness: "Showing Work & Computational Accuracy",
      recommendedFocus: "Developing clear communication of mathematical reasoning",
      motivationStyle: "Animal themes and creative challenges",
    },
  },
  {
    studentId: "4",
    lastUpdated: "2025-06-25",
    strengths: {
      Creativity: {
        score: 78,
        evidence: ["Thinks outside the box", "Comes up with unique approaches when engaged"],
      },
    },
    weaknesses: {
      Focus: {
        score: 25,
        evidence: ["Easily distracted", "Difficulty completing assignments", "Mind wanders during explanations"],
      },
      "Basic Operations": {
        score: 35,
        evidence: ["Struggles with fundamental arithmetic", "Needs review of multiplication tables"],
      },
      Organization: {
        score: 30,
        evidence: ["Loses track of steps", "Messy work", "Forgets to complete assignments"],
      },
      Motivation: {
        score: 20,
        evidence: ["Often appears disengaged", "Minimal effort on assignments", "Avoids challenging problems"],
      },
    },
    characterTraits: [
      {
        trait: "Procrastination",
        level: "High",
        description: "Consistently delays starting assignments until the last minute",
      },
      {
        trait: "Avoidance",
        level: "High",
        description: "Tends to avoid difficult tasks and gives up quickly",
      },
      {
        trait: "Social",
        level: "Moderate",
        description: "Enjoys group work but can be easily distracted by social interactions",
      },
    ],
    motivationStrategies: [
      {
        strategy: "Gaming Elements",
        effectiveness: 85,
        examples: ["Math games and competitions", "Point systems", "Achievement badges"],
      },
      {
        strategy: "Short Bursts",
        effectiveness: 80,
        examples: ["Break work into 10-minute segments", "Frequent breaks", "Quick wins"],
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
      recommendedFocus: "Building fundamental skills through engaging, short activities",
      motivationStyle: "Gaming elements and peer support",
    },
  },
]

// Add helper function to get AI evaluation
const getAIEvaluation = (studentId: string) => {
  return aiEvaluationData.find((evaluation) => evaluation.studentId === studentId)
}

// Add helper function to get concept score color
const getConceptScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600"
  return "text-red-600"
}

// Add helper function to get trait level color
const getTraitLevelColor = (level: string) => {
  switch (level) {
    case "High":
      return "text-red-600"
    case "Moderate":
      return "text-yellow-600"
    case "Low":
      return "text-green-600"
    default:
      return "text-gray-600"
  }
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [newStudent, setNewStudent] = useState({
    firstName: "",
    lastName: "",
    email: "",
    grade: "",
    group: "",
    performance: "Average" as Student["performance"],
  })
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null)

  const filteredStudents = students.filter(
    (student) =>
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.grade.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddStudent = () => {
    const student: Student = {
      id: Date.now().toString(),
      ...newStudent,
      joinDate: new Date().toISOString().split("T")[0],
    }
    setStudents([...students, student])
    setNewStudent({
      firstName: "",
      lastName: "",
      email: "",
      grade: "",
      group: "",
      performance: "Average",
    })
    setIsAddDialogOpen(false)
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setNewStudent({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      grade: student.grade,
      group: student.group,
      performance: student.performance,
    })
  }

  const handleUpdateStudent = () => {
    if (editingStudent) {
      setStudents(students.map((s) => (s.id === editingStudent.id ? { ...editingStudent, ...newStudent } : s)))
      setEditingStudent(null)
      setNewStudent({
        firstName: "",
        lastName: "",
        email: "",
        grade: "",
        group: "",
        performance: "Average",
      })
    }
  }

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter((s) => s.id !== id))
  }

  const getPerformanceBadgeVariant = (performance: Student["performance"]) => {
    switch (performance) {
      case "Excellent":
        return "default"
      case "Good":
        return "secondary"
      case "Average":
        return "outline"
      case "Needs Improvement":
        return "destructive"
      default:
        return "outline"
    }
  }

  const handleViewStudent = (student: Student) => {
    setViewingStudent(student)
  }

  const getStudentProgress = (studentId: string) => {
    return studentProgressData.filter((progress) => progress.studentId === studentId)
  }

  const getStudentWorkload = (studentId: string) => {
    return studentWorkloadData.find((workload) => workload.studentId === studentId)
  }

  const getProgressStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default"
      case "In Progress":
        return "secondary"
      case "Not Started":
        return "outline"
      case "Overdue":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getWorkloadColor = (activeAssignments: number) => {
    if (activeAssignments === 0) return "text-green-600"
    if (activeAssignments <= 2) return "text-yellow-600"
    return "text-red-600"
  }

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Students</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>Add a new student to your class roster.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firstName" className="text-right">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={newStudent.firstName}
                  onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lastName" className="text-right">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={newStudent.lastName}
                  onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="grade" className="text-right">
                  Grade
                </Label>
                <Input
                  id="grade"
                  value={newStudent.grade}
                  onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., 10A"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group" className="text-right">
                  Group
                </Label>
                <Select
                  value={newStudent.group}
                  onValueChange={(value) => setNewStudent({ ...newStudent, group: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Advanced Math">Advanced Math</SelectItem>
                    <SelectItem value="Basic Math">Basic Math</SelectItem>
                    <SelectItem value="Geometry">Geometry</SelectItem>
                    <SelectItem value="Statistics">Statistics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddStudent}>Add Student</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Management</CardTitle>
          <CardDescription>Manage your students and their information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow
                    key={student.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewStudent(student)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {student.firstName} {student.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.grade}</TableCell>
                    <TableCell>{student.group}</TableCell>
                    <TableCell>
                      <Badge variant={getPerformanceBadgeVariant(student.performance)}>{student.performance}</Badge>
                    </TableCell>
                    <TableCell>{student.joinDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditStudent(student)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteStudent(student.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No students found matching your search.</div>
          )}
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editFirstName" className="text-right">
                First Name
              </Label>
              <Input
                id="editFirstName"
                value={newStudent.firstName}
                onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editLastName" className="text-right">
                Last Name
              </Label>
              <Input
                id="editLastName"
                value={newStudent.lastName}
                onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editEmail" className="text-right">
                Email
              </Label>
              <Input
                id="editEmail"
                type="email"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editGrade" className="text-right">
                Grade
              </Label>
              <Input
                id="editGrade"
                value={newStudent.grade}
                onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editGroup" className="text-right">
                Group
              </Label>
              <Select
                value={newStudent.group}
                onValueChange={(value) => setNewStudent({ ...newStudent, group: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Advanced Math">Advanced Math</SelectItem>
                  <SelectItem value="Basic Math">Basic Math</SelectItem>
                  <SelectItem value="Geometry">Geometry</SelectItem>
                  <SelectItem value="Statistics">Statistics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editPerformance" className="text-right">
                Performance
              </Label>
              <Select
                value={newStudent.performance}
                onValueChange={(value: Student["performance"]) => setNewStudent({ ...newStudent, performance: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Average">Average</SelectItem>
                  <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateStudent}>Update Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Details Dialog */}
      <Dialog open={!!viewingStudent} onOpenChange={() => setViewingStudent(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>
                {viewingStudent?.firstName} {viewingStudent?.lastName}
              </span>
            </DialogTitle>
            <DialogDescription>Student details, current workload, and assignment progress</DialogDescription>
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
                    <span className="font-medium">Email:</span> {viewingStudent?.email}
                  </div>
                  <div>
                    <span className="font-medium">Grade:</span> {viewingStudent?.grade}
                  </div>
                  <div>
                    <span className="font-medium">Group:</span> {viewingStudent?.group}
                  </div>
                  <div>
                    <span className="font-medium">Performance:</span>
                    <Badge
                      variant={getPerformanceBadgeVariant(viewingStudent?.performance || "Average")}
                      className="ml-2"
                    >
                      {viewingStudent?.performance}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Join Date:</span> {viewingStudent?.joinDate}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workload Summary */}
            {viewingStudent &&
              (() => {
                const workload = getStudentWorkload(viewingStudent.id)
                return workload ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Current Workload</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 border rounded-lg">
                          <div className={`text-2xl font-bold ${getWorkloadColor(workload.activeAssignments)}`}>
                            {workload.activeAssignments}
                          </div>
                          <div className="text-sm text-muted-foreground">Active Assignments</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{workload.completedThisWeek}</div>
                          <div className="text-sm text-muted-foreground">Completed This Week</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{workload.totalTimeSpent}min</div>
                          <div className="text-sm text-muted-foreground">Total Time Spent</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {workload.averageScore > 0 ? `${workload.averageScore}%` : "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground">Average Score</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div
                            className={`text-2xl font-bold ${workload.upcomingDeadlines > 2 ? "text-red-600" : "text-orange-600"}`}
                          >
                            {workload.upcomingDeadlines}
                          </div>
                          <div className="text-sm text-muted-foreground">Upcoming Deadlines</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null
              })()}

            {/* Assignment Progress */}
            {viewingStudent &&
              (() => {
                const progress = getStudentProgress(viewingStudent.id)
                return (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Assignment Progress ({progress.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {progress.map((assignment) => (
                          <div
                            key={`${assignment.assignmentId}-${assignment.studentId}`}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="space-y-1">
                                <h4 className="font-medium">{assignment.assignmentTitle}</h4>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={getProgressStatusBadgeVariant(assignment.status)}>
                                    {assignment.status}
                                  </Badge>
                                  {assignment.score !== undefined && (
                                    <Badge variant="outline">
                                      {assignment.score}/{assignment.maxScore} (
                                      {Math.round((assignment.score / assignment.maxScore) * 100)}%)
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-right text-sm text-muted-foreground">
                                Last activity: {formatLastActivity(assignment.lastActivity)}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="space-y-1">
                                <p className="text-muted-foreground">Time Spent</p>
                                <p className="font-medium">{assignment.timeSpent} minutes</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-muted-foreground">AI Prompts Used</p>
                                <p className="font-medium">{assignment.aiPromptsUsed} prompts</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-muted-foreground">Progress</p>
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full transition-all"
                                      style={{ width: `${assignment.progress}%` }}
                                    />
                                  </div>
                                  <span className="font-medium">{assignment.progress}%</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-muted-foreground">Status</p>
                                <p className="font-medium">{assignment.status}</p>
                              </div>
                            </div>

                            {/* AI Usage Warning */}
                            {assignment.aiPromptsUsed > 10 && (
                              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                                <p className="text-yellow-800">
                                  <strong>High AI Usage:</strong> This student has used {assignment.aiPromptsUsed} AI
                                  prompts. Consider checking if they need additional support.
                                </p>
                              </div>
                            )}

                            {/* Overdue Warning */}
                            {assignment.status === "Overdue" && (
                              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
                                <p className="text-red-800">
                                  <strong>Overdue Assignment:</strong> This assignment is past due. Consider reaching
                                  out to the student.
                                </p>
                              </div>
                            )}
                          </div>
                        ))}

                        {progress.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No assignments found for this student.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}

            {/* AI Evaluation */}
            {viewingStudent &&
              (() => {
                const evaluation = getAIEvaluation(viewingStudent.id)
                return evaluation ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        AI Evaluation & Insights
                        <Badge variant="outline" className="text-xs">
                          Updated: {evaluation.lastUpdated}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Quick Overview */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">Quick Overview</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="font-medium">Overall Score:</span>
                              <span
                                className={`ml-2 font-bold ${getConceptScoreColor(evaluation.quickOverview.overallScore)}`}
                              >
                                {evaluation.quickOverview.overallScore}/100
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Primary Strength:</span>
                              <span className="ml-2 text-green-600">{evaluation.quickOverview.primaryStrength}</span>
                            </div>
                            <div>
                              <span className="font-medium">Primary Weakness:</span>
                              <span className="ml-2 text-red-600">{evaluation.quickOverview.primaryWeakness}</span>
                            </div>
                            <div>
                              <span className="font-medium">Motivation Style:</span>
                              <span className="ml-2 text-purple-600">{evaluation.quickOverview.motivationStyle}</span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className="font-medium">Recommended Focus:</span>
                            <p className="text-sm text-muted-foreground mt-1">
                              {evaluation.quickOverview.recommendedFocus}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Strengths */}
                          <div>
                            <h4 className="font-semibold text-green-700 mb-3">Strengths by Concept</h4>
                            <div className="space-y-3">
                              {Object.entries(evaluation.strengths).map(([concept, data]) => (
                                <div key={concept} className="border border-green-200 rounded-lg p-3 bg-green-50">
                                  <div className="flex justify-between items-center mb-2">
                                    <h5 className="font-medium text-sm">{concept}</h5>
                                    <Badge variant="outline" className="text-green-600">
                                      {data.score}/100
                                    </Badge>
                                  </div>
                                  <ul className="text-xs text-muted-foreground space-y-1">
                                    {data.evidence.map((evidence, idx) => (
                                      <li key={idx}>• {evidence}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Weaknesses */}
                          <div>
                            <h4 className="font-semibold text-red-700 mb-3">Weaknesses by Concept</h4>
                            <div className="space-y-3">
                              {Object.entries(evaluation.weaknesses).map(([concept, data]) => (
                                <div key={concept} className="border border-red-200 rounded-lg p-3 bg-red-50">
                                  <div className="flex justify-between items-center mb-2">
                                    <h5 className="font-medium text-sm">{concept}</h5>
                                    <Badge variant="outline" className="text-red-600">
                                      {data.score}/100
                                    </Badge>
                                  </div>
                                  <ul className="text-xs text-muted-foreground space-y-1">
                                    {data.evidence.map((evidence, idx) => (
                                      <li key={idx}>• {evidence}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Character Traits */}
                        <div>
                          <h4 className="font-semibold text-purple-700 mb-3">Character Traits</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {evaluation.characterTraits.map((trait, idx) => (
                              <div key={idx} className="border rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                  <h5 className="font-medium text-sm">{trait.trait}</h5>
                                  <Badge variant="outline" className={getTraitLevelColor(trait.level)}>
                                    {trait.level}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{trait.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Motivation Strategies */}
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-3">Motivation Strategies</h4>
                          <div className="space-y-3">
                            {evaluation.motivationStrategies.map((strategy, idx) => (
                              <div key={idx} className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                                <div className="flex justify-between items-center mb-2">
                                  <h5 className="font-medium text-sm">{strategy.strategy}</h5>
                                  <Badge variant="outline" className="text-blue-600">
                                    {strategy.effectiveness}% effective
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  <span className="font-medium">Examples:</span>
                                  <ul className="mt-1 space-y-1">
                                    {strategy.examples.map((example, exIdx) => (
                                      <li key={exIdx}>• {example}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null
              })()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingStudent(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (viewingStudent) {
                  handleEditStudent(viewingStudent)
                  setViewingStudent(null)
                }
              }}
            >
              Edit Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
