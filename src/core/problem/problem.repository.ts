import { type Language } from "@/i18n/types";
import { type Problem } from "./problem.types";

export function getExampleProblems(language: Language): Problem[] {
  if (language === "en") {
    return [
      {
        id: "example-problem-1",
        problem:
          "Ivan rents a car for €25 a day and €0.20 a mile. If he rents it for 4 days and drives it 400 miles, how many euros does he pay?",
        problemNumber: "1",
        referenceSolution: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "example-problem-2",
        problem: "What is the value of $(2x + 5)^2$ when $x = 3$?",
        problemNumber: "2",
        referenceSolution: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "example-problem-3",
        problem:
          "The function $f(x)$ is defined by $f(x)=x^{2}-x$. What is the value of $f(4)$?",
        problemNumber: "3",
        referenceSolution: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
  if (language === "de") {
    return [
      {
        id: "example-problem-1",
        problem:
          "Ivan mietet einen Auto für €25 pro Tag und €0.20 pro Meile. Wenn er ihn für 4 Tage mietet und 400 Meilen fährt, wie viel Euro zahlt er?",
        problemNumber: "1",
        referenceSolution: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "example-problem-2",
        problem: "Was ist der Wert von $(2x + 5)^2$ wenn $x = 3$?",
        problemNumber: "2",
        referenceSolution: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "example-problem-3",
        problem:
          "Die Funktion $f(x)$ ist definiert durch $f(x)=x^{2}-x$. Was ist der Wert von $f(4)$?",
        problemNumber: "3",
        referenceSolution: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
  console.error("Language not supported", { language });
  return [];
}
