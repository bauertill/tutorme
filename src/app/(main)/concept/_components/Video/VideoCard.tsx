"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import Image from "next/image";
import { useState } from "react";

function formatDuration(seconds: number): string {
  if (!seconds) return "";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

interface VideoControllerProps {
  conceptId: string;
  onVideoComplete: () => void;
}
export function VideoController({
  conceptId,
  onVideoComplete,
}: VideoControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  // @TODO store videos in DB
  // @TODO cache where in the video the user was

  // @TODO add a "watched" flag to the video upon completion
  // @TODO Store user preferences for videos -> Ask for feedback
  // whether he likes the video or not
  // Use this in the search video prompt

  const { data: video, isLoading } =
    api.learning.searchEducationalVideo.useQuery({
      conceptId,
    });
  if (isLoading) {
    return <VideoCardSkeleton />;
  }
  if (!video) {
    console.error("No video found");
    return null;
  }

  const onComplete = () => {
    setIsOpen(false);
    onVideoComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="mb-4 overflow-hidden transition-shadow hover:cursor-pointer hover:bg-accent-hover hover:shadow-md">
          <div className="flex flex-col sm:flex-row">
            <div className="relative h-48 sm:h-auto sm:w-1/3">
              {video.thumbnailUrl && (
                <div className="relative h-full w-full">
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                  {video.duration > 0 && (
                    <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1 py-0.5 text-xs text-white">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-2">{video.title}</CardTitle>
                <CardDescription className="text-sm">
                  {video.channelTitle}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm">{video.description}</p>
              </CardContent>
              <CardFooter className="mt-auto">
                <div className="ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    Watch
                  </Button>
                </div>
              </CardFooter>
            </div>
          </div>
        </Card>
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
          <Button variant="outline" size="sm" onClick={onComplete}>
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function VideoCardSkeleton() {
  return (
    <Card className="mb-4 overflow-hidden transition-shadow hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-48 sm:h-auto sm:w-1/3">
          <div className="relative h-full w-full">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <CardHeader>
            <Skeleton className="h-6 w-full max-w-[250px]" />
            <Skeleton className="mt-2 h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
          <CardFooter className="mt-auto">
            <Skeleton className="ml-auto h-9 w-24" />
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
