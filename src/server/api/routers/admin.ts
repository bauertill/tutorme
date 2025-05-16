import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const adminRouter = createTRPCRouter({
  getUsers: protectedAdminProcedure.query(async () => {
    const users = await prisma.user.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });
    return users;
  }),

  getGroups: protectedAdminProcedure.query(async () => {
    const groups = await prisma.group.findMany({
      include: {
        users: {
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
        userIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      const group = await prisma.group.create({
        data: {
          name: input.name,
          description: input.description,
          users: {
            connect: input.userIds.map((id) => ({ id })),
          },
        },
        include: {
          users: true,
        },
      });
      return group;
    }),

  deleteGroup: protectedAdminProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ input }) => {
      const group = await prisma.group.findUnique({
        where: { id: input.groupId },
      });

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      return prisma.group.delete({
        where: { id: input.groupId },
      });
    }),

  removeUserFromGroup: protectedAdminProcedure
    .input(
      z.object({
        groupId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const group = await prisma.group.findUnique({
        where: { id: input.groupId },
        include: { users: true },
      });

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      return prisma.group.update({
        where: { id: input.groupId },
        data: {
          users: {
            disconnect: { id: input.userId },
          },
        },
        include: {
          users: true,
        },
      });
    }),

  addUserToGroup: protectedAdminProcedure
    .input(
      z.object({
        groupId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const group = await prisma.group.findUnique({
        where: { id: input.groupId },
      });

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      return prisma.group.update({
        where: { id: input.groupId },
        data: {
          users: {
            connect: { id: input.userId },
          },
        },
        include: {
          users: true,
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
      const group = await prisma.group.findUnique({
        where: { id: input.groupId },
      });

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      return prisma.group.update({
        where: { id: input.groupId },
        data: {
          name: input.name,
          description: input.description,
        },
        include: {
          users: true,
        },
      });
    }),
});
