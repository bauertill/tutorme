"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAssignmentDetails,
  getStudentProgress,
} from "@/core/teacher/assignments/assignments.domain";
import type { AssignmentDetails } from "@/core/teacher/assignments/assignments.types";
import {
  getGroupPerformance,
  getStudentResults,
} from "@/core/teacher/results/results.domain";
import type {
  GroupPerformance,
  StudentResult,
} from "@/core/teacher/results/results.types";
import { getStudents } from "@/core/teacher/students/students.domain";
import {
  Award,
  BarChart3,
  ChevronRight,
  Clock,
  FileText,
  TrendingDown,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";

const groupBreakdown = (groupName: string) => {
  const allStudents = getStudents();
  const studentResults = getStudentResults();

  const groupResults = studentResults.filter((r) => r.group === groupName);
  const studentData: Record<
    string,
    {
      name: string;
      scores: number[];
      maxScores: number[];
      timeSpent: number;
      completed: number;
      total: number;
      assignments: StudentResult[];
    }
  > = {};

  groupResults.forEach((result) => {
    if (!studentData[result.studentId]) {
      studentData[result.studentId] = {
        name:
          allStudents.find((s) => s.id === result.studentId)?.firstName ?? "",
        scores: [],
        maxScores: [],
        timeSpent: 0,
        completed: 0,
        total: 0,
        assignments: [],
      };
    }
    const student = studentData[result.studentId];
    if (!student) return;
    student.total += 1;
    student.timeSpent += result.timeSpent;
    student.assignments.push(result);
    if (result.status === "Completed") {
      student.completed += 1;
      student.scores.push(result.score);
      student.maxScores.push(result.maxScore);
    }
  });

  return Object.values(studentData).map((student) => {
    const totalScore = student.scores.reduce((acc, score) => acc + score, 0);
    const totalMaxScore = student.maxScores.reduce((acc, max) => acc + max, 0);
    const averageScore =
      totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
    return {
      ...student,
      averageScore,
    };
  });
};

export default function Results() {
  const allStudents = getStudents();
  const studentResults = getStudentResults();
  const groupPerformance = getGroupPerformance();

  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedAssignment, setSelectedAssignment] = useState<string>("all");
  const [viewingStudentDetails, setViewingStudentDetails] = useState<
    string | null
  >(null);
  const [viewingGroupDetails, setViewingGroupDetails] = useState<string | null>(
    null,
  );
  const [viewingAssignmentDetails, setViewingAssignmentDetails] = useState<
    string | null
  >(null);

  const filteredResults = studentResults.filter((result) => {
    const groupMatch =
      selectedGroup === "all" || result.group === selectedGroup;
    const assignmentMatch =
      selectedAssignment === "all" || result.assignment === selectedAssignment;
    return groupMatch && assignmentMatch;
  });

  const getStatusBadgeVariant = (status: StudentResult["status"]) => {
    switch (status) {
      case "Completed":
        return "default";
      case "In Progress":
        return "secondary";
      case "Overdue":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrendIcon = (trend: GroupPerformance["trend"]) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDifficultyBadgeVariant = (
    difficulty: AssignmentDetails["difficulty"],
  ) => {
    switch (difficulty) {
      case "Easy":
        return "outline";
      case "Medium":
        return "secondary";
      case "Hard":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Results & Analytics
        </h2>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">83.2%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Time Spent
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">63 min</div>
            <p className="text-xs text-muted-foreground">-3 min from target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Top Performers
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Students above 90%</p>
          </CardContent>
        </Card>
      </div>

      {/* Group Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Group Performance Overview</CardTitle>
          <CardDescription>
            Performance metrics by student group. Click a group for a detailed
            breakdown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {groupPerformance.map((group) => (
              <button
                type="button"
                key={group.groupName}
                className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                onClick={() => setViewingGroupDetails(group.groupName)}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold">{group.groupName}</h4>
                    {getTrendIcon(group.trend)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {group.totalStudents} students •{" "}
                    {group.completedAssignments} assignments completed
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <div className="text-2xl font-bold">
                    {group.averageScore.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {group.completionRate}% completion rate
                  </div>
                  <Progress value={group.completionRate} className="w-24" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Results</CardTitle>
          <CardDescription>
            Detailed view of student performance on assignments
          </CardDescription>
          <div className="flex space-x-4">
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                <SelectItem value="Advanced Math">Advanced Math</SelectItem>
                <SelectItem value="Basic Math">Basic Math</SelectItem>
                <SelectItem value="Geometry Focus">Geometry Focus</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedAssignment}
              onValueChange={setSelectedAssignment}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignments</SelectItem>
                <SelectItem value="Linear Equations Practice">
                  Linear Equations Practice
                </SelectItem>
                <SelectItem value="Geometry Proofs">Geometry Proofs</SelectItem>
                <SelectItem value="Statistics Basics">
                  Statistics Basics
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Time Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow
                    key={result.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setViewingStudentDetails(result.studentId)}
                  >
                    <TableCell className="font-medium">
                      {allStudents.find((s) => s.id === result.studentId)
                        ?.firstName ?? ""}{" "}
                      {allStudents.find((s) => s.id === result.studentId)
                        ?.lastName ?? ""}
                    </TableCell>
                    <TableCell>{result.group}</TableCell>
                    <TableCell>{result.assignment}</TableCell>
                    <TableCell>
                      <span
                        className={getScoreColor(result.score, result.maxScore)}
                      >
                        {result.score}/{result.maxScore}
                        {result.status === "Completed" && (
                          <span className="ml-1 text-sm text-muted-foreground">
                            (
                            {Math.round((result.score / result.maxScore) * 100)}
                            %)
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      {result.timeSpent > 0 ? `${result.timeSpent} min` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(result.status)}>
                        {result.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{result.submissionDate || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredResults.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No results found for the selected filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>
              Students with highest average scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {studentResults
                .filter((r) => r.status === "Completed")
                .sort((a, b) => b.score / b.maxScore - a.score / a.maxScore)
                .slice(0, 5)
                .map((result, index) => (
                  <button
                    type="button"
                    key={result.id}
                    className="-m-2 flex w-full cursor-pointer items-center rounded-lg p-3 transition-colors hover:bg-muted/50"
                    onClick={() => setViewingStudentDetails(result.studentId)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                      {index + 1}
                    </div>
                    <div className="ml-4 flex flex-1 items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {allStudents.find((s) => s.id === result.studentId)
                            ?.firstName ?? ""}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {result.group}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round((result.score / result.maxScore) * 100)}%
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
            <CardDescription>
              Students who may need additional support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {studentResults
                .filter(
                  (r) =>
                    r.status === "Overdue" ||
                    (r.status === "Completed" && r.score / r.maxScore < 0.7),
                )
                .slice(0, 5)
                .map((result) => (
                  <button
                    type="button"
                    key={result.id}
                    className="-m-2 flex w-full cursor-pointer items-center rounded-lg p-3 transition-colors hover:bg-muted/50"
                    onClick={() => setViewingStudentDetails(result.studentId)}
                  >
                    <div className="flex flex-1 items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {allStudents.find((s) => s.id === result.studentId)
                            ?.firstName ?? ""}{" "}
                          {allStudents.find((s) => s.id === result.studentId)
                            ?.lastName ?? ""}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {result.group}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusBadgeVariant(result.status)}>
                          {result.status}
                        </Badge>
                        {result.status === "Completed" && (
                          <p className="mt-1 text-sm text-red-600">
                            {Math.round((result.score / result.maxScore) * 100)}
                            %
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Student Details Dialog */}
      <Dialog
        open={!!viewingStudentDetails}
        onOpenChange={() => setViewingStudentDetails(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[1000px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{viewingStudentDetails} - Detailed Progress</span>
            </DialogTitle>
            <DialogDescription>
              Complete assignment progress with solutions and AI assistance
              history
            </DialogDescription>
          </DialogHeader>

          {viewingStudentDetails &&
            (() => {
              const studentData = getStudentProgress(viewingStudentDetails);
              console.log("studentData", studentData, viewingStudentDetails);
              if (!studentData) return <div>No data found</div>;

              return (
                <div className="space-y-6">
                  {/* Student Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Student Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Name:</span>{" "}
                          {studentData.studentName}
                        </div>
                        <div>
                          <span className="font-medium">Group:</span>{" "}
                          {studentData.group}
                        </div>
                        <div>
                          <span className="font-medium">
                            Total Assignments:
                          </span>{" "}
                          {studentData.assignments.length}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Assignments */}
                  {studentData.assignments.map((assignment) => (
                    <Card key={assignment.assignmentId}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            {assignment.assignmentTitle}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={getStatusBadgeVariant(
                                assignment.status as StudentResult["status"],
                              )}
                            >
                              {assignment.status}
                            </Badge>
                            {assignment.score !== undefined &&
                              assignment.maxScore !== undefined && (
                                <Badge variant="outline">
                                  {assignment.score}/{assignment.maxScore} (
                                  {Math.round(
                                    (assignment.score / assignment.maxScore) *
                                      100,
                                  )}
                                  %)
                                </Badge>
                              )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground lg:grid-cols-4">
                          <div>Time Spent: {assignment.timeSpent} minutes</div>
                          <div>Progress: {assignment.progress}%</div>
                          <div>
                            Due:{" "}
                            {assignment.dueDate
                              ? formatDate(assignment.dueDate)
                              : "No due date"}
                          </div>
                          <div>
                            {assignment.submissionDate
                              ? `Submitted: ${formatDate(assignment.submissionDate)}`
                              : "Not submitted"}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {assignment.solutions.map((solution, idx) => (
                            <Collapsible key={solution.problemId}>
                              <div className="rounded-lg border">
                                <CollapsibleTrigger asChild>
                                  <div className="flex cursor-pointer items-center justify-between p-4 hover:bg-muted/50">
                                    <div className="flex items-center space-x-3">
                                      <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                                      <div>
                                        <h4 className="text-sm font-medium">
                                          Problem {idx + 1}
                                        </h4>
                                        <p className="max-w-96 truncate text-xs text-muted-foreground">
                                          {solution.problemText}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Badge
                                        variant={
                                          solution.isCorrect
                                            ? "default"
                                            : "destructive"
                                        }
                                        className="text-xs"
                                      >
                                        {solution.isCorrect
                                          ? "Correct"
                                          : "Needs Work"}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {solution.timeSpent} min
                                      </span>
                                      {solution.aiPrompts.length > 0 && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {solution.aiPrompts.length} AI prompts
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="space-y-4 border-t bg-muted/30 px-4 pb-4">
                                    {/* Problem */}
                                    <div>
                                      <h5 className="mb-2 text-sm font-medium text-primary">
                                        Problem:
                                      </h5>
                                      <p className="rounded border-l-4 border-primary bg-card p-3 text-sm">
                                        {solution.problemText}
                                      </p>
                                    </div>

                                    {/* Student Solution */}
                                    <div>
                                      <h5 className="mb-2 text-sm font-medium text-foreground">
                                        Student Solution:
                                      </h5>
                                      <div
                                        className={`whitespace-pre-line rounded border-l-4 p-3 text-sm ${
                                          solution.isCorrect
                                            ? "border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-950/30"
                                            : "border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-950/30"
                                        }`}
                                      >
                                        {solution.studentSolution}
                                      </div>
                                    </div>

                                    {/* AI Prompts */}
                                    {solution.aiPrompts.length > 0 && (
                                      <div>
                                        <h5 className="mb-2 text-sm font-medium text-primary">
                                          AI Assistance (
                                          {solution.aiPrompts.length} prompts):
                                        </h5>
                                        <div className="space-y-3">
                                          {solution.aiPrompts.map((prompt) => (
                                            <div
                                              key={prompt.prompt}
                                              className="rounded-lg border bg-muted/50 p-3"
                                            >
                                              <div className="mb-2 flex items-start justify-between">
                                                <span className="text-xs font-medium text-primary">
                                                  Student Question:
                                                </span>
                                                <div className="flex items-center space-x-2">
                                                  <Badge
                                                    variant={
                                                      prompt.helpful
                                                        ? "default"
                                                        : "secondary"
                                                    }
                                                    className="text-xs"
                                                  >
                                                    {prompt.helpful
                                                      ? "Helpful"
                                                      : "Not Helpful"}
                                                  </Badge>
                                                  <span className="text-xs text-muted-foreground">
                                                    {formatLastActivity(
                                                      prompt.timestamp,
                                                    )}
                                                  </span>
                                                </div>
                                              </div>
                                              <p className="mb-3 text-sm italic text-foreground">
                                                &ldquo;{prompt.prompt}&rdquo;
                                              </p>
                                              <div className="mb-1 text-xs font-medium text-primary">
                                                AI Response:
                                              </div>
                                              <p className="rounded border bg-card p-2 text-sm">
                                                {prompt.response}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Attempts */}
                                    <div>
                                      <h5 className="mb-2 text-sm font-medium text-orange-600 dark:text-orange-400">
                                        Solution Attempts (
                                        {solution.attempts.length}):
                                      </h5>
                                      <div className="space-y-2">
                                        {solution.attempts.map((attempt) => (
                                          <div
                                            key={attempt.attempt}
                                            className="rounded border bg-card p-3"
                                          >
                                            <div className="mb-2 flex items-center justify-between">
                                              <span className="text-xs font-medium">
                                                Attempt {attempt.attempt}
                                              </span>
                                              <span className="text-xs text-muted-foreground">
                                                {formatLastActivity(
                                                  attempt.timestamp,
                                                )}
                                              </span>
                                            </div>
                                            <p className="mb-2 font-mono text-sm">
                                              {attempt.solution}
                                            </p>
                                            <p className="text-sm italic text-muted-foreground">
                                              Feedback: {attempt.feedback}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              );
            })()}
        </DialogContent>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setViewingStudentDetails(null)}
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Group Details Dialog */}
      <Dialog
        open={!!viewingGroupDetails}
        onOpenChange={() => setViewingGroupDetails(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>{viewingGroupDetails} - Student Breakdown</span>
            </DialogTitle>
            <DialogDescription>
              Detailed performance for each student in the {viewingGroupDetails}{" "}
              group.
            </DialogDescription>
          </DialogHeader>

          {viewingGroupDetails && (
            <div className="mt-4 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Avg. Score</TableHead>
                    <TableHead className="text-right">Completion</TableHead>
                    <TableHead className="text-right">Time Spent</TableHead>
                  </TableRow>
                </TableHeader>
                {groupBreakdown(viewingGroupDetails)
                  .sort((a, b) => b.averageScore - a.averageScore)
                  .map((st) => (
                    <Collapsible asChild key={st.name}>
                      <tbody>
                        <CollapsibleTrigger asChild>
                          <TableRow className="cursor-pointer hover:bg-muted/50">
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
                                <span>{st.name}</span>
                              </div>
                            </TableCell>
                            <TableCell
                              className={`text-right font-semibold ${getScoreColor(st.averageScore, 100)}`}
                            >
                              {st.averageScore
                                ? `${st.averageScore.toFixed(1)}%`
                                : "N/A"}
                            </TableCell>
                            <TableCell className="text-right">
                              {st.completed}/{st.total}
                              <Progress
                                value={(st.completed / st.total) * 100}
                                className="ml-2 inline w-20"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              {st.timeSpent} min
                            </TableCell>
                          </TableRow>
                        </CollapsibleTrigger>
                        <CollapsibleContent asChild>
                          <TableRow>
                            <TableCell colSpan={4} className="bg-muted/50 p-2">
                              <div className="rounded-md border bg-background p-4">
                                <h4 className="mb-4 text-base font-semibold">
                                  Assignment Breakdown for {st.name}
                                </h4>
                                <div className="grid gap-4">
                                  {st.assignments.map((assignment) => (
                                    <button
                                      type="button"
                                      key={assignment.id}
                                      className="cursor-pointer rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                                      onClick={() =>
                                        setViewingAssignmentDetails(
                                          assignment.assignment,
                                        )
                                      }
                                    >
                                      <div className="mb-3 flex items-center justify-between">
                                        <h5 className="flex items-center space-x-2 text-sm font-semibold">
                                          <FileText className="h-4 w-4" />
                                          <span>{assignment.assignment}</span>
                                        </h5>
                                        <div className="flex items-center space-x-2">
                                          <Badge
                                            variant={getStatusBadgeVariant(
                                              assignment.status,
                                            )}
                                          >
                                            {assignment.status}
                                          </Badge>
                                          {assignment.status ===
                                            "Completed" && (
                                            <Badge variant="outline">
                                              {Math.round(
                                                (assignment.score /
                                                  assignment.maxScore) *
                                                  100,
                                              )}
                                              %
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground lg:grid-cols-4">
                                        <div>
                                          <span className="font-medium">
                                            Score:
                                          </span>{" "}
                                          <span
                                            className={getScoreColor(
                                              assignment.score,
                                              assignment.maxScore,
                                            )}
                                          >
                                            {assignment.score}/
                                            {assignment.maxScore}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="font-medium">
                                            Time:
                                          </span>{" "}
                                          {assignment.timeSpent} min
                                        </div>
                                        <div>
                                          <span className="font-medium">
                                            Submitted:
                                          </span>{" "}
                                          {assignment.submissionDate ||
                                            "Not submitted"}
                                        </div>
                                        <div>
                                          <span className="font-medium">
                                            Status:
                                          </span>{" "}
                                          {assignment.status}
                                        </div>
                                      </div>
                                      {assignment.status === "Overdue" && (
                                        <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
                                          <strong>Attention needed:</strong>{" "}
                                          This assignment is overdue and
                                          requires follow-up.
                                        </div>
                                      )}
                                      {assignment.status === "In Progress" && (
                                        <div className="mt-2 rounded border border-yellow-200 bg-yellow-50 p-2 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
                                          <strong>In progress:</strong> Student
                                          is currently working on this
                                          assignment.
                                        </div>
                                      )}
                                      <div className="mt-2 text-xs text-blue-600 hover:text-blue-800">
                                        Click to view assignment details →
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </tbody>
                    </Collapsible>
                  ))}
              </Table>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewingGroupDetails(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Details Dialog */}
      <Dialog
        open={!!viewingAssignmentDetails}
        onOpenChange={() => setViewingAssignmentDetails(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>{viewingAssignmentDetails} - Assignment Details</span>
            </DialogTitle>
            <DialogDescription>
              Complete assignment overview with student performance data
            </DialogDescription>
          </DialogHeader>

          {viewingAssignmentDetails &&
            (() => {
              const assignmentData = getAssignmentDetails(
                viewingAssignmentDetails,
              );
              if (!assignmentData) return <div>No assignment data found</div>;

              return (
                <div className="space-y-6">
                  {/* Assignment Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Assignment Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
                        <div>
                          <span className="font-medium">Subject:</span>{" "}
                          {assignmentData.subject}
                        </div>
                        <div>
                          <span className="font-medium">Due Date:</span>{" "}
                          {formatDate(assignmentData.dueDate)}
                        </div>
                        <div>
                          <span className="font-medium">Difficulty:</span>{" "}
                          <Badge
                            variant={getDifficultyBadgeVariant(
                              assignmentData.difficulty,
                            )}
                            className="ml-1"
                          >
                            {assignmentData.difficulty}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">Est. Time:</span>{" "}
                          {assignmentData.estimatedTime} min
                        </div>
                        <div>
                          <span className="font-medium">Total Problems:</span>{" "}
                          {assignmentData.totalProblems}
                        </div>
                        <div>
                          <span className="font-medium">Assigned Groups:</span>{" "}
                          {assignmentData.assignedGroups.join(", ")}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>{" "}
                          {formatDate(assignmentData.createdDate)}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>{" "}
                          <Badge
                            variant={
                              assignmentData.status === "Active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {assignmentData.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-4">
                        <span className="font-medium">Description:</span>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {assignmentData.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Metrics */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Average Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {assignmentData.averageScore.toFixed(1)}%
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          Completion Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {assignmentData.completionRate}%
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          Avg. Time Spent
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                          {assignmentData.averageTimeSpent} min
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Student Results */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Student Results ({assignmentData.studentResults.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {assignmentData.studentResults.map((result) => (
                          <div
                            key={result.studentName}
                            className="rounded-lg border p-4"
                          >
                            <div className="mb-3 flex items-center justify-between">
                              <h4 className="font-medium">
                                {result.studentName}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant={getStatusBadgeVariant(result.status)}
                                >
                                  {result.status}
                                </Badge>
                                {result.status === "Completed" && (
                                  <Badge variant="outline">
                                    {result.score}/{result.maxScore} (
                                    {Math.round(
                                      (result.score / result.maxScore) * 100,
                                    )}
                                    %)
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground lg:grid-cols-4">
                              <div>
                                <span className="font-medium">Score:</span>{" "}
                                <span
                                  className={getScoreColor(
                                    result.score,
                                    result.maxScore,
                                  )}
                                >
                                  {result.score}/{result.maxScore}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Time Spent:</span>{" "}
                                {result.timeSpent} min
                              </div>
                              <div>
                                <span className="font-medium">Submitted:</span>{" "}
                                {result.submissionDate
                                  ? formatDate(result.submissionDate)
                                  : "Not submitted"}
                              </div>
                              <div>
                                <span className="font-medium">
                                  Problems Solved:
                                </span>{" "}
                                {result.solutions.length}
                              </div>
                            </div>

                            {/* Individual Solutions */}
                            {result.solutions.length > 0 && (
                              <div className="mt-4">
                                <h5 className="mb-2 text-sm font-medium">
                                  Problem Solutions:
                                </h5>
                                <div className="space-y-2">
                                  {result.solutions.map(
                                    (solution, solutionIdx) => (
                                      <Collapsible key={solution.problemId}>
                                        <div className="rounded border bg-muted/30 p-3">
                                          <CollapsibleTrigger asChild>
                                            <div className="flex cursor-pointer items-center justify-between">
                                              <div className="flex items-center space-x-2">
                                                <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]:rotate-90" />
                                                <span className="text-sm font-medium">
                                                  Problem {solutionIdx + 1}
                                                </span>
                                                <Badge
                                                  variant={
                                                    solution.isCorrect
                                                      ? "default"
                                                      : "destructive"
                                                  }
                                                  className="text-xs"
                                                >
                                                  {solution.isCorrect
                                                    ? "Correct"
                                                    : "Incorrect"}
                                                </Badge>
                                              </div>
                                              <span className="text-xs text-muted-foreground">
                                                {solution.timeSpent} min
                                              </span>
                                            </div>
                                          </CollapsibleTrigger>
                                          <CollapsibleContent className="mt-2">
                                            <div className="mb-1 text-xs text-muted-foreground">
                                              Problem:
                                            </div>
                                            <p className="mb-2 text-sm">
                                              {solution.problemText}
                                            </p>
                                            <div className="mb-1 text-xs text-muted-foreground">
                                              Student Solution:
                                            </div>
                                            <div
                                              className={`whitespace-pre-line rounded border-l-2 p-2 text-sm ${
                                                solution.isCorrect
                                                  ? "border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-950/30"
                                                  : "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-950/30"
                                              }`}
                                            >
                                              {solution.studentSolution}
                                            </div>
                                            {solution.aiPrompts.length > 0 && (
                                              <div className="mt-2">
                                                <div className="mb-1 text-xs text-muted-foreground">
                                                  AI Assistance:{" "}
                                                  {solution.aiPrompts.length}{" "}
                                                  prompts
                                                </div>
                                              </div>
                                            )}
                                          </CollapsibleContent>
                                        </div>
                                      </Collapsible>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })()}
        </DialogContent>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setViewingAssignmentDetails(null)}
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
