export interface Student {
  id: string
  name: string
  email: string
  group: string
  grade: string
  enrollmentDate: string
  status: "active" | "inactive"
}

export interface Group {
  id: string
  name: string
  grade: string
  studentCount: number
  teacher: string
  subject: string
  status: "active" | "inactive"
}

export interface BookProblem {
  id: string
  chapter: string
  section: string
  problemNumber: string
  difficulty: "Easy" | "Medium" | "Hard"
  topic: string
  problemText: string
  solution: string
  estimatedTime: number
}

export interface Book {
  id: string
  title: string
  author: string
  isbn: string
  subject: string
  grade: string
  available: boolean
  totalCopies: number
  availableCopies: number
  publisher?: string
  year?: number
  isScanned?: boolean
  problems?: BookProblem[]
}

export interface BookRequest {
  id: string
  title: string
  author: string
  isbn: string
  publisher?: string
  year?: number
  subject: string
  grade: string
  requestedBy: string
  requestDate: string
  reason: string
  status: "pending" | "approved" | "rejected" | "ordered" | "received"
  estimatedCost?: string
  priority: "low" | "medium" | "high"
  expectedDelivery?: string
  quantity: number
}

export interface Assignment {
  id: string
  title: string
  description: string
  subject: string
  group: string
  dueDate: string
  status: "draft" | "active" | "completed" | "overdue"
  totalProblems: number
  estimatedTime: number
}

export interface Activity {
  id: string
  type: "assignment" | "student" | "book" | "system"
  title: string
  description: string
  timestamp: string
  details: {
    [key: string]: any
  }
  status: "completed" | "pending" | "failed" | "info"
  relatedEntities: {
    students?: string[]
    groups?: string[]
    assignments?: string[]
    books?: string[]
  }
}

// Mock data
export const students: Student[] = [
  {
    id: "1",
    name: "Anna Müller",
    email: "anna.mueller@school.de",
    group: "7A",
    grade: "7",
    enrollmentDate: "2024-09-01",
    status: "active",
  },
  {
    id: "2",
    name: "Lisa Weber",
    email: "lisa.weber@school.de",
    group: "7A",
    grade: "7",
    enrollmentDate: "2024-09-01",
    status: "active",
  },
  {
    id: "3",
    name: "Emma Bauer",
    email: "emma.bauer@school.de",
    group: "7A",
    grade: "7",
    enrollmentDate: "2024-09-01",
    status: "active",
  },
  {
    id: "4",
    name: "Tom Fischer",
    email: "tom.fischer@school.de",
    group: "7A",
    grade: "7",
    enrollmentDate: "2024-09-01",
    status: "active",
  },
  {
    id: "5",
    name: "Max Müller",
    email: "max.mueller@school.de",
    group: "8B",
    grade: "8",
    enrollmentDate: "2025-06-28",
    status: "active",
  },
  {
    id: "6",
    name: "Sarah Klein",
    email: "sarah.klein@school.de",
    group: "8B",
    grade: "8",
    enrollmentDate: "2024-09-01",
    status: "active",
  },
  {
    id: "7",
    name: "Leon Hoffmann",
    email: "leon.hoffmann@school.de",
    group: "8B",
    grade: "8",
    enrollmentDate: "2024-09-01",
    status: "active",
  },
  {
    id: "8",
    name: "Julia Schmidt",
    email: "julia.schmidt@school.de",
    group: "9C",
    grade: "9",
    enrollmentDate: "2024-09-01",
    status: "active",
  },
  {
    id: "9",
    name: "David Wagner",
    email: "david.wagner@school.de",
    group: "9C",
    grade: "9",
    enrollmentDate: "2024-09-01",
    status: "active",
  },
  {
    id: "10",
    name: "Sophie Richter",
    email: "sophie.richter@school.de",
    group: "9C",
    grade: "9",
    enrollmentDate: "2024-09-01",
    status: "active",
  },
]

export const groups: Group[] = [
  {
    id: "7A",
    name: "Group 7A",
    grade: "7",
    studentCount: 4,
    teacher: "Dr. Sarah Johnson",
    subject: "Mathematics",
    status: "active",
  },
  {
    id: "8B",
    name: "Group 8B",
    grade: "8",
    studentCount: 3,
    teacher: "Dr. Sarah Johnson",
    subject: "Mathematics",
    status: "active",
  },
  {
    id: "9C",
    name: "Group 9C",
    grade: "9",
    studentCount: 3,
    teacher: "Dr. Sarah Johnson",
    subject: "Mathematics",
    status: "active",
  },
  {
    id: "10A",
    name: "Group 10A",
    grade: "10",
    studentCount: 0,
    teacher: "Dr. Sarah Johnson",
    subject: "Mathematics",
    status: "inactive",
  },
]

export const books: Book[] = [
  {
    id: "1",
    title: "Algebra Grundlagen",
    author: "Dr. Hans Meyer",
    isbn: "978-3-12-123456-7",
    subject: "Mathematics",
    grade: "7",
    available: true,
    totalCopies: 30,
    availableCopies: 25,
    publisher: "Mathematik Verlag",
    year: 2023,
    isScanned: true,
    problems: [
      {
        id: "alg-1",
        chapter: "Kapitel 1",
        section: "1.1",
        problemNumber: "1.1.1",
        difficulty: "Easy",
        topic: "Grundlagen der Algebra",
        problemText: "Vereinfachen Sie den Ausdruck: 3x + 2x - x",
        solution: "4x\n\nLösungsweg:\n3x + 2x - x = (3 + 2 - 1)x = 4x",
        estimatedTime: 5,
      },
      {
        id: "alg-2",
        chapter: "Kapitel 1",
        section: "1.2",
        problemNumber: "1.2.3",
        difficulty: "Medium",
        topic: "Gleichungen lösen",
        problemText: "Lösen Sie die Gleichung: 2x + 5 = 3x - 7",
        solution: "x = 12\n\nLösungsweg:\n2x + 5 = 3x - 7\n5 + 7 = 3x - 2x\n12 = x",
        estimatedTime: 8,
      },
    ],
  },
  {
    id: "2",
    title: "Geometrie für Anfänger",
    author: "Dr. Maria Schmidt",
    isbn: "978-3-12-345678-9",
    subject: "Mathematics",
    grade: "8",
    available: true,
    totalCopies: 25,
    availableCopies: 20,
    publisher: "Springer Verlag",
    year: 2022,
    isScanned: true,
    problems: [
      {
        id: "geo-1",
        chapter: "Kapitel 2",
        section: "2.1",
        problemNumber: "2.1.1",
        difficulty: "Easy",
        topic: "Flächenberechnung",
        problemText: "Berechnen Sie die Fläche eines Rechtecks mit den Seiten a = 5 cm und b = 8 cm",
        solution: "40 cm²\n\nLösungsweg:\nA = a × b = 5 cm × 8 cm = 40 cm²",
        estimatedTime: 3,
      },
      {
        id: "geo-2",
        chapter: "Kapitel 2",
        section: "2.3",
        problemNumber: "2.3.2",
        difficulty: "Medium",
        topic: "Kreisberechnung",
        problemText: "Berechnen Sie den Umfang eines Kreises mit dem Radius r = 4 cm (π ≈ 3,14)",
        solution: "25,12 cm\n\nLösungsweg:\nU = 2πr = 2 × 3,14 × 4 cm = 25,12 cm",
        estimatedTime: 6,
      },
    ],
  },
  {
    id: "3",
    title: "Quadratische Gleichungen",
    author: "Prof. Klaus Weber",
    isbn: "978-3-12-567890-1",
    subject: "Mathematics",
    grade: "9",
    available: true,
    totalCopies: 20,
    availableCopies: 18,
    publisher: "Bildung Verlag",
    year: 2024,
    isScanned: false,
  },
  {
    id: "4",
    title: "Trigonometrie Basics",
    author: "Dr. Anna Fischer",
    isbn: "978-3-12-789012-3",
    subject: "Mathematics",
    grade: "10",
    available: true,
    totalCopies: 15,
    availableCopies: 12,
    publisher: "Wissenschaft Verlag",
    year: 2023,
    isScanned: false,
  },
  {
    id: "5",
    title: "Statistik und Wahrscheinlichkeit",
    author: "Prof. Michael Braun",
    isbn: "978-3-12-901234-5",
    subject: "Mathematics",
    grade: "11",
    available: false,
    totalCopies: 10,
    availableCopies: 0,
    publisher: "Akademie Verlag",
    year: 2021,
    isScanned: false,
  },
  {
    id: "6",
    title: "Lineare Algebra Einführung",
    author: "Dr. Thomas Müller",
    isbn: "978-3-12-111222-3",
    subject: "Mathematics",
    grade: "11",
    available: true,
    totalCopies: 12,
    availableCopies: 8,
    publisher: "Universität Verlag",
    year: 2024,
    isScanned: true,
    problems: [
      {
        id: "lin-1",
        chapter: "Kapitel 1",
        section: "1.1",
        problemNumber: "1.1.1",
        difficulty: "Medium",
        topic: "Vektoren",
        problemText: "Berechnen Sie die Summe der Vektoren a⃗ = (2, 3) und b⃗ = (1, -2)",
        solution: "(3, 1)\n\nLösungsweg:\na⃗ + b⃗ = (2, 3) + (1, -2) = (2+1, 3+(-2)) = (3, 1)",
        estimatedTime: 4,
      },
    ],
  },
  {
    id: "7",
    title: "Calculus Grundlagen",
    author: "Prof. Sarah Wagner",
    isbn: "978-3-12-333444-5",
    subject: "Mathematics",
    grade: "12",
    available: true,
    totalCopies: 18,
    availableCopies: 15,
    publisher: "Hochschule Verlag",
    year: 2023,
    isScanned: false,
  },
  {
    id: "8",
    title: "Diskrete Mathematik",
    author: "Dr. Peter Klein",
    isbn: "978-3-12-555666-7",
    subject: "Mathematics",
    grade: "12",
    available: false,
    totalCopies: 8,
    availableCopies: 0,
    publisher: "Technik Verlag",
    year: 2022,
    isScanned: false,
  },
]

export const bookRequests: BookRequest[] = [
  {
    id: "req-1",
    title: "Advanced Calculus",
    author: "Dr. Robert Johnson",
    isbn: "978-3-12-777888-9",
    publisher: "Academic Press",
    year: 2024,
    subject: "Mathematics",
    grade: "12",
    requestedBy: "Dr. Sarah Johnson",
    requestDate: "2025-06-25",
    reason: "Needed for advanced mathematics course next semester",
    status: "pending",
    estimatedCost: "€45.99",
    priority: "high",
    expectedDelivery: "2025-07-15",
    quantity: 15,
  },
  {
    id: "req-2",
    title: "Mathematik für Ingenieure Band 2",
    author: "Prof. Andreas Weber",
    isbn: "978-3-12-999000-1",
    publisher: "Springer Verlag",
    year: 2024,
    subject: "Mathematics",
    grade: "11",
    requestedBy: "Dr. Sarah Johnson",
    requestDate: "2025-06-20",
    reason: "Follow-up book for engineering mathematics series",
    status: "approved",
    estimatedCost: "€38.50",
    priority: "medium",
    expectedDelivery: "2025-07-10",
    quantity: 20,
  },
  {
    id: "req-3",
    title: "Statistik Praxisbuch",
    author: "Dr. Lisa Hoffmann",
    isbn: "978-3-12-222333-4",
    publisher: "Praxis Verlag",
    year: 2023,
    subject: "Mathematics",
    grade: "10",
    requestedBy: "Dr. Sarah Johnson",
    requestDate: "2025-06-18",
    reason: "Practical statistics exercises for Grade 10",
    status: "ordered",
    estimatedCost: "€29.99",
    priority: "medium",
    expectedDelivery: "2025-07-05",
    quantity: 25,
  },
  {
    id: "req-4",
    title: "Geometrie Aufgabensammlung",
    author: "Prof. Martin Fischer",
    isbn: "978-3-12-444555-6",
    publisher: "Übung Verlag",
    year: 2024,
    subject: "Mathematics",
    grade: "8",
    requestedBy: "Dr. Sarah Johnson",
    requestDate: "2025-06-15",
    reason: "Additional geometry practice problems",
    status: "rejected",
    estimatedCost: "€22.50",
    priority: "low",
    quantity: 10,
  },
  {
    id: "req-5",
    title: "Algebra Lösungsbuch",
    author: "Dr. Eva Schmidt",
    isbn: "978-3-12-666777-8",
    publisher: "Lösung Verlag",
    year: 2024,
    subject: "Mathematics",
    grade: "9",
    requestedBy: "Dr. Sarah Johnson",
    requestDate: "2025-06-28",
    reason: "Solution manual for algebra textbook",
    status: "received",
    estimatedCost: "€19.99",
    priority: "low",
    expectedDelivery: "2025-06-30",
    quantity: 5,
  },
]

export const assignments: Assignment[] = [
  {
    id: "1",
    title: "Algebra Basics",
    description: "Introduction to algebraic expressions",
    subject: "Mathematics",
    group: "7A",
    dueDate: "2025-07-05",
    status: "completed",
    totalProblems: 15,
    estimatedTime: 45,
  },
  {
    id: "2",
    title: "Quadratic Equations",
    description: "Solving quadratic equations",
    subject: "Mathematics",
    group: "8B",
    dueDate: "2025-06-27",
    status: "overdue",
    totalProblems: 12,
    estimatedTime: 60,
  },
  {
    id: "3",
    title: "Geometry Fundamentals",
    description: "Basic geometric shapes and properties",
    subject: "Mathematics",
    group: "9C",
    dueDate: "2025-07-10",
    status: "active",
    totalProblems: 20,
    estimatedTime: 90,
  },
  {
    id: "4",
    title: "Linear Functions",
    description: "Understanding linear functions and graphs",
    subject: "Mathematics",
    group: "7A",
    dueDate: "2025-07-15",
    status: "draft",
    totalProblems: 18,
    estimatedTime: 75,
  },
]

export const activities: Activity[] = [
  {
    id: "algebra-basics-7a",
    type: "assignment",
    title: "Assignment Completed",
    description: "Assignment 'Algebra Basics' completed by Group 7A",
    timestamp: "2025-06-29T14:30:00Z",
    status: "completed",
    details: {
      assignmentName: "Algebra Basics",
      groupName: "Group 7A",
      completionRate: 95,
      averageScore: 87,
      timeSpent: 45,
      studentsCompleted: 12,
      totalStudents: 13,
      topPerformers: ["Anna Müller", "Lisa Weber", "Emma Bauer"],
      strugglingStudents: ["Tom Fischer"],
      submissionTime: "2025-06-29T14:30:00Z",
      feedback: "Excellent work overall. Focus on algebraic manipulation for struggling students.",
    },
    relatedEntities: {
      groups: ["7A"],
      assignments: ["algebra-basics"],
      students: ["anna-muller", "lisa-weber", "emma-bauer", "tom-fischer"],
    },
  },
  {
    id: "max-muller-8b",
    type: "student",
    title: "New Student Added",
    description: "New student 'Max Müller' added to Group 8B",
    timestamp: "2025-06-28T10:15:00Z",
    status: "info",
    details: {
      studentName: "Max Müller",
      email: "max.mueller@school.de",
      groupName: "Group 8B",
      grade: "10A",
      enrollmentDate: "2025-06-28",
      previousSchool: "Gymnasium München",
      initialAssessment: "Pending",
      parentContact: "Maria Müller - maria.mueller@email.de",
      emergencyContact: "+49 89 123456789",
      specialNeeds: "None",
      mathLevel: "Advanced",
    },
    relatedEntities: {
      students: ["max-muller"],
      groups: ["8B"],
    },
  },
  {
    id: "geometrie-anfanger",
    type: "book",
    title: "Book Request Submitted",
    description: "Book request submitted for 'Geometrie für Anfänger'",
    timestamp: "2025-06-26T16:45:00Z",
    status: "pending",
    details: {
      bookTitle: "Geometrie für Anfänger",
      author: "Dr. Maria Schmidt",
      isbn: "978-3-12-345678-9",
      publisher: "Mathematik Verlag",
      requestedBy: "Teacher Anna",
      reason: "Needed for upcoming geometry unit in Grade 9",
      estimatedCost: "€29.99",
      approvalStatus: "Pending",
      expectedDelivery: "2025-07-05",
      quantity: 5,
      priority: "Medium",
      budgetCode: "MATH-2025-Q2",
    },
    relatedEntities: {
      books: ["geometrie-anfanger"],
    },
  },
  {
    id: "assignment-overdue",
    type: "assignment",
    title: "Assignment Overdue Alert",
    description: "3 students have overdue assignments in 'Quadratic Equations'",
    timestamp: "2025-06-29T09:00:00Z",
    status: "failed",
    details: {
      assignmentName: "Quadratic Equations",
      overdueStudents: ["Tom Fischer", "Sarah Klein", "Leon Hoffmann"],
      dueDate: "2025-06-27",
      daysOverdue: 2,
      notificationsSent: 3,
      parentContactRequired: true,
      extensionRequested: false,
      penaltyApplied: "10% per day",
      teacherNotes: "Students struggling with concept. Consider additional tutoring.",
    },
    relatedEntities: {
      assignments: ["quadratic-equations"],
      students: ["tom-fischer", "sarah-klein", "leon-hoffmann"],
    },
  },
  {
    id: "system-backup",
    type: "system",
    title: "System Backup Completed",
    description: "Daily system backup completed successfully",
    timestamp: "2025-06-29T02:00:00Z",
    status: "completed",
    details: {
      backupSize: "2.3 GB",
      duration: "12 minutes",
      filesBackedUp: 15847,
      location: "Cloud Storage - EU West",
      nextBackup: "2025-06-30T02:00:00Z",
      backupType: "Incremental",
      compressionRatio: "65%",
      verificationStatus: "Passed",
    },
    relatedEntities: {},
  },
  {
    id: "group-performance-update",
    type: "system",
    title: "Weekly Performance Report",
    description: "Weekly performance analytics generated for all groups",
    timestamp: "2025-06-28T18:00:00Z",
    status: "completed",
    details: {
      reportPeriod: "Week 26, 2025",
      groupsAnalyzed: 8,
      studentsAnalyzed: 156,
      assignmentsReviewed: 32,
      averagePerformance: 82,
      improvementTrends: ["Group 7A: +5%", "Group 8B: +3%"],
      concernAreas: ["Group 9C: -2%"],
    },
    relatedEntities: {
      groups: ["7A", "8B", "9C"],
    },
  },
]

// Helper functions
export const getActiveStudents = () => students.filter((s) => s.status === "active")
export const getActiveGroups = () => groups.filter((g) => g.status === "active")
export const getAvailableBooks = () => books.filter((b) => b.available)
export const getAllBooks = () => books
export const getAllBookRequests = () => bookRequests
export const getActiveAssignments = () => assignments.filter((a) => a.status === "active" || a.status === "draft")
export const getRecentActivities = (limit = 10) =>
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit)
