import type { Draft } from "@/core/utils";
import { db } from "@/server/db";
import type { PrismaClient } from "@prisma/client";
import {
  type Assessment,
  type AssessmentLogEntry,
  AssessmentQuestion,
  type Question,
  type QuestionParams,
  type QuestionResponseWithQuestion,
  type Quiz,
  type UserQuestionResponse,
} from "../concept/types";
import type {
  Concept,
  ConceptWithGoal,
  Goal,
  MasteryLevel,
} from "../goal/types";

export class DBAdapter {
  constructor(private db: PrismaClient) {}

  async getGoalById(id: string): Promise<Goal> {
    return this.db.goal.findUniqueOrThrow({ where: { id } });
  }

  async createGoal(userId: string, goalText: string): Promise<Goal> {
    return this.db.goal.create({ data: { name: goalText, userId } });
  }

  async getUserGoals(userId: string): Promise<Goal[]> {
    return this.db.goal.findMany({ where: { userId } });
  }

  async getConceptsByGoalId(goalId: string): Promise<Concept[]> {
    return this.db.concept.findMany({ where: { goalId } });
  }

  async getConceptById(id: string): Promise<Concept> {
    return this.db.concept.findUniqueOrThrow({ where: { id } });
  }

  async getConceptWithGoalByConceptId(id: string): Promise<ConceptWithGoal> {
    return this.db.concept.findUniqueOrThrow({
      where: { id },
      include: { goal: true },
    });
  }

  async createConcepts(concepts: Concept[]): Promise<void> {
    await this.db.concept.createMany({ data: concepts });
  }

  async createQuiz(
    questions: QuestionParams[],
    conceptId: string,
  ): Promise<Quiz> {
    return this.db.quiz.create({
      data: {
        conceptId,
        questions: { create: questions },
      },
      include: { questions: true },
    });
  }

  async getQuestionById(id: string): Promise<Question> {
    return this.db.question.findUniqueOrThrow({ where: { id } });
  }

  async getQuizById(id: string): Promise<Quiz> {
    return this.db.quiz.findUniqueOrThrow({
      where: { id },
      include: { questions: true },
    });
  }

  async getQuestionResponsesByUserIdConceptId(
    userId: string,
    conceptId: string,
  ): Promise<QuestionResponseWithQuestion[]> {
    return this.db.userQuestionResponse.findMany({
      where: { userId, conceptId },
      include: { question: true },
    });
  }

  async createQuestionResponse(response: Draft<UserQuestionResponse>) {
    return this.db.userQuestionResponse.create({ data: response });
  }

  async updateConceptMasteryLevel(
    conceptId: string,
    masteryLevel: MasteryLevel,
  ) {
    return this.db.concept.update({
      where: { id: conceptId },
      data: { masteryLevel },
    });
  }

  async createAssessment(userId: string, conceptId: string) {
    const assessment = await this.db.assessment.create({
      data: { userId, conceptId },
    });
    return {
      ...assessment,
      logEntries: [],
    };
  }

  async createAssessmentLogEntry(data: {
    assessmentId: string;
    question: AssessmentQuestion;
    userResponse: string;
    isCorrect: boolean;
  }) {
    return this.db.assessmentLogEntry.create({
      data: {
        assessmentId: data.assessmentId,
        question: data.question,
        userResponse: data.userResponse,
        isCorrect: data.isCorrect,
      },
    });
  }

  async getAssessmentLogEntries(assessmentId: string) {
    const logEntries = await this.db.assessmentLogEntry.findMany({
      where: { assessmentId },
    });
    return logEntries.map((logEntry) => ({
      ...logEntry,
      question: AssessmentQuestion.parse(logEntry.question),
    }));
  }

  async getAssessmentById(id: string): Promise<Assessment> {
    const assessment = await this.db.assessment.findUniqueOrThrow({
      where: { id },
      include: { logEntries: true },
    });
    return {
      ...assessment,
      logEntries: assessment.logEntries.map(
        (logEntry): AssessmentLogEntry => ({
          ...logEntry,
          question: AssessmentQuestion.parse(logEntry.question),
        }),
      ),
    };
  }
}

export const dbAdapter = new DBAdapter(db);
