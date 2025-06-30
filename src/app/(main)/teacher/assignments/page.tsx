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
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  getAllStudentWorkload,
  getAssignments,
  getStudentProgress,
  getStudentWorkload,
} from "@/core/teacher/assignments/assignments.domain";
import type {
  Assignment,
  CustomProblem,
  DetailedStudentProgress,
  ProblemAttempt,
} from "@/core/teacher/assignments/assignments.types";
import { getAvailableBooks } from "@/core/teacher/books/books.domain";
import type { BookProblem } from "@/core/teacher/books/books.types";
import { getStudentGroups } from "@/core/teacher/groups/groups.domain";
import {
  getStudentAIEvaluation,
  getStudents,
} from "@/core/teacher/students/students.domain";
import type { Student } from "@/core/teacher/students/students.types";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Edit,
  Eye,
  Pause,
  Play,
  Plus,
  Trash2,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";

// Add helper function to get focus recommendations
const getFocusRecommendations = (studentId: string) => {
  const evaluation = getStudentAIEvaluation(studentId);
  if (!evaluation) return null;

  return {
    shouldFocus:
      evaluation.quickOverview.overallScore < 70 ||
      Object.values(evaluation.weaknesses).some(
        (w: { score: number }) => w.score < 50,
      ),
    primaryWeakness: evaluation.quickOverview.primaryWeakness,
    recommendedFocus: evaluation.quickOverview.recommendedFocus,
    motivationStyle: evaluation.quickOverview.motivationStyle,
  };
};

// Helper functions for the student details dialog
const getPerformanceBadgeVariant = (performance: Student["performance"]) => {
  switch (performance) {
    case "Excellent":
      return "default";
    case "Good":
      return "secondary";
    case "Average":
      return "outline";
    case "Needs Improvement":
      return "destructive";
    default:
      return "outline";
  }
};

const getConceptScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
};

const getTraitLevelColor = (level: string) => {
  switch (level) {
    case "High":
      return "text-red-600";
    case "Moderate":
      return "text-yellow-600";
    case "Low":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
};

const getProblemStatusIcon = (status: ProblemAttempt["status"]) => {
  switch (status) {
    case "Correct":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "Incorrect":
      return <XCircle className="h-5 w-5 text-red-500" />;
    case "Partially Correct":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  }
};

export default function AssignmentsPage() {
  const allStudents = getStudents();
  const allBooks = getAvailableBooks();
  const availableBookProblems = allBooks.flatMap((book) => book.problems ?? []);
  const allStudentWorkload = getAllStudentWorkload();
  const availableGroups = getStudentGroups();

  const [assignments, setAssignments] =
    useState<Assignment[]>(getAssignments());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null,
  );
  const [assignGroupsAssignment, setAssignGroupsAssignment] =
    useState<Assignment | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  // Assignment overview state
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(
    null,
  );
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Problem selection states
  const [selectedBookProblems, setSelectedBookProblems] = useState<string[]>(
    [],
  );
  const [customProblems, setCustomProblems] = useState<CustomProblem[]>([]);
  const [newCustomProblem, setNewCustomProblem] = useState({
    problemText: "",
    solution: "",
    difficulty: "Medium" as CustomProblem["difficulty"],
    estimatedTime: 10,
    topic: "",
  });

  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    subject: "",
    dueDate: "",
    estimatedTime: 60,
    difficulty: "Medium" as Assignment["difficulty"],
    bookId: "",
  });

  // Progress view state
  const [showProgressView, setShowProgressView] = useState(false);
  const [selectedProgressGroup, setSelectedProgressGroup] =
    useState<string>("all");

  const handleViewStudent = (studentId: string) => {
    const student = allStudents.find((s) => s.id === studentId);
    if (student) setViewingStudent(student);
  };

  const resetForm = () => {
    setNewAssignment({
      title: "",
      description: "",
      subject: "",
      dueDate: "",
      estimatedTime: 60,
      difficulty: "Medium",
      bookId: "",
    });
    setSelectedBookProblems([]);
    setCustomProblems([]);
    setNewCustomProblem({
      problemText: "",
      solution: "",
      difficulty: "Medium",
      estimatedTime: 10,
      topic: "",
    });
  };

  const handleAddAssignment = () => {
    const selectedBookProblemsData = getFilteredBookProblems().filter(
      (p: BookProblem) => selectedBookProblems.includes(p.id),
    );
    const totalEstimatedTime = [
      ...selectedBookProblemsData.map((p: BookProblem) => p.estimatedTime),
      ...customProblems.map((p) => p.estimatedTime),
    ].reduce((sum, time) => sum + time, 0);

    const selectedBookData = allBooks.find(
      (book) => book.id === newAssignment.bookId,
    );

    if (!newAssignment) return;
    const assignment: Assignment = {
      id: crypto.randomUUID(),
      ...newAssignment,
      estimatedTime: totalEstimatedTime ?? newAssignment.estimatedTime,
      status: "Draft",
      assignedGroups: [],
      createdDate: new Date().toISOString().split("T")[0] ?? "",
      bookId: selectedBookData?.id,
      bookProblemIds: selectedBookProblemsData.map((p) => p.id),
      customProblems: [...customProblems],
    };

    setAssignments([...assignments, assignment]);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleBookProblemSelection = (problemId: string) => {
    setSelectedBookProblems((prev) =>
      prev.includes(problemId)
        ? prev.filter((id) => id !== problemId)
        : [...prev, problemId],
    );
  };

  const handleAddCustomProblem = () => {
    if (newCustomProblem.problemText.trim()) {
      const customProblem: CustomProblem = {
        id: `custom_${Date.now()}`,
        title: "custom problem",
        ...newCustomProblem,
      };
      setCustomProblems([...customProblems, customProblem]);
      setNewCustomProblem({
        problemText: "",
        solution: "",
        difficulty: "Medium",
        estimatedTime: 10,
        topic: "",
      });
    }
  };

  const handleRemoveCustomProblem = (problemId: string) => {
    setCustomProblems(customProblems.filter((p) => p.id !== problemId));
  };

  const handleEditAssignment = (assignment: Assignment) => {
    const bookId = allBooks.find((b) => b.id === assignment.bookId)?.id ?? "";

    setEditingAssignment(assignment);
    setNewAssignment({
      title: assignment.title,
      description: assignment.description,
      subject: assignment.subject,
      dueDate: assignment.dueDate,
      estimatedTime: assignment.estimatedTime,
      difficulty: assignment.difficulty,
      bookId,
    });
    setSelectedBookProblems(assignment.bookProblemIds ?? []);
    setCustomProblems(assignment.customProblems ?? []);
  };

  const handleUpdateAssignment = () => {
    if (editingAssignment) {
      const selectedBookProblemsData = availableBookProblems.filter((p) =>
        selectedBookProblems.includes(p.id),
      );

      const totalEstimatedTime = [
        ...selectedBookProblemsData.map((p) => p.estimatedTime),
        ...customProblems.map((p) => p.estimatedTime),
      ].reduce((sum, time) => sum + time, 0);

      const selectedBookData = allBooks.find(
        (book) => book.id === newAssignment.bookId,
      );

      const updatedAssignment = {
        ...editingAssignment,
        ...newAssignment,
        estimatedTime: totalEstimatedTime ?? newAssignment.estimatedTime,
        book: selectedBookData?.title,
        bookProblems: selectedBookProblemsData,
        customProblems: [...customProblems],
      };

      setAssignments(
        assignments.map((a) =>
          a.id === editingAssignment.id ? updatedAssignment : a,
        ),
      );
      setEditingAssignment(null);
      resetForm();
    }
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments(assignments.filter((a) => a.id !== id));
  };

  const handleAssignToGroups = (assignment: Assignment) => {
    setAssignGroupsAssignment(assignment);
    setSelectedGroups([...assignment.assignedGroups]);
  };

  const handleUpdateAssignedGroups = () => {
    if (assignGroupsAssignment) {
      setAssignments(
        assignments.map((a) =>
          a.id === assignGroupsAssignment.id
            ? {
                ...a,
                assignedGroups: selectedGroups,
                status: selectedGroups.length > 0 ? "Active" : "Draft",
              }
            : a,
        ),
      );
      setAssignGroupsAssignment(null);
      setSelectedGroups([]);
    }
  };

  const handleViewAssignment = (assignment: Assignment) => {
    setViewingAssignment(assignment);
  };

  const handleToggleStatus = (assignment: Assignment) => {
    const newStatus = assignment.status === "Draft" ? "Active" : "Draft";
    setAssignments(
      assignments.map((a) =>
        a.id === assignment.id ? { ...a, status: newStatus } : a,
      ),
    );
    setViewingAssignment({ ...assignment, status: newStatus });
  };

  const getStatusBadgeVariant = (status: Assignment["status"]) => {
    switch (status) {
      case "Active":
        return "default";
      case "Draft":
        return "secondary";
      case "Completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getDifficultyBadgeVariant = (difficulty: Assignment["difficulty"]) => {
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600";
      case "Medium":
        return "text-yellow-600";
      case "Hard":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getTotalProblemsCount = () => {
    return selectedBookProblems.length + customProblems.length;
  };

  const getTotalEstimatedTime = () => {
    const bookTime = availableBookProblems
      .filter((p) => selectedBookProblems.includes(p.id))
      .reduce((sum, p) => sum + p.estimatedTime, 0);
    const customTime = customProblems.reduce(
      (sum, p) => sum + p.estimatedTime,
      0,
    );
    return bookTime + customTime;
  };

  const getFilteredBookProblems = () => {
    if (!newAssignment.bookId) return [];
    return availableBookProblems.filter(
      (problem) => problem.bookId === newAssignment.bookId,
    );
  };

  const getProgressStatusBadgeVariant = (
    status: DetailedStudentProgress["assignments"][0]["status"],
  ) => {
    switch (status) {
      case "Completed":
        return "default";
      case "In Progress":
        return "secondary";
      case "Not Started":
        return "outline";
      case "Overdue":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getWorkloadColor = (activeAssignments: number) => {
    if (activeAssignments === 0) return "text-green-600";
    if (activeAssignments <= 2) return "text-yellow-600";
    return "text-red-600";
  };

  // const formatLastActivity = (dateString: string) => {
  //   const date = new Date(dateString);
  //   const now = new Date();
  //   const diffInHours = Math.floor(
  //     (now.getTime() - date.getTime()) / (1000 * 60 * 60),
  //   );

  //   if (diffInHours < 1) return "Just now";
  //   if (diffInHours < 24) return `${diffInHours}h ago`;
  //   const diffInDays = Math.floor(diffInHours / 24);
  //   return `${diffInDays}d ago`;
  // };

  // const getGroupedProgress = () => {
  //   const grouped: { [key: string]: DetailedStudentProgress[] } = {};

  //   allStudentProgress.forEach((progress) => {
  //     const workload = getStudentWorkload(progress.studentId);
  //     const group = workload?.group || "Unknown";

  //     if (selectedProgressGroup === "all" || group === selectedProgressGroup) {
  //       if (!grouped[group]) grouped[group] = [];

  //       grouped[group].push(progress);
  //     }
  //   });

  //   return grouped;
  // };

  const getFilteredWorkload = () => {
    return allStudentWorkload.filter(
      (workload) =>
        selectedProgressGroup === "all" ||
        workload.group === selectedProgressGroup,
    );
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Assignments</h2>
        <div className="flex space-x-2">
          <Button
            variant={showProgressView ? "outline" : "default"}
            onClick={() => setShowProgressView(false)}
          >
            Assignments
          </Button>
          <Button
            variant={showProgressView ? "default" : "outline"}
            onClick={() => setShowProgressView(true)}
          >
            Student Progress
          </Button>
          {!showProgressView && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[900px]">
                <DialogHeader>
                  <DialogTitle>Create New Assignment</DialogTitle>
                  <DialogDescription>
                    Create a new assignment by selecting problems from books or
                    adding your own.
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">
                      Assignment Details
                    </TabsTrigger>
                    <TabsTrigger value="problems">Select Problems</TabsTrigger>
                    <TabsTrigger value="custom">Custom Problems</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                          Title
                        </Label>
                        <Input
                          id="title"
                          value={newAssignment.title}
                          onChange={(e) =>
                            setNewAssignment({
                              ...newAssignment,
                              title: e.target.value,
                            })
                          }
                          className="col-span-3"
                          placeholder="Assignment title"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="subject" className="text-right">
                          Subject
                        </Label>
                        <Input
                          id="subject"
                          value={newAssignment.subject}
                          onChange={(e) =>
                            setNewAssignment({
                              ...newAssignment,
                              subject: e.target.value,
                            })
                          }
                          className="col-span-3"
                          placeholder="e.g., Mathematics"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="difficulty" className="text-right">
                          Difficulty
                        </Label>
                        <Select
                          value={newAssignment.difficulty}
                          onValueChange={(value: Assignment["difficulty"]) =>
                            setNewAssignment({
                              ...newAssignment,
                              difficulty: value,
                            })
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dueDate" className="text-right">
                          Due Date
                        </Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={newAssignment.dueDate}
                          onChange={(e) =>
                            setNewAssignment({
                              ...newAssignment,
                              dueDate: e.target.value,
                            })
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={newAssignment.description}
                          onChange={(e) =>
                            setNewAssignment({
                              ...newAssignment,
                              description: e.target.value,
                            })
                          }
                          className="col-span-3"
                          placeholder="Assignment description..."
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="problems" className="space-y-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="book" className="text-right">
                          Select Book
                        </Label>
                        <Select
                          value={newAssignment.bookId}
                          onValueChange={(value) =>
                            setNewAssignment({
                              ...newAssignment,
                              bookId: value,
                            })
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Choose a book" />
                          </SelectTrigger>
                          <SelectContent>
                            {allBooks.map((book) => (
                              <SelectItem key={book.id} value={book.id}>
                                {book.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {newAssignment.bookId && (
                        <div className="space-y-4">
                          <h4 className="font-medium">Available Problems:</h4>
                          <div className="max-h-96 space-y-2 overflow-y-auto">
                            {getFilteredBookProblems().map((problem) => (
                              <button
                                type="button"
                                key={problem.id}
                                className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                                  selectedBookProblems.includes(problem.id)
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() =>
                                  handleBookProblemSelection(problem.id)
                                }
                              >
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <h5 className="text-sm font-medium">
                                      {problem.problemNumber} - {problem.topic}
                                    </h5>
                                    <p className="text-xs text-muted-foreground">
                                      {problem.chapter} •{" "}
                                      {problem.estimatedTime} min
                                    </p>
                                    <p className="text-sm">
                                      {problem.problemText}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={getDifficultyColor(
                                      problem.difficulty,
                                    )}
                                  >
                                    {problem.difficulty}
                                  </Badge>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="custom" className="space-y-4">
                    <div className="space-y-4">
                      <h4 className="font-medium">Add Custom Problem:</h4>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="customTopic" className="text-right">
                            Topic
                          </Label>
                          <Input
                            id="customTopic"
                            value={newCustomProblem.topic}
                            onChange={(e) =>
                              setNewCustomProblem({
                                ...newCustomProblem,
                                topic: e.target.value,
                              })
                            }
                            className="col-span-3"
                            placeholder="Problem topic"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="customProblem" className="text-right">
                            Problem
                          </Label>
                          <Textarea
                            id="customProblem"
                            value={newCustomProblem.problemText}
                            onChange={(e) =>
                              setNewCustomProblem({
                                ...newCustomProblem,
                                problemText: e.target.value,
                              })
                            }
                            className="col-span-3"
                            placeholder="Enter the problem statement..."
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="customSolution"
                            className="text-right"
                          >
                            Solution
                          </Label>
                          <Textarea
                            id="customSolution"
                            value={newCustomProblem.solution}
                            onChange={(e) =>
                              setNewCustomProblem({
                                ...newCustomProblem,
                                solution: e.target.value,
                              })
                            }
                            className="col-span-3"
                            placeholder="Enter the solution..."
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="customDifficulty"
                            className="text-right"
                          >
                            Difficulty
                          </Label>
                          <Select
                            value={newCustomProblem.difficulty}
                            onValueChange={(
                              value: CustomProblem["difficulty"],
                            ) =>
                              setNewCustomProblem({
                                ...newCustomProblem,
                                difficulty: value,
                              })
                            }
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Easy">Easy</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="customTime" className="text-right">
                            Est. Time (min)
                          </Label>
                          <Input
                            id="customTime"
                            type="number"
                            value={newCustomProblem.estimatedTime}
                            onChange={(e) =>
                              setNewCustomProblem({
                                ...newCustomProblem,
                                estimatedTime:
                                  Number.parseInt(e.target.value) || 0,
                              })
                            }
                            className="col-span-3"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button onClick={handleAddCustomProblem}>
                            Add Problem
                          </Button>
                        </div>
                      </div>

                      {customProblems.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">
                            Custom Problems Added:
                          </h4>
                          {customProblems.map((problem) => (
                            <div
                              key={problem.id}
                              className="rounded-lg border bg-gray-50 p-3"
                            >
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <h5 className="text-sm font-medium">
                                    {problem.topic}
                                  </h5>
                                  <p className="text-sm">
                                    {problem.problemText}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {problem.estimatedTime} min
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    variant="outline"
                                    className={getDifficultyColor(
                                      problem.difficulty,
                                    )}
                                  >
                                    {problem.difficulty}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveCustomProblem(problem.id)
                                    }
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {getTotalProblemsCount()} problems •{" "}
                    {getTotalEstimatedTime()} min estimated
                  </div>
                  <Button onClick={handleAddAssignment}>
                    Create Assignment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {!showProgressView ? (
        // Assignments List View
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Management</CardTitle>
              <CardDescription>
                Create and manage assignments for your students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assignments.map((assignment) => (
                  <Card key={assignment.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">
                            {assignment.title}
                          </CardTitle>
                          <CardDescription>
                            {assignment.description}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={getStatusBadgeVariant(assignment.status)}
                          >
                            {assignment.status}
                          </Badge>
                          <Badge
                            variant={getDifficultyBadgeVariant(
                              assignment.difficulty,
                            )}
                          >
                            {assignment.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-grow flex-col justify-between space-y-4">
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Subject:</strong> {assignment.subject}
                        </p>
                        <p>
                          <strong>Due Date:</strong> {assignment.dueDate}
                        </p>
                        <p>
                          <strong>Est. Time:</strong> {assignment.estimatedTime}{" "}
                          minutes
                        </p>
                        {assignment.assignedGroups.length > 0 && (
                          <div>
                            <strong>Groups:</strong>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {assignment.assignedGroups.map((group) => (
                                <Badge
                                  key={group}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {group}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAssignment(assignment)}
                          className="flex-1"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAssignment(assignment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignToGroups(assignment)}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {assignments.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <p>
                    No assignments created yet. Click &quot;Create
                    Assignment&quot; to get started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        // Student Progress View
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Progress Overview</CardTitle>
              <CardDescription>
                Monitor student progress across all assignments
              </CardDescription>
              <div className="flex space-x-4">
                <Select
                  value={selectedProgressGroup}
                  onValueChange={setSelectedProgressGroup}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    <SelectItem value="Advanced Math">Advanced Math</SelectItem>
                    <SelectItem value="Basic Math">Basic Math</SelectItem>
                    <SelectItem value="Geometry Focus">
                      Geometry Focus
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {/* Student Workload Summary */}
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-semibold">
                  Student Workload Summary
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {getFilteredWorkload().map((workload) => {
                    const focusRec = getFocusRecommendations(
                      workload.studentId,
                    );
                    const needsFocus = focusRec?.shouldFocus ?? false;

                    return (
                      <Card
                        key={workload.studentId}
                        className={`cursor-pointer transition-shadow hover:shadow-lg ${
                          needsFocus ? "border-orange-300 bg-orange-50" : ""
                        }`}
                        onClick={() => handleViewStudent(workload.studentId)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              {workload.studentName}
                            </CardTitle>
                            {needsFocus && (
                              <Badge
                                variant="outline"
                                className="border-orange-300 text-orange-700"
                              >
                                Needs Focus
                              </Badge>
                            )}
                          </div>
                          <CardDescription>{workload.group}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="rounded border p-2 text-center">
                              <div
                                className={`font-bold ${getWorkloadColor(workload.activeAssignments)}`}
                              >
                                {workload.activeAssignments}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Active
                              </div>
                            </div>
                            <div className="rounded border p-2 text-center">
                              <div className="font-bold text-green-600">
                                {workload.completedThisWeek}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Completed
                              </div>
                            </div>
                            <div className="rounded border p-2 text-center">
                              <div className="font-bold text-blue-600">
                                {workload.totalTimeSpent}min
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Time Spent
                              </div>
                            </div>
                            <div className="rounded border p-2 text-center">
                              <div className="font-bold text-purple-600">
                                {workload.averageScore > 0
                                  ? `${workload.averageScore}%`
                                  : "N/A"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Avg Score
                              </div>
                            </div>
                          </div>

                          {needsFocus && focusRec && (
                            <div className="mt-3 rounded border border-orange-200 bg-orange-100 p-2 text-xs">
                              <p className="font-medium text-orange-800">
                                Focus Area:
                              </p>
                              <p className="text-orange-700">
                                {focusRec.primaryWeakness}
                              </p>
                              <p className="mt-1 font-medium text-orange-800">
                                Recommended:
                              </p>
                              <p className="text-orange-700">
                                {focusRec.recommendedFocus}
                              </p>
                              <p className="mt-1 font-medium text-orange-800">
                                Motivation:
                              </p>
                              <p className="text-orange-700">
                                {focusRec.motivationStyle}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Progress by Group */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">
                  Detailed Progress by Group
                </h3>
                {/* {Object.entries(getGroupedProgress()).map(
                  ([group, progress]) => (
                    <Card key={group}>
                      <CardHeader>
                        <CardTitle className="text-base">{group}</CardTitle>
                        <CardDescription>
                          {progress.length} students
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Assignment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>AI Prompts</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Last Activity</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {progress.map((item) => (
                                <TableRow
                                  key={`${item.studentId}-${item.assignmentId}`}
                                  className="cursor-pointer hover:bg-muted/50"
                                  onClick={() =>
                                    handleViewStudent(item.studentId)
                                  }
                                >
                                  <TableCell className="font-medium">
                                    {item.studentName}
                                  </TableCell>
                                  <TableCell>{item.assignmentTitle}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={getProgressStatusBadgeVariant(
                                        item.status,
                                      )}
                                    >
                                      {item.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <div className="h-2 flex-1 rounded-full bg-gray-200">
                                        <div
                                          className="h-2 rounded-full bg-blue-600 transition-all"
                                          style={{ width: `${item.progress}%` }}
                                        />
                                      </div>
                                      <span className="text-sm">
                                        {item.progress}%
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{item.timeSpent} min</TableCell>
                                  <TableCell>
                                    <span
                                      className={
                                        item.aiPromptsUsed > 10
                                          ? "font-medium text-red-600"
                                          : ""
                                      }
                                    >
                                      {item.aiPromptsUsed}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    {item.score !== undefined ? (
                                      <span className="font-medium">
                                        {item.score}/{item.maxScore}
                                      </span>
                                    ) : (
                                      "-"
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {formatLastActivity(item.lastActivity)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  ),
                )} */}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assignment Details Dialog */}
      <Dialog
        open={!!viewingAssignment}
        onOpenChange={() => setViewingAssignment(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{viewingAssignment?.title}</DialogTitle>
            <DialogDescription>
              Assignment details and management
            </DialogDescription>
          </DialogHeader>
          {viewingAssignment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Subject:</strong> {viewingAssignment.subject}
                </div>
                <div>
                  <strong>Due Date:</strong> {viewingAssignment.dueDate}
                </div>
                <div>
                  <strong>Difficulty:</strong> {viewingAssignment.difficulty}
                </div>
                <div>
                  <strong>Est. Time:</strong> {viewingAssignment.estimatedTime}{" "}
                  min
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  <Badge
                    variant={getStatusBadgeVariant(viewingAssignment.status)}
                  >
                    {viewingAssignment.status}
                  </Badge>
                </div>
                <div>
                  <strong>Created:</strong> {viewingAssignment.createdDate}
                </div>
              </div>
              <div>
                <strong>Description:</strong>
                <p className="mt-1 text-sm text-muted-foreground">
                  {viewingAssignment.description}
                </p>
              </div>
              {viewingAssignment.assignedGroups.length > 0 && (
                <div>
                  <strong>Assigned Groups:</strong>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {viewingAssignment.assignedGroups.map((group) => (
                      <Badge key={group} variant="outline">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewingAssignment(null)}
            >
              Close
            </Button>
            <Button
              onClick={() =>
                viewingAssignment && handleToggleStatus(viewingAssignment)
              }
            >
              {viewingAssignment?.status === "Draft" ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Activate
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Deactivate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog
        open={!!editingAssignment}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditingAssignment(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>
              Update assignment details and manage problems.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Assignment Details</TabsTrigger>
              <TabsTrigger value="problems">Select Problems</TabsTrigger>
              <TabsTrigger value="custom">Custom Problems</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title-edit" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title-edit"
                    value={newAssignment.title}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        title: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Assignment title"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject-edit" className="text-right">
                    Subject
                  </Label>
                  <Input
                    id="subject-edit"
                    value={newAssignment.subject}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        subject: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="e.g., Mathematics"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="difficulty-edit" className="text-right">
                    Difficulty
                  </Label>
                  <Select
                    value={newAssignment.difficulty}
                    onValueChange={(value: Assignment["difficulty"]) =>
                      setNewAssignment({ ...newAssignment, difficulty: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dueDate-edit" className="text-right">
                    Due Date
                  </Label>
                  <Input
                    id="dueDate-edit"
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        dueDate: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description-edit" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description-edit"
                    value={newAssignment.description}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        description: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Assignment description..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="problems" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="book-edit" className="text-right">
                    Select Book
                  </Label>
                  <Select
                    value={newAssignment.bookId}
                    onValueChange={(value) =>
                      setNewAssignment({
                        ...newAssignment,
                        bookId: value,
                      })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Choose a book" />
                    </SelectTrigger>
                    <SelectContent>
                      {allBooks.map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newAssignment.bookId && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Available Problems:</h4>
                    <div className="max-h-96 space-y-2 overflow-y-auto">
                      {getFilteredBookProblems().map((problem) => (
                        <button
                          type="button"
                          key={problem.id}
                          className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                            selectedBookProblems.includes(problem.id)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleBookProblemSelection(problem.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h5 className="text-sm font-medium">
                                {problem.problemNumber} - {problem.topic}
                              </h5>
                              <p className="text-xs text-muted-foreground">
                                {problem.chapter} • {problem.estimatedTime} min
                              </p>
                              <p className="text-sm">{problem.problemText}</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={getDifficultyColor(problem.difficulty)}
                            >
                              {problem.difficulty}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 pt-4">
              <div className="space-y-4">
                <h4 className="font-medium">Add Custom Problem:</h4>
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="customTopic-edit" className="text-right">
                      Topic
                    </Label>
                    <Input
                      id="customTopic-edit"
                      value={newCustomProblem.topic}
                      onChange={(e) =>
                        setNewCustomProblem({
                          ...newCustomProblem,
                          topic: e.target.value,
                        })
                      }
                      className="col-span-3"
                      placeholder="Problem topic"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="customProblem-edit" className="text-right">
                      Problem
                    </Label>
                    <Textarea
                      id="customProblem-edit"
                      value={newCustomProblem.problemText}
                      onChange={(e) =>
                        setNewCustomProblem({
                          ...newCustomProblem,
                          problemText: e.target.value,
                        })
                      }
                      className="col-span-3"
                      placeholder="Enter the problem statement..."
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="customSolution-edit" className="text-right">
                      Solution
                    </Label>
                    <Textarea
                      id="customSolution-edit"
                      value={newCustomProblem.solution}
                      onChange={(e) =>
                        setNewCustomProblem({
                          ...newCustomProblem,
                          solution: e.target.value,
                        })
                      }
                      className="col-span-3"
                      placeholder="Enter the solution..."
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="customDifficulty-edit"
                      className="text-right"
                    >
                      Difficulty
                    </Label>
                    <Select
                      value={newCustomProblem.difficulty}
                      onValueChange={(value: CustomProblem["difficulty"]) =>
                        setNewCustomProblem({
                          ...newCustomProblem,
                          difficulty: value,
                        })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="customTime-edit" className="text-right">
                      Est. Time (min)
                    </Label>
                    <Input
                      id="customTime-edit"
                      type="number"
                      value={newCustomProblem.estimatedTime}
                      onChange={(e) =>
                        setNewCustomProblem({
                          ...newCustomProblem,
                          estimatedTime: Number.parseInt(e.target.value) || 0,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleAddCustomProblem}>
                      Add Problem
                    </Button>
                  </div>
                </div>

                {customProblems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Custom Problems Added:</h4>
                    {customProblems.map((problem) => (
                      <div
                        key={problem.id}
                        className="rounded-lg border bg-gray-50 p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h5 className="text-sm font-medium">
                              {problem.topic}
                            </h5>
                            <p className="text-sm">{problem.problemText}</p>
                            <p className="text-xs text-muted-foreground">
                              {problem.estimatedTime} min
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className={getDifficultyColor(problem.difficulty)}
                            >
                              {problem.difficulty}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleRemoveCustomProblem(problem.id)
                              }
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              {getTotalProblemsCount()} problems • {getTotalEstimatedTime()} min
              estimated
            </div>
            <Button onClick={handleUpdateAssignment}>Update Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Groups Dialog */}
      <Dialog
        open={!!assignGroupsAssignment}
        onOpenChange={() => setAssignGroupsAssignment(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign to Groups</DialogTitle>
            <DialogDescription>
              Select which groups should receive this assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {availableGroups.map((group) => (
              <div key={group.id} className="flex items-center space-x-2">
                <Checkbox
                  id={group.id}
                  checked={selectedGroups.includes(group.id)}
                  onChange={(checked) => {
                    if (checked) {
                      setSelectedGroups([...selectedGroups, group.id]);
                    } else {
                      setSelectedGroups(
                        selectedGroups.filter((g) => g !== group.id),
                      );
                    }
                  }}
                />
                <Label htmlFor={group.id} className="cursor-pointer">
                  {group.name}
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <div className="flex w-full justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedGroups.length} groups selected
              </p>
              <Button onClick={handleUpdateAssignedGroups}>
                Update Assignment
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Details Dialog */}
      <Dialog
        open={!!viewingStudent}
        onOpenChange={() => setViewingStudent(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>
                {viewingStudent?.firstName} {viewingStudent?.lastName}
              </span>
            </DialogTitle>
            <DialogDescription>
              Student details, current workload, and assignment progress
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Student Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Student Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Email:</span>{" "}
                    {viewingStudent?.email}
                  </div>
                  <div>
                    <span className="font-medium">Grade:</span>{" "}
                    {viewingStudent?.grade}
                  </div>
                  <div>
                    <span className="font-medium">Group:</span>{" "}
                    {viewingStudent?.group}
                  </div>
                  <div>
                    <span className="font-medium">Performance:</span>
                    <Badge
                      variant={getPerformanceBadgeVariant(
                        viewingStudent?.performance ?? "Average",
                      )}
                      className="ml-2"
                    >
                      {viewingStudent?.performance}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Join Date:</span>{" "}
                    {viewingStudent?.joinDate}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workload Summary */}
            {viewingStudent &&
              (() => {
                const workload = getStudentWorkload(viewingStudent.id);
                return workload ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Current Workload
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        <div className="rounded-lg border p-3 text-center">
                          <div
                            className={`text-2xl font-bold ${getWorkloadColor(workload.activeAssignments)}`}
                          >
                            {workload.activeAssignments}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Active Assignments
                          </div>
                        </div>
                        <div className="rounded-lg border p-3 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {workload.completedThisWeek}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Completed This Week
                          </div>
                        </div>
                        <div className="rounded-lg border p-3 text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {workload.totalTimeSpent}min
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Time Spent
                          </div>
                        </div>
                        <div className="rounded-lg border p-3 text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {workload.averageScore > 0
                              ? `${workload.averageScore}%`
                              : "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Average Score
                          </div>
                        </div>
                        <div className="rounded-lg border p-3 text-center">
                          <div
                            className={`text-2xl font-bold ${
                              workload.upcomingDeadlines > 2
                                ? "text-red-600"
                                : "text-orange-600"
                            }`}
                          >
                            {workload.upcomingDeadlines}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Upcoming Deadlines
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
              })()}

            {/* Assignment Progress */}
            {viewingStudent &&
              (() => {
                const progress = getStudentProgress(viewingStudent.id);
                return (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Assignment Progress ({progress?.assignments.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {progress?.assignments.map((assignment) => (
                          <Collapsible
                            key={assignment.assignmentId}
                            className="group rounded-lg border"
                          >
                            <CollapsibleTrigger className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50">
                              <div className="text-left">
                                <h4 className="font-medium">
                                  {assignment.assignmentTitle}
                                </h4>
                                <div className="mt-1 flex items-center space-x-2">
                                  <Badge
                                    variant={getProgressStatusBadgeVariant(
                                      assignment.status,
                                    )}
                                  >
                                    {assignment.status}
                                  </Badge>
                                  {assignment.score !== undefined && (
                                    <Badge variant="outline">
                                      Score: {assignment.score}/
                                      {assignment.maxScore}
                                    </Badge>
                                  )}
                                  <Badge variant="outline">
                                    Progress: {assignment.progress}%
                                  </Badge>
                                </div>
                              </div>
                              <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]:rotate-180" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="p-4 pt-0">
                              <div className="mt-4 space-y-3">
                                {assignment.solutions &&
                                assignment.solutions.length > 0 ? (
                                  assignment.solutions.map((attempt) => (
                                    <Collapsible
                                      key={attempt.problemId}
                                      className="group/inner rounded-lg border"
                                    >
                                      <CollapsibleTrigger className="flex w-full items-center justify-between bg-muted/50 p-3 text-left transition-colors hover:bg-muted">
                                        <div className="flex items-center space-x-3">
                                          {getProblemStatusIcon(
                                            attempt.isCorrect
                                              ? "Correct"
                                              : "Incorrect",
                                          )}
                                          <p className="flex-1 text-sm font-medium">
                                            {attempt.problemText}
                                          </p>
                                        </div>
                                        <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/inner:rotate-180" />
                                      </CollapsibleTrigger>
                                      <CollapsibleContent className="p-4">
                                        <Tabs defaultValue="student">
                                          <TabsList className="grid w-full grid-cols-3">
                                            <TabsTrigger value="student">
                                              Student&apos;s Solution
                                            </TabsTrigger>
                                            <TabsTrigger value="expected">
                                              Expected Solution
                                            </TabsTrigger>
                                            <TabsTrigger value="ai">
                                              AI Prompts
                                            </TabsTrigger>
                                          </TabsList>
                                          <TabsContent
                                            value="student"
                                            className="mt-4"
                                          >
                                            <Card>
                                              <CardContent className="p-4">
                                                <pre className="whitespace-pre-wrap font-sans text-sm">
                                                  {attempt.studentSolution}
                                                </pre>
                                              </CardContent>
                                            </Card>
                                          </TabsContent>
                                          <TabsContent
                                            value="expected"
                                            className="mt-4"
                                          >
                                            <Card>
                                              <CardContent className="p-4">
                                                <pre className="whitespace-pre-wrap font-sans text-sm">
                                                  {attempt.expectedSolution}
                                                </pre>
                                              </CardContent>
                                            </Card>
                                          </TabsContent>
                                          <TabsContent
                                            value="ai"
                                            className="mt-4"
                                          >
                                            <Card>
                                              <CardContent className="space-y-2 p-4">
                                                {attempt.aiPrompts.length >
                                                0 ? (
                                                  attempt.aiPrompts.map(
                                                    (prompt) => (
                                                      <div
                                                        key={prompt.prompt}
                                                        className="rounded bg-gray-100 p-2 text-sm"
                                                      >
                                                        {prompt.prompt}
                                                      </div>
                                                    ),
                                                  )
                                                ) : (
                                                  <p className="text-sm text-muted-foreground">
                                                    No AI prompts were used for
                                                    this problem.
                                                  </p>
                                                )}
                                              </CardContent>
                                            </Card>
                                          </TabsContent>
                                        </Tabs>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  ))
                                ) : (
                                  <div className="py-4 text-center text-sm text-muted-foreground">
                                    No problem details available for this
                                    assignment.
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}

                        {progress?.assignments.length === 0 && (
                          <div className="py-8 text-center text-muted-foreground">
                            <p>No assignments found for this student.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

            {/* AI Evaluation */}
            {viewingStudent &&
              (() => {
                const evaluation = getStudentAIEvaluation(viewingStudent.id);
                return evaluation ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-base">
                        AI Evaluation & Insights
                        <Badge variant="outline" className="text-xs">
                          Updated: {evaluation.lastUpdated}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Quick Overview */}
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                          <h4 className="mb-2 font-semibold text-blue-800">
                            Quick Overview
                          </h4>
                          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                            <div>
                              <span className="font-medium">
                                Overall Score:
                              </span>
                              <span
                                className={`ml-2 font-bold ${getConceptScoreColor(
                                  evaluation.quickOverview.overallScore,
                                )}`}
                              >
                                {evaluation.quickOverview.overallScore}/100
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">
                                Primary Strength:
                              </span>
                              <span className="ml-2 text-green-600">
                                {evaluation.quickOverview.primaryStrength}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">
                                Primary Weakness:
                              </span>
                              <span className="ml-2 text-red-600">
                                {evaluation.quickOverview.primaryWeakness}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">
                                Motivation Style:
                              </span>
                              <span className="ml-2 text-purple-600">
                                {evaluation.quickOverview.motivationStyle}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className="font-medium">
                              Recommended Focus:
                            </span>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {evaluation.quickOverview.recommendedFocus}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          {/* Strengths */}
                          <div>
                            <h4 className="mb-3 font-semibold text-green-700">
                              Strengths by Concept
                            </h4>
                            <div className="space-y-3">
                              {Object.entries(evaluation.strengths).map(
                                ([concept, data]) => (
                                  <div
                                    key={concept}
                                    className="rounded-lg border border-green-200 bg-green-50 p-3"
                                  >
                                    <div className="mb-2 flex items-center justify-between">
                                      <h5 className="text-sm font-medium">
                                        {concept}
                                      </h5>
                                      <Badge
                                        variant="outline"
                                        className="text-green-600"
                                      >
                                        {data.score}/100
                                      </Badge>
                                    </div>
                                    <ul className="space-y-1 text-xs text-muted-foreground">
                                      {data.evidence.map((evidence) => (
                                        <li key={evidence}>• {evidence}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>

                          {/* Weaknesses */}
                          <div>
                            <h4 className="mb-3 font-semibold text-red-700">
                              Weaknesses by Concept
                            </h4>
                            <div className="space-y-3">
                              {Object.entries(evaluation.weaknesses).map(
                                ([concept, data]) => (
                                  <div
                                    key={concept}
                                    className="rounded-lg border border-red-200 bg-red-50 p-3"
                                  >
                                    <div className="mb-2 flex items-center justify-between">
                                      <h5 className="text-sm font-medium">
                                        {concept}
                                      </h5>
                                      <Badge
                                        variant="outline"
                                        className="text-red-600"
                                      >
                                        {data.score}/100
                                      </Badge>
                                    </div>
                                    <ul className="space-y-1 text-xs text-muted-foreground">
                                      {data.evidence.map((evidence) => (
                                        <li key={evidence}>• {evidence}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Character Traits */}
                        <div>
                          <h4 className="mb-3 font-semibold text-purple-700">
                            Character Traits
                          </h4>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            {evaluation.characterTraits.map((trait) => (
                              <div
                                key={trait.trait}
                                className="rounded-lg border p-3"
                              >
                                <div className="mb-2 flex items-center justify-between">
                                  <h5 className="text-sm font-medium">
                                    {trait.trait}
                                  </h5>
                                  <Badge
                                    variant="outline"
                                    className={getTraitLevelColor(trait.level)}
                                  >
                                    {trait.level}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {trait.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Motivation Strategies */}
                        <div>
                          <h4 className="mb-3 font-semibold text-blue-700">
                            Motivation Strategies
                          </h4>
                          <div className="space-y-3">
                            {evaluation.motivationStrategies.map((strategy) => (
                              <div
                                key={strategy.strategy}
                                className="rounded-lg border border-blue-200 bg-blue-50 p-3"
                              >
                                <div className="mb-2 flex items-center justify-between">
                                  <h5 className="text-sm font-medium">
                                    {strategy.strategy}
                                  </h5>
                                  <Badge
                                    variant="outline"
                                    className="text-blue-600"
                                  >
                                    {strategy.effectiveness}% effective
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  <span className="font-medium">Examples:</span>
                                  <ul className="mt-1 space-y-1">
                                    {strategy.examples.map((example) => (
                                      <li key={example}>• {example}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
              })()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingStudent(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
