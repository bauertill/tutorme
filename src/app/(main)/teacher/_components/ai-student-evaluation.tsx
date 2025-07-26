import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudentAIEvaluation } from "@/core/teacher/students/students.domain";

const getConceptScoreColor = (score: number) => {
  if (score >= 80) return "text-chart-1";
  if (score >= 60) return "text-chart-4";
  return "text-chart-3";
};

const getTraitLevelColor = (level: string) => {
  switch (level) {
    case "High":
      return "text-chart-3";
    case "Moderate":
      return "text-chart-4";
    case "Low":
      return "text-chart-1";
    default:
      return "text-muted-foreground";
  }
};

export const AiStudentEvaluation = ({ studentId }: { studentId: string }) => {
  const evaluation = getStudentAIEvaluation(studentId);
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
          <div className="rounded-lg border border-chart-2 bg-chart-2/10 p-4">
            <h4 className="mb-2 font-semibold text-chart-2">Quick Overview</h4>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div>
                <span className="font-medium">Overall Score:</span>
                <span
                  className={`ml-2 font-bold ${getConceptScoreColor(
                    evaluation.quickOverview.overallScore,
                  )}`}
                >
                  {evaluation.quickOverview.overallScore}/100
                </span>
              </div>
              <div>
                <span className="font-medium">Primary Strength:</span>
                <span className="ml-2 text-chart-1">
                  {evaluation.quickOverview.primaryStrength}
                </span>
              </div>
              <div>
                <span className="font-medium">Primary Weakness:</span>
                <span className="ml-2 text-destructive">
                  {evaluation.quickOverview.primaryWeakness}
                </span>
              </div>
              <div>
                <span className="font-medium">Motivation Style:</span>
                <span className="ml-2 text-chart-5">
                  {evaluation.quickOverview.motivationStyle}
                </span>
              </div>
            </div>
            <div className="mt-3">
              <span className="font-medium">Recommended Focus:</span>
              <p className="mt-1 text-sm text-muted-foreground">
                {evaluation.quickOverview.recommendedFocus}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Strengths */}
            <div>
              <h4 className="mb-3 font-semibold text-chart-1">
                Strengths by Concept
              </h4>
              <div className="space-y-3">
                {Object.entries(evaluation.strengths).map(([concept, data]) => (
                  <div
                    key={concept}
                    className="rounded-lg border border-chart-1 bg-chart-1/10 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h5 className="text-sm font-medium">{concept}</h5>
                      <Badge variant="outline" className="text-chart-1">
                        {data.score}/100
                      </Badge>
                    </div>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {data.evidence.map((evidence) => (
                        <li key={evidence}>• {evidence}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div>
              <h4 className="mb-3 font-semibold text-destructive">
                Weaknesses by Concept
              </h4>
              <div className="space-y-3">
                {Object.entries(evaluation.weaknesses).map(
                  ([concept, data]) => (
                    <div
                      key={concept}
                      className="rounded-lg border border-destructive bg-destructive/10 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h5 className="text-sm font-medium">{concept}</h5>
                        <Badge variant="outline" className="text-destructive">
                          {data.score}/100
                        </Badge>
                      </div>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {data.evidence.map((evidence) => (
                          <li key={evidence}>• {evidence}</li>
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
            <h4 className="mb-3 font-semibold text-chart-5">
              Character Traits
            </h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {evaluation.characterTraits.map((trait) => (
                <div key={trait.trait} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h5 className="text-sm font-medium">{trait.trait}</h5>
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
            <h4 className="mb-3 font-semibold text-chart-2">
              Motivation Strategies
            </h4>
            <div className="space-y-3">
              {evaluation.motivationStrategies.map((strategy) => (
                <div
                  key={strategy.strategy}
                  className="rounded-lg border border-chart-2 bg-chart-2/10 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h5 className="text-sm font-medium">{strategy.strategy}</h5>
                    <Badge variant="outline" className="text-chart-2">
                      {strategy.effectiveness}% effective
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Examples:</span>
                    <ul className="mt-1 space-y-1">
                      {strategy.examples.map((example) => (
                        <li key={example}>• {example}</li>
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
  ) : null;
};
