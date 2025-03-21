import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { CameraIcon, ImageIcon } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadToBlob } from "./uploadToBlob";

export function UploadProblems(props: React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const addAssignment = useStore.use.addAssignment();
  const setUsageLimitReached = useStore.use.setUsageLimitReached();
  const { mutate: createAssignmentFromUpload } =
    api.assignment.createFromUpload.useMutation({
      onSuccess: (assignment) => {
        setUploadState("success");
        toast.success("Problems uploaded successfully!");
        setOpen(false);
        addAssignment(assignment);
        setSelectedFile(null);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setUploadState("idle");

    // Create preview for the selected image
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadState("error");
      return;
    }
    setUploadState("uploading");

    try {
      const url = await uploadToBlob(selectedFile);
      createAssignmentFromUpload(url);
    } catch {
      setUploadState("error");
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadState("idle");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" {...props}>
          <CameraIcon className="h-5 w-5" />
          Upload Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Math Problem</DialogTitle>
          <DialogDescription>
            Upload a file with math problems to the database.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            {/* File selection input (gallery) */}
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Camera input (with capture) */}
            <Input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex space-x-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                disabled={uploadState === "uploading"}
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => cameraInputRef.current?.click()}
                variant="outline"
                disabled={uploadState === "uploading"}
              >
                <CameraIcon className="h-5 w-5" />
              </Button>
            </div>

            {selectedFile && (
              <div className="mt-4 text-sm">Selected: {selectedFile.name}</div>
            )}

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

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploadState === "uploading"}
            {...props}
          >
            {uploadState === "uploading" ? "Uploading..." : "Upload Problem"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
