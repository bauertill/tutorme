import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { EducationalVideo } from "@/core/learning/types";
import Image from "next/image";
import { WatchVideo } from "./WatchVideo";

function formatDuration(seconds: number): string {
  if (!seconds) return "";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

interface VideoCardProps {
  video?: EducationalVideo;
  isLoading?: boolean;
}
export function VideoCard({ video, isLoading }: VideoCardProps) {
  if (isLoading) {
    return <VideoCardSkeleton />;
  }
  if (!video) {
    return <p> ERROR: No video found</p>;
  }

  return (
    <Card className="mb-4 overflow-hidden transition-shadow hover:shadow-md">
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
              <WatchVideo video={video} />
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
