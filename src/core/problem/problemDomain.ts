import { createId } from "@paralleldrive/cuid2";
import { type StudentSolution as PrismaStudentSolution } from "@prisma/client";
import { sortBy } from "lodash-es";
import type { DBAdapter } from "../adapters/dbAdapter";
import { Draft, parseCsv } from "../utils";
import {
  Problem,
  type ProblemUpload,
  ProblemUploadStatus,
  StudentSolution,
} from "./types";

const UPLOAD_BATCH_SIZE = 128;

class CancelUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CancelUploadError";
  }
}

export async function createProblems(
  uploadId: string,
  problems: Draft<Problem>[],
  dbAdapter: DBAdapter,
) {
  const searchStringFn = (problem: Draft<Problem>) => `${problem.problem}`;

  for (let i = 0; i < problems.length; i += UPLOAD_BATCH_SIZE) {
    // check if the upload is cancelled
    const uploadStatus = await dbAdapter.getProblemUploadStatusById(uploadId);
    if (uploadStatus === ProblemUploadStatus.Enum.CANCELLED) {
      throw new CancelUploadError("Upload cancelled");
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
  data: { fileName: string; csv: string; fileSize: number },
  dbAdapter: DBAdapter,
): Promise<ProblemUpload> {
  const problems = await parseCsv(data.csv, Draft(Problem.strip()));
  const nRecords = problems.length;
  const upload = await dbAdapter.createProblemUpload({
    fileName: data.fileName,
    fileSize: data.fileSize,
    nRecords,
    status: ProblemUploadStatus.Enum.PENDING,
  });
  try {
    await createProblems(upload.id, problems, dbAdapter);
    await dbAdapter.updateProblemUploadStatus(upload.id, {
      status: ProblemUploadStatus.Enum.SUCCESS,
    });
  } catch (error) {
    if (error instanceof CancelUploadError) {
      await dbAdapter.updateProblemUploadStatus(upload.id, {
        status: ProblemUploadStatus.Enum.CANCELLED,
      });
    } else {
      await dbAdapter.updateProblemUploadStatus(upload.id, {
        status: ProblemUploadStatus.Enum.ERROR,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  return await dbAdapter.getProblemUploadById(upload.id);
}

export async function queryProblems(
  query: string,
  nProblems: number,
  dbAdapter: DBAdapter,
  problemIdBlackList: string[] = [],
) {
  return dbAdapter.queryProblems(query, nProblems, problemIdBlackList);
}

export async function cancelProblemUpload(
  uploadId: string,
  dbAdapter: DBAdapter,
) {
  await dbAdapter.updateProblemUploadStatus(uploadId, {
    status: ProblemUploadStatus.Enum.CANCELLED,
  });
}

export async function getProblemUploadFiles(dbAdapter: DBAdapter) {
  const results = await dbAdapter.getProblemUploadFiles();
  return sortBy(results, (result) => result.createdAt).reverse();
}

export async function deleteProblemUpload(
  uploadId: string,
  dbAdapter: DBAdapter,
) {
  await dbAdapter.deleteProblemUpload(uploadId);
}

export function parseStudentSolutionWithDefaults(
  studentSolution: PrismaStudentSolution | undefined,
  problemId: string,
  studentAssignmentId: string,
): StudentSolution {
  if (!studentSolution) {
    return {
      id: createId(),
      status: "INITIAL",
      canvas: { paths: [] },
      evaluation: null,
      problemId,
      studentAssignmentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  return StudentSolution.parse(studentSolution);
}
