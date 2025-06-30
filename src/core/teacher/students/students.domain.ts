import type { AIEvaluation, Student } from "./students.types";

export const getStudents = () => {
  return initialStudents;
};

export const getStudentAIEvaluation = (studentId: string) => {
  return aiEvaluationData.find((student) => student.studentId === studentId);
};

export const initialStudents: Student[] = [
  {
    id: "1",
    firstName: "Anna",
    lastName: "Müller",
    email: "anna.mueller@school.de",
    group: "7A",
    grade: "7",
    enrollmentDate: "2024-09-01",
    status: "active",
    performance: "Excellent",
    joinDate: "2024-09-01",
  },
  {
    id: "2",
    firstName: "Lisa",
    lastName: "Weber",
    email: "lisa.weber@school.de",
    group: "7A",
    grade: "7",
    enrollmentDate: "2024-09-01",
    status: "active",
    performance: "Excellent",
    joinDate: "2024-09-01",
  },
  {
    id: "3",
    firstName: "Emma",
    lastName: "Bauer",
    email: "emma.bauer@school.de",
    group: "7A",
    grade: "7",
    enrollmentDate: "2024-09-01",
    status: "active",
    performance: "Excellent",
    joinDate: "2024-09-01",
  },
  {
    id: "4",
    firstName: "Tom",
    lastName: "Fischer",
    email: "tom.fischer@school.de",
    group: "7A",
    grade: "7",
    enrollmentDate: "2024-09-01",
    status: "active",
    performance: "Excellent",
    joinDate: "2024-09-01",
  },
  {
    id: "5",
    firstName: "Max",
    lastName: "Müller",
    email: "max.mueller@school.de",
    group: "8B",
    grade: "8",
    enrollmentDate: "2025-06-28",
    status: "active",
    performance: "Excellent",
    joinDate: "2025-06-28",
  },
  {
    id: "6",
    firstName: "Sarah",
    lastName: "Klein",
    email: "sarah.klein@school.de",
    group: "8B",
    grade: "8",
    enrollmentDate: "2024-09-01",
    status: "active",
    performance: "Excellent",
    joinDate: "2024-09-01",
  },
  {
    id: "7",
    firstName: "Leon",
    lastName: "Hoffmann",
    email: "leon.hoffmann@school.de",
    group: "8B",
    grade: "8",
    enrollmentDate: "2024-09-01",
    status: "active",
    performance: "Excellent",
    joinDate: "2024-09-01",
  },
  {
    id: "8",
    firstName: "Julia",
    lastName: "Schmidt",
    email: "julia.schmidt@school.de",
    group: "9C",
    grade: "9",
    enrollmentDate: "2024-09-01",
    status: "active",
    performance: "Excellent",
    joinDate: "2024-09-01",
  },
  {
    id: "9",
    firstName: "David",
    lastName: "Wagner",
    email: "david.wagner@school.de",
    group: "9C",
    grade: "9",
    enrollmentDate: "2024-09-01",
    status: "active",
    performance: "Average",
    joinDate: "2024-09-01",
  },
  {
    id: "10",
    firstName: "Sophie",
    lastName: "Richter",
    email: "sophie.richter@school.de",
    group: "9C",
    grade: "9",
    enrollmentDate: "2024-09-01",
    status: "active",
    performance: "Needs Improvement",
    joinDate: "2024-09-01",
  },
];

// Add the AI evaluation data after studentWorkloadData
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
];
