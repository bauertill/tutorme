import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SidebarText } from "@/components/ui/sidebar";
import { Trans } from "@/i18n";
import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { CameraIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadToBlob } from "./uploadToBlob";

export function UploadProblems({ trigger }: { trigger: "button" | "card" }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [isCancelled, setIsCancelled] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addAssignment = useStore.use.addAssignment();
  const setUsageLimitReached = useStore.use.setUsageLimitReached();
  const { mutate: deleteAssignment } =
    api.assignment.deleteAssignment.useMutation();
  const { mutate: createAssignmentFromUpload } =
    api.assignment.createFromUpload.useMutation({
      onSuccess: (assignment) => {
        if (isCancelled) {
          deleteAssignment(assignment.id);
          return;
        }
        setUploadState("success");
        toast.success("Problems uploaded successfully!");
        setOpen(false);
        addAssignment(assignment);
      },
      onError: (error) => {
        setUploadState("error");
        if (error.message === "Free tier limit reached") {
          setUsageLimitReached(true);
        } else {
          toast.error(error.message);
        }
      },
    });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    setUploadState("idle");
    setOpen(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      await handleUpload(file);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadState("error");
    }
  };

  const handleUpload = async (file: File) => {
    setUploadState("uploading");
    try {
      const url = await uploadToBlob(file);
      createAssignmentFromUpload(url);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadState("error");
    }
  };

  const resetForm = () => {
    setPreview(null);
    setUploadState("idle");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancelUpload = () => {
    setOpen(false);
    setIsCancelled(true);
    toast.info("Upload cancelled");
  };

  const handleButtonClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  return (
    <>
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {trigger === "button" && (
        <Button
          variant="ghost"
          onClick={handleButtonClick}
          type="button"
          className="flex h-9 w-full items-center justify-start px-2 transition-all duration-200 ease-linear"
        >
          <CameraIcon className="h-5 w-5 flex-shrink-0" />
          <SidebarText className="ml-2 overflow-hidden">
            <Trans i18nKey="upload_assignment" />
          </SidebarText>
        </Button>
      )}
      {trigger === "card" && (
        <Card
          className="cursor-pointer bg-primary/60 transition-colors hover:bg-accent/50"
          onClick={handleButtonClick}
        >
          <CardContent className="t flex items-center gap-4 p-6">
            <CameraIcon className="h-6 w-6 flex-shrink-0" />
            <p className="text-sm">
              <Trans i18nKey="upload_problems_card_description" />
            </p>
          </CardContent>
        </Card>
      )}
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) resetForm();
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Uploading Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              {preview && (
                <div className="mt-4 overflow-hidden rounded-md border">
                  <Image
                    src={preview}
                    alt="Preview"
                    className="h-auto max-h-64 max-w-full object-contain"
                    width={400}
                    height={400}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-center">
              {uploadState === "uploading" && (
                <Button onClick={handleCancelUpload} variant="ghost">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
