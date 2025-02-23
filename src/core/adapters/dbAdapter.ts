import { PrismaClient } from "@prisma/client";
import {
  type Question,
  type QuestionResponseWithQuestion,
  type Quiz,
  type UserQuestionResponse,
} from "../concept/types";
import {
  type Concept,
  type ConceptWithGoal,
  type Goal,
  type MasteryLevel,
} from "../goal/types";
import { type User } from "../user/types";

export class DBAdapter {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAllUsers(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return user;
  }

  async createUser(email: string, name: string): Promise<User> {
    const data = { name, email };
    return await this.prisma.user.create({ data });
  }

  async getGoalById(id: string): Promise<Goal> {
    const goal = await this.prisma.goal.findFirstOrThrow({
      where: { id },
    });
    return goal;
  }

  async createGoal(userId: string, goalText: string): Promise<Goal> {
    const goal = await this.prisma.goal.create({
      data: {
        name: goalText,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    // @TODO fix this type mismatch. Should be identical to DB.
    return {
      id: goal.id,
      userId: userId,
      name: goal.name,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };
  }

  async getUserGoals(id: string): Promise<Goal[]> {
    const goals = await this.prisma.goal.findMany({
      where: { user: { id } },
    });
    return goals.map((goal) => goal);
  }

  async getConceptsByGoalId(goalId: string): Promise<Concept[]> {
    const concepts = await this.prisma.concept.findMany({
      where: { goalId },
    });
    return concepts.map((concept) => concept);
  }

  async getConceptWithGoalByConceptId(id: string): Promise<ConceptWithGoal> {
    const concept = await this.prisma.concept.findUniqueOrThrow({
      where: { id },
      include: {
        goal: true,
      },
    });
    return concept;
  }

  async createConcepts(concepts: Concept[]): Promise<void> {
    await this.prisma.concept.createMany({ data: concepts });
  }

  async createQuiz(
    questions: Pick<
      Question,
      "question" | "options" | "correctAnswer" | "difficulty" | "explanation"
    >[],
    conceptId: string,
  ): Promise<Quiz> {
    const quiz = await this.prisma.quiz.create({
      data: {
        conceptId,
        questions: {
          create: questions,
        },
      },
      include: {
        questions: true,
      },
    });
    return await this.prisma.quiz.findFirstOrThrow({
      where: { id: quiz.id },
      include: { questions: true },
    });
  }

  async getQuestionsById(id: string): Promise<Question | null> {
    const question = await this.prisma.question.findUniqueOrThrow({
      where: { id },
      include: {
        quiz: true, // Include the quiz to get the full context
      },
    });

    // Transform the database question into our domain Question type
    const domainQuestion = {
      id: question.id,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      difficulty: question.difficulty,
      explanation: question.explanation,
      quizId: question.quizId,
    };

    return domainQuestion;
  }

  async getQuestionResponsesByUserIdConceptId(
    userId: string,
    conceptId: string,
  ): Promise<QuestionResponseWithQuestion[]> {
    const questionResponses = await this.prisma.userQuestionResponse.findMany({
      where: {
        user: {
          id: userId,
        },
        conceptId,
      },
      include: {
        question: true,
      },
    });
    return questionResponses.map((response) => ({
      ...response,
      question: response.question,
    }));
  }

  async createQuestionResponse(response: UserQuestionResponse) {
    return this.prisma.userQuestionResponse.create({
      data: {
        userId: response.userId,
        questionId: response.questionId,
        answer: response.answer,
        isCorrect: response.isCorrect,
        quizId: response.quizId,
        conceptId: response.conceptId,
      },
    });
  }

  async updateConceptMasteryLevel(
    conceptId: string,
    masteryLevel: MasteryLevel,
  ) {
    return this.prisma.concept.update({
      where: { id: conceptId },
      data: { masteryLevel },
    });
  }
}
