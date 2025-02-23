import { DBAdapter } from "../adapters/dbAdapter";
import { User } from "../user/types";

export async function getUserByEmail(
  email: string,
  dbAdapter: DBAdapter,
): Promise<User | null> {
  return await dbAdapter.getUserByEmail(email);
}

export async function createUser(
  email: string,
  name: string,
  dbAdapter: DBAdapter,
): Promise<User> {
  return await dbAdapter.createUser(email, name);
}
