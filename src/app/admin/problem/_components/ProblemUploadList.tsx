import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import ProblemUploadView from "./ProblemUploadView";

export default function ProblemUploadList() {
  const {
    data: uploadFiles,
    isPending,
    isError,
  } = api.problemUpload.getUploadFiles.useQuery();

  if (isError) {
    return <div>Error loading upload files</div>;
  }

  return (
    <div className="flex flex-wrap gap-4">
      {isPending ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Card className="mt-4" key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-4 w-32" />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Skeleton className="h-8 w-16" />
            </CardFooter>
          </Card>
        ))
      ) : uploadFiles.length > 0 ? (
        uploadFiles.map((file) => (
          <ProblemUploadView key={file.id} problemUpload={file} />
        ))
      ) : (
        <div>No files found.</div>
      )}
    </div>
  );
}
