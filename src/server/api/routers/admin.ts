import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const adminRouter = createTRPCRouter({
  getStudents: protectedAdminProcedure.query(async () => {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            subscription: {
              select: {
                status: true,
              },
            },
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return students;
  }),

  getGroups: protectedAdminProcedure.query(async () => {
    const groups = await prisma.studentGroup.findMany({
      include: {
        students: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
                subscription: {
                  select: {
                    status: true,
                  },
                },
              },
            },
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return groups;
  }),

  createGroup: protectedAdminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        studentIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      const group = await prisma.studentGroup.create({
        data: {
          name: input.name,
          description: input.description,
          students: {
            connect: input.studentIds.map((id) => ({ id })),
          },
        },
        include: {
          students: true,
        },
      });
      return group;
    }),

  deleteGroup: protectedAdminProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ input }) => {
      const group = await prisma.studentGroup.findUnique({
        where: { id: input.groupId },
      });

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      return prisma.studentGroup.delete({
        where: { id: input.groupId },
      });
    }),

  removeStudentFromGroup: protectedAdminProcedure
    .input(
      z.object({
        groupId: z.string(),
        studentId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const group = await prisma.studentGroup.findUnique({
        where: { id: input.groupId },
        include: { students: true },
      });

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      return prisma.studentGroup.update({
        where: { id: input.groupId },
        data: {
          students: {
            disconnect: { id: input.studentId },
          },
        },
        include: {
          students: true,
        },
      });
    }),

  addStudentToGroup: protectedAdminProcedure
    .input(
      z.object({
        groupId: z.string(),
        studentId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const group = await prisma.studentGroup.findUnique({
        where: { id: input.groupId },
      });

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      return prisma.studentGroup.update({
        where: { id: input.groupId },
        data: {
          students: {
            connect: { id: input.studentId },
          },
        },
        include: {
          students: true,
        },
      });
    }),

  editGroup: protectedAdminProcedure
    .input(
      z.object({
        groupId: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const group = await prisma.studentGroup.findUnique({
        where: { id: input.groupId },
      });

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      return prisma.studentGroup.update({
        where: { id: input.groupId },
        data: {
          name: input.name,
          description: input.description,
        },
        include: {
          students: true,
        },
      });
    }),
});
