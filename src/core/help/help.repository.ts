import { type PrismaClient } from "@prisma/client";
import { type Message } from "./help.types";

export class HelpRepository {
  constructor(private db: PrismaClient) {}

  async getMessages(studentSolutionId: string): Promise<Message[]> {
    const results = await this.db.message.findMany({
      where: { studentSolutionId },
    });
    return results;
  }

  async addMessage(message: Message): Promise<Message> {
    const result = await this.db.message.create({
      data: {
        ...message,
      },
    });
    return result;
  }
}
