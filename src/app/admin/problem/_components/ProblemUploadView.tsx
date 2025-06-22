import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ProblemUpload } from "@/core/problemUpload/problemUpload.types";
import { api } from "@/trpc/react";
import { formatDistance } from "date-fns";
import { Loader2 } from "lucide-react";
import prettyBytes from "pretty-bytes";
import { toast } from "sonner";
export default function ProblemUploadView({
  problemUpload,
}: {
  problemUpload: ProblemUpload;
}) {
  const utils = api.useUtils();
  const { mutate: cancelUpload, isPending: isCancelling } =
    api.problemUpload.cancelUpload.useMutation({
      onSuccess: () => {
        toast.success("Upload cancelled");
      },
      onSettled: () => {
        void utils.problemUpload.getUploadFiles.invalidate();
      },
    });
  const { mutate: deleteUpload, isPending: isDeleting } =
    api.problemUpload.deleteUpload.useMutation({
      onSuccess: () => {
        toast.success("Upload deleted");
      },
      onSettled: () => {
        void utils.problemUpload.getUploadFiles.invalidate();
      },
    });
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base">{problemUpload.fileName}</CardTitle>
          <Badge
            variant={
              problemUpload.status === "SUCCESS"
                ? "outline"
                : problemUpload.status === "ERROR"
                  ? "destructive"
                  : problemUpload.status === "PENDING"
                    ? "default"
                    : "secondary"
            }
            className="flex items-center gap-2"
          >
            {problemUpload.status === "PENDING" && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {problemUpload.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {formatDistance(problemUpload.createdAt, new Date(), {
            addSuffix: true,
          })}
        </p>
        <div className="mt-2 flex flex-col gap-1 text-sm">
          <p>Records: {problemUpload.nRecords.toLocaleString()}</p>
          <p>File size: {prettyBytes(problemUpload.fileSize)}</p>
        </div>
        {problemUpload.error && (
          <p className="mt-2 text-sm text-destructive">{problemUpload.error}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        {problemUpload.status === "PENDING" ? (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => cancelUpload({ uploadId: problemUpload.id })}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Cancel"
            )}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (confirm("Are you sure you want to delete this upload?")) {
                deleteUpload({ uploadId: problemUpload.id });
              }
            }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
