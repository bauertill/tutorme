"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { EducationalVideo } from "@/core/video/types";

export function WatchVideo({
  video,
  isOpen,
  setIsOpen,
  onComplete,
}: {
  video: EducationalVideo;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onComplete: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-[800px]">
        <DialogHeader className="p-4">
          <DialogTitle className="line-clamp-1">{video.title}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute left-0 top-0 h-full w-full"
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="text-sm text-muted-foreground">
            {video.channelTitle}
          </div>
          <Button variant="outline" size="sm" onClick={onComplete}>
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
