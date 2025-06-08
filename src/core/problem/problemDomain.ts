import type { DBAdapter } from "../adapters/dbAdapter";

export async function queryProblems(
  query: string,
  nProblems: number,
  dbAdapter: DBAdapter,
  problemIdBlackList: string[] = [],
) {
  return dbAdapter.queryProblems(query, nProblems, problemIdBlackList);
}
