"use client";

import { api } from "@/trpc/react";
import assert from "assert";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export default function ProblemFileUpload() {
  const utils = api.useUtils();
  const { mutate: uploadProblems, isPending } = api.problem.upload.useMutation({
    onMutate: () => {
      setRefetchInterval(1000);
    },
    onSuccess: (result) => {
      if (result.status === "SUCCESS") {
        toast.success("Problems uploaded successfully");
      } else if (result.status === "CANCELLED") {
        toast.info("Upload cancelled");
      } else {
        toast.error("Upload failed", {
          description: result.error,
        });
      }
    },
    onError: (error) => {
      toast.error("Upload failed", {
        description: error.message,
      });
    },
    onSettled: () => {
      setRefetchInterval(false);
      void utils.problem.getUploadFiles.invalidate();
    },
  });

  const [refetchInterval, setRefetchInterval] = useState<number | false>(false);
  api.problem.getUploadFiles.useQuery(undefined, { refetchInterval });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Only accept the first file
      if (acceptedFiles.length > 0) {
        const fileToUpload = acceptedFiles[0];
        assert(fileToUpload, "No file uploaded");

        // Check file type
        if (fileToUpload.type !== "text/csv") {
          toast.error("Invalid file type", {
            description: "Please upload a CSV file",
          });
          return;
        }

        const base64EncodedContents = Buffer.from(
          await fileToUpload.arrayBuffer(),
        ).toString("base64");
        uploadProblems({
          fileName: fileToUpload.name,
          fileSize: fileToUpload.size,
          base64EncodedContents,
        });
      }
    },
    [uploadProblems],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => void onDrop(acceptedFiles),
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    disabled: isPending,
  });

  return (
    <>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isPending
            ? "border-gray-300"
            : isDragActive
              ? "border-primary bg-primary/10"
              : "border-gray-300 hover:border-primary"
        }`}
      >
        <input {...getInputProps()} />
        {isPending ? (
          <div>
            <p className="text-lg font-medium">Processing...</p>
          </div>
        ) : (
          <div>
            <p className="text-lg">
              {isDragActive
                ? "Drop the CSV file here"
                : "Drag & drop a CSV file here, or click to select"}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Only CSV files are accepted
            </p>
          </div>
        )}
      </div>
    </>
  );
}
