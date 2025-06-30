export interface BookProblem {
  id: string;
  chapter: string;
  section: string;
  problemNumber: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  problemText: string;
  solution: string;
  estimatedTime: number;
  bookId: string;
}

export interface TopicGroup {
  id: string;
  name: string;
  difficulty: number;
  problems: number;
  estimatedHours: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  subject: string;
  grade: string;
  available: boolean;
  totalCopies: number;
  availableCopies: number;
  publisher?: string;
  year?: number;
  isScanned?: boolean;
  problems?: BookProblem[];
}

export interface BookRequest {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher?: string;
  year?: number;
  subject: string;
  grade: string;
  requestedBy: string;
  requestDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "ordered" | "received";
  estimatedCost?: string;
  priority: "low" | "medium" | "high";
  expectedDelivery?: string;
  quantity: number;
}
