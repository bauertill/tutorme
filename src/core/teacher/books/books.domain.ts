import { Book, BookRequest, TopicGroup } from "./books.types";

export const getAvailableBooks = () => {
  return books;
};

export const getBookRequests = () => {
  return bookRequests;
};

export const getTopicsByBookId = (bookId: string): TopicGroup[] => {
  const book = books.find((b) => b.id === bookId);

  if (!book || !book.problems) {
    return [];
  }

  // Group problems by topic
  const topicMap = new Map<
    string,
    {
      problems: typeof book.problems;
      totalTime: number;
      difficulties: number[];
    }
  >();

  book.problems.forEach((problem) => {
    const topicKey = problem.topic;
    const difficultyScore =
      problem.difficulty === "Easy"
        ? 1
        : problem.difficulty === "Medium"
          ? 2
          : 3;

    if (!topicMap.has(topicKey)) {
      topicMap.set(topicKey, {
        problems: [],
        totalTime: 0,
        difficulties: [],
      });
    }

    const topicData = topicMap.get(topicKey)!;
    topicData.problems.push(problem);
    topicData.totalTime += problem.estimatedTime;
    topicData.difficulties.push(difficultyScore);
  });

  // Convert to TopicGroup array
  return Array.from(topicMap.entries())
    .map(([topicName, data]) => {
      // Calculate average difficulty
      const avgDifficulty = Math.round(
        data.difficulties.reduce((sum, diff) => sum + diff, 0) /
          data.difficulties.length,
      );

      // Convert minutes to hours (rounded to 1 decimal place)
      const estimatedHours = Math.round((data.totalTime / 60) * 10) / 10;

      // Generate a simple ID from the topic name
      const id = topicName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      return {
        id,
        name: topicName,
        difficulty: avgDifficulty,
        problems: data.problems.length,
        estimatedHours,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
};

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
        bookId: "1",
      },
      {
        id: "alg-2",
        chapter: "Kapitel 1",
        section: "1.2",
        problemNumber: "1.2.3",
        difficulty: "Medium",
        topic: "Gleichungen lösen",
        problemText: "Lösen Sie die Gleichung: 2x + 5 = 3x - 7",
        solution:
          "x = 12\n\nLösungsweg:\n2x + 5 = 3x - 7\n5 + 7 = 3x - 2x\n12 = x",
        estimatedTime: 8,
        bookId: "1",
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
        problemText:
          "Berechnen Sie die Fläche eines Rechtecks mit den Seiten a = 5 cm und b = 8 cm",
        solution: "40 cm²\n\nLösungsweg:\nA = a × b = 5 cm × 8 cm = 40 cm²",
        estimatedTime: 3,
        bookId: "2",
      },
      {
        id: "geo-2",
        chapter: "Kapitel 2",
        section: "2.3",
        problemNumber: "2.3.2",
        difficulty: "Medium",
        topic: "Kreisberechnung",
        problemText:
          "Berechnen Sie den Umfang eines Kreises mit dem Radius r = 4 cm (π ≈ 3,14)",
        solution:
          "25,12 cm\n\nLösungsweg:\nU = 2πr = 2 × 3,14 × 4 cm = 25,12 cm",
        estimatedTime: 6,
        bookId: "2",
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
        problemText:
          "Berechnen Sie die Summe der Vektoren a⃗ = (2, 3) und b⃗ = (1, -2)",
        solution:
          "(3, 1)\n\nLösungsweg:\na⃗ + b⃗ = (2, 3) + (1, -2) = (2+1, 3+(-2)) = (3, 1)",
        estimatedTime: 4,
        bookId: "6",
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
  {
    id: "9",
    title: "Mathematik für Ingenieure und Naturwissenschaftler",
    author: "Lothar Papula",
    isbn: "9783827420923",
    publisher: "Springer Vieweg",
    year: 2022,
    subject: "Engineering Mathematics",
    grade: "11",
    available: true,
    totalCopies: 0,
    availableCopies: 0,
    isScanned: true,
    problems: [
      {
        id: "1",
        chapter: "Kapitel 3",
        section: "3.1",
        problemNumber: "3.1.1",
        difficulty: "Easy",
        topic: "Lineare Gleichungen",
        problemText: "Lösen Sie die Gleichung: 2x + 5 = 13",
        solution:
          "x = 4\n\nLösungsweg:\n2x + 5 = 13\n2x = 13 - 5\n2x = 8\nx = 4",
        estimatedTime: 5,
        bookId: "9",
      },
      {
        id: "2",
        chapter: "Kapitel 3",
        section: "3.2",
        problemNumber: "3.2.3",
        difficulty: "Medium",
        topic: "Quadratische Gleichungen",
        problemText: "Lösen Sie die quadratische Gleichung: x² - 5x + 6 = 0",
        solution:
          "x₁ = 2, x₂ = 3\n\nLösungsweg:\nx² - 5x + 6 = 0\n(x - 2)(x - 3) = 0\nx = 2 oder x = 3",
        estimatedTime: 10,
        bookId: "9",
      },
      {
        id: "3",
        chapter: "Kapitel 4",
        section: "4.1",
        problemNumber: "4.1.2",
        difficulty: "Hard",
        topic: "Funktionen",
        problemText: "Bestimmen Sie die Ableitung von f(x) = x³ - 2x² + 3x - 1",
        solution:
          "f'(x) = 3x² - 4x + 3\n\nLösungsweg:\nf(x) = x³ - 2x² + 3x - 1\nf'(x) = 3x² - 4x + 3",
        estimatedTime: 15,
        bookId: "9",
      },
    ],
  },
  {
    id: "10",
    title: "Grundlagen der Mathematik für Dummies",
    author: "Mark Zegarelli",
    isbn: "9783446451827",
    publisher: "Wiley-VCH",
    year: 2021,
    subject: "Basic Mathematics",
    grade: "7",
    available: true,
    totalCopies: 0,
    availableCopies: 0,
    isScanned: true,
    problems: [
      {
        id: "4",
        chapter: "Kapitel 2",
        section: "2.1",
        problemNumber: "2.1.1",
        difficulty: "Easy",
        topic: "Grundrechenarten",
        problemText: "Berechnen Sie: 15 + 23 - 8",
        solution: "30\n\nLösungsweg:\n15 + 23 = 38\n38 - 8 = 30",
        estimatedTime: 3,
        bookId: "10",
      },
      {
        id: "5",
        chapter: "Kapitel 5",
        section: "5.2",
        problemNumber: "5.2.4",
        difficulty: "Medium",
        topic: "Bruchrechnung",
        problemText: "Vereinfachen Sie: 3/4 + 2/3",
        solution: "17/12\n\nLösungsweg:\n3/4 + 2/3 = 9/12 + 8/12 = 17/12",
        estimatedTime: 8,
        bookId: "10",
      },
    ],
  },
];

export const bookRequests: BookRequest[] = [
  {
    id: "1",
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
    id: "2",
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
    id: "3",
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
    id: "4",
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
    id: "5",
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
];
