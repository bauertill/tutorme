import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import Image from "next/image";
import { useState } from "react";
import { WatchVideo } from "./WatchVideo";

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

  return (
    <Card
      className="mb-4 overflow-hidden transition-shadow hover:cursor-pointer hover:bg-accent-hover hover:shadow-md"
      onClick={() => setIsOpen(true)}
    >
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
              <WatchVideo
                video={video}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                onComplete={() => {
                  setIsOpen(false);
                  onVideoComplete();
                }}
              />
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
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
