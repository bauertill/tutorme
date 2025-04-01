import { type Language } from "@/i18n/types";
import { type Problem } from "../problem/types";

export function getExampleProblems(language: Language): Problem[] {
  if (language === "en") {
    return [
      {
        id: "example-problem-1",
        createdAt: new Date(),
        type: "example",
        dataSource: "example",
        problem:
          "Ivan rents a car for €25 a day and €0.20 a mile. If he rents it for 4 days and drives it 400 miles, how many euros does he pay?",
        solution: "25 * 4 + 0.20 * 400 = 100 + 80 = 180",
        level: "Level 1",
        language: "en",
      },
      {
        id: "example-problem-2",
        createdAt: new Date(),
        type: "example",
        dataSource: "example",
        problem: "What is the value of $(2x + 5)^2$ when $x = 3$?",
        solution: "2 * 3 + 5 = 6 + 5 = 11 \\\\ (2 * 3 + 5)^2 = 11^2 = 121",
        level: "Level 1",
        language: "en",
      },
      {
        id: "example-problem-3",
        createdAt: new Date(),
        type: "example",
        dataSource: "example",
        problem:
          "The function $f(x)$ is defined by $f(x)=x^{2}-x$. What is the value of $f(4)$?",
        solution: "f(4) = 4^2 - 4 = 16 - 4 = 12",
        level: "Level 1",
        language: "en",
      },
    ];
  }
  if (language === "de") {
    return [
      {
        id: "example-problem-1",
        createdAt: new Date(),
        type: "example",
        dataSource: "example",
        problem:
          "Ivan mietet einen Auto für €25 pro Tag und €0.20 pro Meile. Wenn er ihn für 4 Tage mietet und 400 Meilen fährt, wie viel Euro zahlt er?",
        solution: "25 * 4 + 0.20 * 400 = 100 + 80 = 180",
        level: "Level 1",
        language: "de",
      },
      {
        id: "example-problem-2",
        createdAt: new Date(),
        type: "example",
        dataSource: "example",
        problem: "Was ist der Wert von $(2x + 5)^2$ wenn $x = 3$?",
        solution: "2 * 3 + 5 = 6 + 5 = 11 \\\\ (2 * 3 + 5)^2 = 11^2 = 121",
        level: "Level 1",
        language: "de",
      },
      {
        id: "example-problem-3",
        createdAt: new Date(),
        type: "example",
        dataSource: "example",
        problem:
          "Die Funktion $f(x)$ ist definiert durch $f(x)=x^{2}-x$. Was ist der Wert von $f(4)$?",
        solution: "f(4) = 4^2 - 4 = 16 - 4 = 12",
        level: "Level 1",
        language: "de",
      },
    ];
  }
  console.error("Language not supported", { language });
  return [];
}
