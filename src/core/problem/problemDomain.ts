import type { DBAdapter } from "../adapters/dbAdapter";
import { Draft, parseCsv } from "../utils";
import { Problem, ProblemUploadStatus } from "./types";

const UPLOAD_BATCH_SIZE = 128;

export async function createProblems(
  uploadId: string,
  problems: Draft<Problem>[],
  dbAdapter: DBAdapter,
) {
  const searchStringFn = (problem: Draft<Problem>) =>
    `Type: ${problem.type};

Problem: ${problem.problem};

Solution: ${problem.solution};
`;

  for (let i = 0; i < problems.length; i += UPLOAD_BATCH_SIZE) {
    // check if the upload is cancelled
    const uploadStatus = await dbAdapter.getProblemUploadStatusById(uploadId);
    if (uploadStatus === ProblemUploadStatus.Enum.CANCELLED) {
      console.log("Upload cancelled");
      return;
    }
    console.log(
      `Processing ${UPLOAD_BATCH_SIZE} problems (batch ${
        i / UPLOAD_BATCH_SIZE + 1
      } of ${Math.ceil(problems.length / UPLOAD_BATCH_SIZE)})`,
    );
    const batch = problems.slice(i, i + UPLOAD_BATCH_SIZE);
    await dbAdapter.createProblems(uploadId, batch, searchStringFn);
  }
}

export async function createProblemsFromCsv(
  fileName: string,
  csv: string,
  dbAdapter: DBAdapter,
) {
  const problems = await parseCsv(csv, Draft(Problem.strip()));
  const upload = await dbAdapter.createProblemUpload({
    fileName,
    status: ProblemUploadStatus.Enum.PENDING,
  });
  try {
    await createProblems(upload.id, problems, dbAdapter);
  } catch (error) {
    await dbAdapter.updateProblemUploadStatus(upload.id, {
      status: ProblemUploadStatus.Enum.ERROR,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
  await dbAdapter.updateProblemUploadStatus(upload.id, {
    status: ProblemUploadStatus.Enum.SUCCESS,
  });
}

export async function queryProblems(query: string, dbAdapter: DBAdapter) {
  return dbAdapter.queryProblems(query, 25);
}
