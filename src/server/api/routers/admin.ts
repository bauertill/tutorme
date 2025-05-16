import prisma from "@/lib/prisma";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const adminRouter = createTRPCRouter({
  getUsers: publicProcedure.query(async () => {
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

  getGroups: publicProcedure.query(async () => {
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
    });
    return groups;
  }),

  createGroup: publicProcedure
    .input(
      z.object({
        name: z.string(),
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
      });
      return group;
    }),
});
