"use client";

import { ActivityModal } from "@/app/(main)/teacher/_components/activity-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getActivities } from "@/core/teacher/activities/activities.domain";
import type { Activity } from "@/core/teacher/activities/activities.types";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Info,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ActivityContent() {
  const activities = getActivities();

  const searchParams = useSearchParams();
  const activityId = searchParams.get("id");
  const activityType = searchParams.get("type");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );

  // Auto-open modal if activity ID is provided
  useEffect(() => {
    if (activityId) {
      const activity = activities.find((a) => a.id === activityId);
      if (activity) {
        setSelectedActivity(activity);
      }
    }
  }, [activityId, activities]);

  // Filter activities based on search params
  const filteredActivities = activities
    .filter((activity) => {
      if (activityType) {
        return activity.type === activityType;
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "assignment":
        return <ClipboardList className="h-5 w-5" />;
      case "student":
        return <User className="h-5 w-5" />;
      case "book":
        return <BookOpen className="h-5 w-5" />;
      case "system":
        return <Info className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: Activity["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: Activity["status"]) => {
    switch (status) {
      case "completed":
        return "default";
      case "failed":
        return "destructive";
      case "pending":
        return "secondary";
      case "info":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Activity Feed</h2>
            <p className="text-muted-foreground">
              {activityType
                ? `Showing all ${activityType} activities`
                : "Recent system activities and updates"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredActivities.map((activity) => (
          <Card
            key={activity.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => setSelectedActivity(activity)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <h3 className="font-medium">{activity.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatTimestamp(activity.timestamp)}</span>
                      </div>
                      {activity.relatedEntities.students && (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>
                            {activity.relatedEntities.students.length}{" "}
                            student(s)
                          </span>
                        </div>
                      )}
                      {activity.relatedEntities.groups && (
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>
                            {activity.relatedEntities.groups.length} group(s)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(activity.status)}
                  <Badge
                    variant={getStatusBadgeVariant(activity.status)}
                    className="text-xs"
                  >
                    {activity.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredActivities.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No activities found matching your criteria.
              </p>
              <Button variant="outline" className="mt-4 bg-transparent" asChild>
                <Link href="/activities">View All Activities</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <ActivityModal
        activity={selectedActivity}
        open={!!selectedActivity}
        onOpenChange={(open) => !open && setSelectedActivity(null)}
      />
    </div>
  );
}

export default function ActivitiesPage() {
  return (
    <Suspense fallback={<div>Loading activities...</div>}>
      <ActivityContent />
    </Suspense>
  );
}
