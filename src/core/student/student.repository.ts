import { type PrismaClient, type Student } from "@prisma/client";
import { type User } from "../user/user.types";

export class StudentRepository {
  constructor(private db: PrismaClient) {}

  async getUsersByStudentGroupId(studentGroupId: string): Promise<User[]> {
    return await this.db.user.findMany({
      where: { student: { studentGroup: { some: { id: studentGroupId } } } },
    });
  }

  async getStudentsByGroupId(groupId: string): Promise<Student[]> {
    return await this.db.student.findMany({
      where: { studentGroup: { some: { id: groupId } } },
    });
  }

  async getStudentIdByUserIdOrThrow(userId: string): Promise<string> {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });
    if (!user?.student) {
      throw new Error("User does not have a student");
    }
    return user.student.id;
  }
}
