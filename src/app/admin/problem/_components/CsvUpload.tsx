"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import assert from "assert";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export default function CsvUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { mutate: uploadProblems } = api.problem.upload.useMutation({
    onSuccess: () => {
      toast.success("Problems uploaded successfully");
    },
    onError: (error) => {
      toast.error("Upload failed", {
        description: error.message,
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Only accept the first file
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      assert(file, "No file uploaded");
      if (file.type !== "text/csv") {
        toast.error("Invalid file type", {
          description: "Please upload a CSV file",
        });
        return;
      }
      setUploadedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    try {
      const file = uploadedFile;
      assert(file, "No file uploaded");
      const base64EncodedContents = Buffer.from(
        await file.arrayBuffer(),
      ).toString("base64");
      uploadProblems({ base64EncodedContents });

      setUploadedFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-gray-300 hover:border-primary"
        }`}
      >
        <input {...getInputProps()} />
        {uploadedFile ? (
          <div>
            <p className="text-lg font-medium">{uploadedFile.name}</p>
            <p className="text-sm text-gray-500">
              {(uploadedFile.size / 1024).toFixed(2)} KB
            </p>
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

      {uploadedFile && (
        <div className="mt-4 flex justify-end">
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload Problems"}
          </Button>
        </div>
      )}
    </>
  );
}
