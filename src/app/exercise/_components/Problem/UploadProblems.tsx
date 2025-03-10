import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CameraIcon } from "lucide-react";
import React, { useRef, useState } from "react";

interface UploadState {
  isUploading: boolean;
  error: string | null;
  success: boolean;
}

interface BlobResponse {
  success: boolean;
  url: string;
  pathname: string;
  size: number;
}

export function UploadProblems() {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    error: null,
    success: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadState({
      isUploading: false,
      error: null,
      success: false,
    });

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
      setUploadState({
        isUploading: false,
        error: "Please select an image to upload",
        success: false,
      });
      return;
    }

    setUploadState({
      isUploading: true,
      error: null,
      success: false,
    });

    try {
      // Upload image to Vercel Blob
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const result = (await response.json()) as BlobResponse;

      if (!result.success) {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      setUploadState({
        isUploading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload the image. Please try again.",
        success: false,
      });
      console.error("Upload error:", error);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraInput = () => {
    cameraInputRef.current?.click();
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadState({
      isUploading: false,
      error: null,
      success: false,
    });
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
        <Button variant="outline" size="icon" className="rounded-full">
          <CameraIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Math Problem</DialogTitle>
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
              <Button onClick={triggerFileInput} variant="outline">
                Select Image
              </Button>
              <Button onClick={triggerCameraInput} variant="outline">
                Take Photo
              </Button>
            </div>

            {selectedFile && (
              <div className="mt-4 text-sm">Selected: {selectedFile.name}</div>
            )}

            {preview && (
              <div className="mt-4 overflow-hidden rounded-md border">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-auto max-h-64 max-w-full object-contain"
                />
              </div>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploadState.isUploading}
            className="w-full"
          >
            {uploadState.isUploading ? "Uploading..." : "Upload Problem"}
          </Button>

          {/* @TODO use Sonner here instead */}
          {uploadState.error && (
            <Alert variant="destructive">
              <AlertDescription>{uploadState.error}</AlertDescription>
            </Alert>
          )}
          {/* @TODO use Sonner here instead */}
          {uploadState.success && (
            <Alert>
              <AlertDescription>
                Problem uploaded successfully!
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
