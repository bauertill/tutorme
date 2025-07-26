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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getStudentProgress,
  getStudentWorkload,
} from "@/core/teacher/assignments/assignments.domain";
import { getStudents } from "@/core/teacher/students/students.domain";
import type { Student } from "@/core/teacher/students/students.types";
import { Edit, Plus, Search, Trash2, User } from "lucide-react";
import { useState } from "react";
import { AiStudentEvaluation } from "../_components/ai-student-evaluation";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(getStudents());
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({
    firstName: "",
    lastName: "",
    email: "",
    grade: "",
    group: "",
    performance: "Average" as Student["performance"],
  });
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter(
    (student) =>
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.grade.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddStudent = () => {
    const student: Student = {
      id: Date.now().toString(),
      ...newStudent,
      joinDate: new Date().toISOString().split("T")[0] ?? "",
      enrollmentDate: new Date().toISOString().split("T")[0] ?? "",
      status: "active",
    };
    setStudents([...students, student]);
    setNewStudent({
      firstName: "",
      lastName: "",
      email: "",
      grade: "",
      group: "",
      performance: "Average",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setNewStudent({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      grade: student.grade,
      group: student.group,
      performance: student.performance,
    });
  };

  const handleUpdateStudent = () => {
    if (editingStudent) {
      setStudents(
        students.map((s) =>
          s.id === editingStudent.id ? { ...editingStudent, ...newStudent } : s,
        ),
      );
      setEditingStudent(null);
      setNewStudent({
        firstName: "",
        lastName: "",
        email: "",
        grade: "",
        group: "",
        performance: "Average",
      });
    }
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter((s) => s.id !== id));
  };

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

  const handleViewStudent = (student: Student) => {
    setViewingStudent(student);
  };

  const getProgressStatusBadgeVariant = (status: string) => {
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

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Students</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Add a new student to your class roster.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firstName" className="text-right">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={newStudent.firstName}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, firstName: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lastName" className="text-right">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={newStudent.lastName}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, lastName: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, email: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="grade" className="text-right">
                  Grade
                </Label>
                <Input
                  id="grade"
                  value={newStudent.grade}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, grade: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="e.g., 10A"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group" className="text-right">
                  Group
                </Label>
                <Select
                  value={newStudent.group}
                  onValueChange={(value) =>
                    setNewStudent({ ...newStudent, group: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Advanced Math">Advanced Math</SelectItem>
                    <SelectItem value="Basic Math">Basic Math</SelectItem>
                    <SelectItem value="Geometry">Geometry</SelectItem>
                    <SelectItem value="Statistics">Statistics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddStudent}>Add Student</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Management</CardTitle>
          <CardDescription>
            Manage your students and their information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow
                    key={student.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewStudent(student)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {student.firstName} {student.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.grade}</TableCell>
                    <TableCell>{student.group}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getPerformanceBadgeVariant(
                          student.performance,
                        )}
                      >
                        {student.performance}
                      </Badge>
                    </TableCell>
                    <TableCell>{student.joinDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditStudent(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No students found matching your search.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog
        open={!!editingStudent}
        onOpenChange={() => setEditingStudent(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editFirstName" className="text-right">
                First Name
              </Label>
              <Input
                id="editFirstName"
                value={newStudent.firstName}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, firstName: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editLastName" className="text-right">
                Last Name
              </Label>
              <Input
                id="editLastName"
                value={newStudent.lastName}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, lastName: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editEmail" className="text-right">
                Email
              </Label>
              <Input
                id="editEmail"
                type="email"
                value={newStudent.email}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, email: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editGrade" className="text-right">
                Grade
              </Label>
              <Input
                id="editGrade"
                value={newStudent.grade}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, grade: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editGroup" className="text-right">
                Group
              </Label>
              <Select
                value={newStudent.group}
                onValueChange={(value) =>
                  setNewStudent({ ...newStudent, group: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Advanced Math">Advanced Math</SelectItem>
                  <SelectItem value="Basic Math">Basic Math</SelectItem>
                  <SelectItem value="Geometry">Geometry</SelectItem>
                  <SelectItem value="Statistics">Statistics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editPerformance" className="text-right">
                Performance
              </Label>
              <Select
                value={newStudent.performance}
                onValueChange={(value: Student["performance"]) =>
                  setNewStudent({ ...newStudent, performance: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Average">Average</SelectItem>
                  <SelectItem value="Needs Improvement">
                    Needs Improvement
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateStudent}>Update Student</Button>
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
                            className={`text-2xl font-bold ${workload.upcomingDeadlines > 2 ? "text-red-600" : "text-orange-600"}`}
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
                const totalProgress = progress?.assignments.reduce(
                  (acc, assignment) => acc + assignment.progress,
                  0,
                );
                return (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Assignment Progress ({totalProgress})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {progress?.assignments.map((assignment) => {
                          const aiPromptsUsed = assignment.solutions.reduce(
                            (acc, solution) => acc + solution.aiPrompts.length,
                            0,
                          );
                          return (
                            <div
                              key={`${assignment.assignmentId}-${viewingStudent.id}`}
                              className="rounded-lg border p-4"
                            >
                              <div className="mb-3 flex items-start justify-between">
                                <div className="space-y-1">
                                  <h4 className="font-medium">
                                    {assignment.assignmentTitle}
                                  </h4>
                                  <div className="flex items-center space-x-2">
                                    <Badge
                                      variant={getProgressStatusBadgeVariant(
                                        assignment.status,
                                      )}
                                    >
                                      {assignment.status}
                                    </Badge>
                                    {assignment.score !== undefined && (
                                      <Badge variant="outline">
                                        {assignment.score}/{assignment.maxScore}{" "}
                                        (
                                        {Math.round(
                                          (assignment.score /
                                            (assignment.maxScore ?? 0)) *
                                            100,
                                        )}
                                        %)
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right text-sm text-muted-foreground">
                                  Last activity:{" "}
                                  {formatLastActivity(assignment.lastActivity)}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                                <div className="space-y-1">
                                  <p className="text-muted-foreground">
                                    Time Spent
                                  </p>
                                  <p className="font-medium">
                                    {assignment.timeSpent} minutes
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-muted-foreground">
                                    AI Prompts Used
                                  </p>
                                  <p className="font-medium">
                                    {aiPromptsUsed} prompts
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-muted-foreground">
                                    Progress
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    <div className="h-2 flex-1 rounded-full bg-gray-200">
                                      <div
                                        className="h-2 rounded-full bg-blue-600 transition-all"
                                        style={{
                                          width: `${assignment.progress}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="font-medium">
                                      {assignment.progress}%
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-muted-foreground">
                                    Status
                                  </p>
                                  <p className="font-medium">
                                    {assignment.status}
                                  </p>
                                </div>
                              </div>

                              {/* AI Usage Warning */}
                              {assignment.solutions.reduce(
                                (acc, solution) =>
                                  acc + solution.aiPrompts.length,
                                0,
                              ) > 10 && (
                                <div className="mt-3 rounded border border-yellow-200 bg-yellow-50 p-2 text-sm">
                                  <p className="text-yellow-800">
                                    <strong>High AI Usage:</strong> This student
                                    has used {aiPromptsUsed} AI prompts.
                                    Consider checking if they need additional
                                    support.
                                  </p>
                                </div>
                              )}

                              {/* Overdue Warning */}
                              {assignment.status === "Overdue" && (
                                <div className="mt-3 rounded border border-red-200 bg-red-50 p-2 text-sm">
                                  <p className="text-red-800">
                                    <strong>Overdue Assignment:</strong> This
                                    assignment is past due. Consider reaching
                                    out to the student.
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}

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
            {viewingStudent && (
              <AiStudentEvaluation studentId={viewingStudent.id} />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingStudent(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (viewingStudent) {
                  handleEditStudent(viewingStudent);
                  setViewingStudent(null);
                }
              }}
            >
              Edit Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
