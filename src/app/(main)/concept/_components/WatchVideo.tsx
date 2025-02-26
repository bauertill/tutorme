"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EducationalVideo } from "@/core/learning/types";
import { ExternalLink } from "lucide-react";
import { useState } from "react";

export function WatchVideo({ video }: { video: EducationalVideo }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          Watch
        </Button>
      </DialogTrigger>
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
          <Button asChild variant="outline" size="sm">
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              Open in YouTube <ExternalLink size={14} />
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
