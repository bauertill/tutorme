export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  group: string;
  performance: "Excellent" | "Good" | "Average" | "Needs Improvement";
  enrollmentDate: string;
  status: "active" | "inactive";
  joinDate: string;
}

// Add after the existing interfaces
export interface AIEvaluation {
  studentId: string;
  lastUpdated: string;
  strengths: Record<
    string,
    {
      score: number; // 0-100
      evidence: string[];
    }
  >;
  weaknesses: Record<
    string,
    {
      score: number; // 0-100 (lower is weaker)
      evidence: string[];
    }
  >;
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
