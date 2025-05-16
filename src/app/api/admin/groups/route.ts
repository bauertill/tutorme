import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, description, userIds } = await request.json();

    if (!name || !userIds || !Array.isArray(userIds)) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    const group = await prisma.group.create({
      data: {
        name,
        description,
        users: {
          connect: userIds.map((id: string) => ({ id })),
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

    return NextResponse.json(group);
  } catch (error) {
    console.error("Error creating group:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  try {
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

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
