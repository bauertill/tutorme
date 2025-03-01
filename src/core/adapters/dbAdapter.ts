import type { Draft } from "@/core/utils";
import { db } from "@/server/db";
import type { PrismaClient } from "@prisma/client";
import {
  QuizStatus,
  type Question,
  type QuestionParams,
  type QuestionResponseWithQuestion,
  type Quiz,
  type UserQuestionResponse,
  type Concept,
  type ConceptWithGoal,
  type MasteryLevel,
} from "../concept/types";
import type { Goal } from "../goal/types";
import { Lesson, LessonIteration } from "../learning/types";
import { z } from "zod";

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
    return await this.db.quiz.create({
      data: {
        conceptId,
        questions: { create: questions },
        status: QuizStatus.Enum.ACTIVE,
      },
      include: { questions: true },
    });
  }

  async getQuestionById(id: string): Promise<Question> {
    return this.db.question.findUniqueOrThrow({ where: { id } });
  }

  async getQuizById(id: string): Promise<Quiz> {
    return await this.db.quiz.findUniqueOrThrow({
      where: { id },
      include: { questions: true },
    });
  }

  async getQuestionResponsesByQuizId(
    quizId: string,
  ): Promise<QuestionResponseWithQuestion[]> {
    return this.db.userQuestionResponse.findMany({
      where: { quizId },
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

  async appendQuizQuestion(
    quizId: string,
    question: QuestionParams,
  ): Promise<Quiz> {
    return await this.db.quiz.update({
      where: { id: quizId },
      data: { questions: { create: question } },
      include: { questions: true },
    });
  }

  /**
   * Updates the status of a quiz
   * @param quizId The ID of the quiz to update
   * @param status The new status for the quiz
   * @returns The updated quiz
   */
  async updateQuizStatus(quizId: string, status: QuizStatus): Promise<Quiz> {
    return await this.db.quiz.update({
      where: { id: quizId },
      data: { status },
      include: { questions: true },
    });
  }

  /**
   * Updates a concept with a teacher report
   * @param conceptId The ID of the concept to update
   * @param teacherReport The teacher report to add to the concept
   * @returns The updated concept
   */
  async updateConceptWithTeacherReport(
    conceptId: string,
    teacherReport: string,
  ): Promise<Concept> {
    return await this.db.concept.update({
      where: { id: conceptId },
      data: { teacherReport },
    });
  }

  /**
   * Gets a quiz by ID
   * @param quizId The ID of the quiz to get
   * @returns The quiz
   */
  async getQuiz(quizId: string): Promise<Quiz> {
    return await this.db.quiz.findUniqueOrThrow({
      where: { id: quizId },
      include: { questions: true },
    });
  }

  /**
   * Creates a new lesson
   * @param lessonGoal The goal of the lesson
   * @param conceptId The ID of the concept this lesson is for
   * @param goalId The ID of the parent goal
   * @param userId The ID of the user
   * @param lessonIterations The initial iterations for the lesson
   * @returns The created lesson
   */
  async createLesson(
    lessonGoal: string,
    conceptId: string,
    goalId: string,
    userId: string,
    lessonIterations: any,
  ): Promise<Lesson> {
    const dbLesson = await this.db.lesson.create({
      data: {
        lessonGoal,
        conceptId,
        goalId,
        userId,
        lessonIterations,
        status: "ACTIVE",
      },
    });
    return Lesson.parse(dbLesson)
  }

  /**
   * Gets all lessons for a concept
   * @param conceptId The ID of the concept
   * @returns The lessons for the concept
   */
  async getLessonsByConceptId(conceptId: string): Promise<Lesson[]> {
    const lessons = await this.db.lesson.findMany({
      where: { conceptId },
      orderBy: { createdAt: 'desc' },
    });
    return lessons.map(lesson => ({
      ...lesson,
      lessonIterations: z.array(LessonIteration).parse(lesson.lessonIterations),
    }));
  }
}

export const dbAdapter = new DBAdapter(db);
