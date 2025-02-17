import { User } from "@prisma/client";
import { DBAdapter } from "../adapters/dbAdapter";

export async function getUserById(id: number, dbAdapter: DBAdapter): Promise<User | null> {
  return await dbAdapter.getUserById(id);
}

export async function createUser(email: string, name: string, dbAdapter: DBAdapter): Promise<User> {
  return await dbAdapter.createUser(email, name);
}
