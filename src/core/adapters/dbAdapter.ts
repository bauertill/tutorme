import { PrismaClient } from "@prisma/client";
import { Concept, ConceptWithGoal, Goal } from "../goal/types";
import { User } from "../user/types";
import { Question, Quiz, QuestionResponse } from "../concept/types";

export class DBAdapter {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAllUsers(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async getUserById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return User.parse(user);
  }

  async createUser(email: string, name: string): Promise<User> {
    const data = { name, email };
    return await this.prisma.user.create({ data });
  }

  async getGoalById(id: string): Promise<Goal> {
    const goal = await this.prisma.goal.findFirst({
      where: { id },
    });
    return Goal.parse(goal);
  }

  async createGoal(userId: number, goalText: string): Promise<Goal> {
    const data = { userId, goal: goalText };
    return await this.prisma.goal.create({ data });
  }

  async getUserGoals(userId: number): Promise<Goal[]> {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
    });
    return goals.map(goal => Goal.parse(goal));
  }

  async getConceptsByGoalId(goalId: string): Promise<Concept[]> {
    const concepts = await this.prisma.concept.findMany({
      where: { goalId },
    });
    return concepts.map(concept => Concept.parse(concept));
  }

  async getConceptWithGoalByConceptId(id: string): Promise<ConceptWithGoal> {
    const concept = await this.prisma.concept.findUnique({
      where: { id },
      include: {
        goal: true,
      },
    });
    return ConceptWithGoal.parse(concept);
  }

  async createConcepts(concepts: Concept[]): Promise<void> {
    await this.prisma.concept.createMany({ data: concepts });
  }

  async createQuiz(questions: Question[], conceptId: string): Promise<Quiz> {
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
    return {
      id: quiz.id,
      conceptId: quiz.conceptId,
      questions,
    };
  }

  async getQuestionsById(id: string): Promise<Question | null> {
    try {
      console.log("Fetching question with ID:", id);
      const question = await this.prisma.question.findUnique({
        where: { id },
        include: {
          quiz: true, // Include the quiz to get the full context
        },
      });

      console.log("Found question:", question);

      if (!question) {
        console.log("No question found with ID:", id);
        return null;
      }

      // Transform the database question into our domain Question type
      const domainQuestion = {
        id: question.id,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        difficulty: question.difficulty as
          | "beginner"
          | "intermediate"
          | "advanced"
          | "expert",
        explanation: question.explanation,
      };

      return Question.parse(domainQuestion);
    } catch (error) {
      console.error("Error fetching question:", error);
      throw error;
    }
  }

  async getQuestionResponsesByUserIdConceptId(
    userId: number,
    conceptId: string
  ): Promise<Question[]> {
    const questions = await this.prisma.userQuestionResponse.findMany({
      where: { userId, conceptId },
    });
    return questions.map(question => Question.parse(question));
  }

  async createQuestionResponse(response: QuestionResponse) {
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

  async updateConceptMasteryLevel(conceptId: string, masteryLevel: string) {
    return this.prisma.concept.update({
      where: { id: conceptId },
      data: { masteryLevel },
    });
  }
}
