"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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

interface ActivityModalProps {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivityModal({
  activity,
  open,
  onOpenChange,
}: ActivityModalProps) {
  if (!activity) return null;

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
    return date.toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {getActivityIcon(activity.type)}
              <div>
                <DialogTitle className="text-lg">{activity.title}</DialogTitle>
                <DialogDescription className="mt-1 flex items-center space-x-2">
                  <Calendar className="h-3 w-3" />
                  <span>{formatTimestamp(activity.timestamp)}</span>
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(activity.status)}
              <Badge variant={getStatusBadgeVariant(activity.status)}>
                {activity.status}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {activity.description}
          </p>

          <Separator />

          {/* Activity Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Details</h4>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(activity.details).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <dt className="text-sm font-medium capitalize">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </dt>
                  <dd className="text-sm text-muted-foreground">
                    {Array.isArray(value) ? (
                      <div className="flex flex-wrap gap-1">
                        {value.map((item) => (
                          <Badge
                            key={item}
                            variant="outline"
                            className="text-xs"
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    ) : typeof value === "string" && value.includes("@") ? (
                      <a
                        href={`mailto:${value}`}
                        className="text-blue-600 hover:underline"
                      >
                        {value}
                      </a>
                    ) : typeof value === "string" && value.startsWith("+") ? (
                      <a
                        href={`tel:${value}`}
                        className="text-blue-600 hover:underline"
                      >
                        {value}
                      </a>
                    ) : (
                      String(value)
                    )}
                  </dd>
                </div>
              ))}
            </div>
          </div>

          {/* Related Entities */}
          {Object.keys(activity.relatedEntities).length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Related</h4>
                <div className="flex flex-wrap gap-3">
                  {activity.relatedEntities.students && (
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4" />
                      <span className="text-muted-foreground">
                        {activity.relatedEntities.students.length} student(s)
                      </span>
                    </div>
                  )}
                  {activity.relatedEntities.groups && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="h-4 w-4" />
                      <span className="text-muted-foreground">
                        {activity.relatedEntities.groups.length} group(s)
                      </span>
                    </div>
                  )}
                  {activity.relatedEntities.assignments && (
                    <div className="flex items-center space-x-2 text-sm">
                      <ClipboardList className="h-4 w-4" />
                      <span className="text-muted-foreground">
                        {activity.relatedEntities.assignments.length}{" "}
                        assignment(s)
                      </span>
                    </div>
                  )}
                  {activity.relatedEntities.books && (
                    <div className="flex items-center space-x-2 text-sm">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-muted-foreground">
                        {activity.relatedEntities.books.length} book(s)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Action Button */}
          <Separator />
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
