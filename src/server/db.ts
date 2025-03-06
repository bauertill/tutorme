import { env } from "@/env";
import { PrismaClient } from "@prisma/client";

type LogLevel = "info" | "query" | "warn" | "error";
type LogDefinition = {
  level: LogLevel;
  emit: "stdout" | "event";
};

const createPrismaClient = () => {
  const queryEventLog = {
    emit: "event",
    level: "query",
  } as const;
  const logConfig: [typeof queryEventLog, ...LogDefinition[]] = [queryEventLog];

  switch (env.LOG_LEVEL) {
    case "query":
      logConfig.push({
        emit: "stdout",
        level: "query",
      });
    case "info":
      logConfig.push({
        emit: "stdout",
        level: "info",
      });
    case "warn":
      logConfig.push({
        emit: "stdout",
        level: "warn",
      });
    case "error":
      logConfig.push({
        emit: "stdout",
        level: "error",
      });
  }

  const prisma = new PrismaClient({
    log: logConfig,
  });

  prisma.$on("query", (e) => {
    if (e.duration > env.LONG_QUERY_TIME) {
      console.log(`Long Query (${e.duration}ms): ${e.query}`);
    }
  });

  return prisma;
};
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
