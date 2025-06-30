"use client";

import { ActivityModal } from "@/app/(main)/teacher/_components/activity-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getActivities } from "@/core/teacher/activities/activities.domain";
import type { Activity } from "@/core/teacher/activities/activities.types";
import { getAssignments } from "@/core/teacher/assignments/assignments.domain";
import { getAvailableBooks } from "@/core/teacher/books/books.domain";
import { getStudentGroups } from "@/core/teacher/groups/groups.domain";
import {
  getGroupPerformance,
  getStudentResults,
} from "@/core/teacher/results/results.domain";
import { getStudents } from "@/core/teacher/students/students.domain";
import {
  Award,
  BookOpen,
  Calendar,
  ClipboardList,
  Clock,
  Info,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  const activeStudents = getStudents();
  const studentResults = getStudentResults();
  const activeGroups = getStudentGroups();
  const groupPerformance = getGroupPerformance();
  const availableBooks = getAvailableBooks();
  const activeAssignments = getAssignments();
  const recentActivities = getActivities().slice(0, 6);

  const totalStudentsInGroups = activeGroups.reduce(
    (sum, group) => sum + group.studentIds.length,
    0,
  );
  const totalAvailableCopies = availableBooks.reduce(
    (sum, book) => sum + book.availableCopies,
    0,
  );

  // Calculate results summary from static data
  const completedResults = studentResults.filter(
    (r) => r.status === "Completed",
  );
  const totalResults = studentResults.length;
  const completionRate = Math.round(
    (completedResults.length / totalResults) * 100,
  );

  const totalScore = completedResults.reduce(
    (sum, result) => sum + result.score,
    0,
  );
  const totalMaxScore = completedResults.reduce(
    (sum, result) => sum + result.maxScore,
    0,
  );
  const averageScore =
    totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

  const totalTimeSpent = completedResults.reduce(
    (sum, result) => sum + result.timeSpent,
    0,
  );
  const averageTimeSpent =
    completedResults.length > 0
      ? Math.round(totalTimeSpent / completedResults.length)
      : 0;

  const overdueCount = studentResults.filter(
    (r) => r.status === "Overdue",
  ).length;
  const inProgressCount = studentResults.filter(
    (r) => r.status === "In Progress",
  ).length;
  const topPerformers = completedResults.filter(
    (r) => r.score / r.maxScore >= 0.9,
  ).length;

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsActivityModalOpen(true);
  };

  const handleMetricClick = (metric: string) => {
    // Navigate to results page with specific filter
    const params = new URLSearchParams();
    switch (metric) {
      case "averageScore":
        params.set("sortBy", "score");
        params.set("sortOrder", "desc");
        break;
      case "completionRate":
        params.set("filter", "completed");
        break;
      case "timeSpent":
        params.set("sortBy", "timeSpent");
        params.set("sortOrder", "desc");
        break;
      case "topPerformers":
        params.set("filter", "topPerformers");
        break;
    }
    window.location.href = `/teacher/results?${params.toString()}`;
  };

  const handleStatusClick = (status: string) => {
    const params = new URLSearchParams();
    params.set("filter", status.toLowerCase().replace(" ", ""));
    window.location.href = `/teacher/results?${params.toString()}`;
  };

  const handleGroupClick = (groupName: string) => {
    const params = new URLSearchParams();
    params.set("group", groupName);
    window.location.href = `/teacher/results?${params.toString()}`;
  };

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "assignment":
        return <ClipboardList className="h-4 w-4" />;
      case "student":
        return <User className="h-4 w-4" />;
      case "book":
        return <BookOpen className="h-4 w-4" />;
      case "system":
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getStatusDot = (status: Activity["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      case "info":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
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
    return date.toLocaleDateString();
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingUp className="h-4 w-4 rotate-180 text-red-500" />;
      default:
        return <TrendingUp className="h-4 w-4 rotate-90 text-gray-500" />;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Today
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/teacher/books">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableBooks.length}</div>
              <p className="text-xs text-muted-foreground">
                {totalAvailableCopies} copies available
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/teacher/students">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeStudents.length}</div>
              <p className="text-xs text-muted-foreground">Active students</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/teacher/groups">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Groups
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeGroups.length}</div>
              <p className="text-xs text-muted-foreground">
                {totalStudentsInGroups} total students
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/teacher/assignments">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeAssignments.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Active & draft assignments
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>
              <Link
                href="/teacher/results"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View detailed results →
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Performance Metrics - All Clickable */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <button
                type="button"
                tabIndex={0}
                className="cursor-pointer rounded-lg border border-transparent p-3 text-center transition-colors hover:border-border hover:bg-muted/50"
                onClick={() => handleMetricClick("averageScore")}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleMetricClick("averageScore")
                }
              >
                <div className="text-2xl font-bold text-green-600">
                  {averageScore}%
                </div>
                <p className="text-xs text-muted-foreground">Average Score</p>
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-lg border border-transparent p-3 text-center transition-colors hover:border-border hover:bg-muted/50"
                onClick={() => handleMetricClick("completionRate")}
              >
                <div className="text-2xl font-bold text-blue-600">
                  {completionRate}%
                </div>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-lg border border-transparent p-3 text-center transition-colors hover:border-border hover:bg-muted/50"
                onClick={() => handleMetricClick("timeSpent")}
              >
                <div className="text-2xl font-bold text-purple-600">
                  {averageTimeSpent} min
                </div>
                <p className="text-xs text-muted-foreground">Avg. Time Spent</p>
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-lg border border-transparent p-3 text-center transition-colors hover:border-border hover:bg-muted/50"
                onClick={() => handleMetricClick("topPerformers")}
              >
                <div className="text-2xl font-bold text-orange-600">
                  {topPerformers}
                </div>
                <p className="text-xs text-muted-foreground">Top Performers</p>
              </button>
            </div>

            {/* Status Overview - All Clickable */}
            <div className="space-y-3">
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/50"
                onClick={() => handleStatusClick("completed")}
              >
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">
                    Completed Assignments
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{completedResults.length}</Badge>
                  <Progress
                    value={(completedResults.length / totalResults) * 100}
                    className="w-20"
                  />
                </div>
              </button>

              {inProgressCount > 0 && (
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/50"
                  onClick={() => handleStatusClick("in progress")}
                >
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">In Progress</span>
                  </div>
                  <Badge variant="secondary">{inProgressCount}</Badge>
                </button>
              )}

              {overdueCount > 0 && (
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/50"
                  onClick={() => handleStatusClick("overdue")}
                >
                  <div className="flex items-center space-x-2">
                    <ClipboardList className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Overdue</span>
                  </div>
                  <Badge variant="destructive">{overdueCount}</Badge>
                </button>
              )}
            </div>

            {/* Group Performance Summary - All Clickable */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Group Performance</h4>
              {groupPerformance.map((group) => (
                <button
                  key={group.groupName}
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-transparent bg-muted/30 p-2 transition-colors hover:border-border hover:bg-muted/50"
                  onClick={() => handleGroupClick(group.groupName)}
                >
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(group.trend)}
                    <span className="text-sm font-medium">
                      {group.groupName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold">
                      {group.averageScore.toFixed(1)}%
                    </span>
                    <Progress value={group.completionRate} className="w-16" />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <button
                  key={activity.id}
                  type="button"
                  className="flex w-full cursor-pointer items-start space-x-3 rounded-lg border border-transparent p-2 text-left transition-colors hover:border-border hover:bg-muted/50"
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className="mt-0.5 flex items-center space-x-2">
                    <div
                      className={`h-2 w-2 rounded-full ${getStatusDot(activity.status)}`}
                    />
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <ActivityModal
        activity={selectedActivity}
        open={isActivityModalOpen}
        onOpenChange={setIsActivityModalOpen}
      />
    </div>
  );
}
