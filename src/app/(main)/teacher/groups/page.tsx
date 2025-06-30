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
import { Textarea } from "@/components/ui/textarea";
import { getStudentGroups } from "@/core/teacher/groups/groups.domain";
import { StudentGroup } from "@/core/teacher/groups/groups.types";
import { getStudents } from "@/core/teacher/students/students.domain";
import { Student } from "@/core/teacher/students/students.types";
import { Edit, Plus, Trash2, UserPlus, Users } from "lucide-react";
import { useState } from "react";

export default function GroupsPage() {
  const initialGroups = getStudentGroups();
  const availableStudents = getStudents();

  const [groups, setGroups] = useState<StudentGroup[]>(initialGroups);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<StudentGroup | null>(null);
  const [manageStudentsGroup, setManageStudentsGroup] =
    useState<StudentGroup | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    subject: "",
    color: "blue",
  });

  const handleAddGroup = () => {
    const group: StudentGroup = {
      id: Date.now().toString(),
      ...newGroup,
      studentIds: [],
      createdDate: new Date().toISOString().split("T")[0] ?? "",
      grade: "",
    };
    setGroups([...groups, group]);
    setNewGroup({
      name: "",
      description: "",
      subject: "",
      color: "blue",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditGroup = (group: StudentGroup) => {
    setEditingGroup(group);
    setNewGroup({
      name: group.name,
      description: group.description,
      subject: group.subject,
      color: group.color,
    });
  };

  const handleUpdateGroup = () => {
    if (editingGroup) {
      setGroups(
        groups.map((g) =>
          g.id === editingGroup.id ? { ...editingGroup, ...newGroup } : g,
        ),
      );
      setEditingGroup(null);
      setNewGroup({
        name: "",
        description: "",
        subject: "",
        color: "blue",
      });
    }
  };

  const handleDeleteGroup = (id: string) => {
    setGroups(groups.filter((g) => g.id !== id));
  };

  const handleManageStudents = (group: StudentGroup) => {
    setManageStudentsGroup(group);
    const students = group.studentIds
      .map((id) => availableStudents.find((s) => s.id === id))
      .filter((s) => s !== undefined);
    setSelectedStudents(students);
  };

  const handleUpdateGroupStudents = () => {
    if (manageStudentsGroup) {
      setGroups(
        groups.map((g) =>
          g.id === manageStudentsGroup.id
            ? {
                ...g,
                students: selectedStudents,
                studentCount: selectedStudents.length,
              }
            : g,
        ),
      );
      setManageStudentsGroup(null);
      setSelectedStudents([]);
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "border-blue-200 bg-blue-50";
      case "green":
        return "border-green-200 bg-green-50";
      case "purple":
        return "border-purple-200 bg-purple-50";
      case "orange":
        return "border-orange-200 bg-orange-50";
      case "red":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Student Groups</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>
                Create a new student group for organizing assignments.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="e.g., Advanced Math"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">
                  Subject
                </Label>
                <Select
                  value={newGroup.subject}
                  onValueChange={(value) =>
                    setNewGroup({ ...newGroup, subject: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Geometry">Geometry</SelectItem>
                    <SelectItem value="Statistics">Statistics</SelectItem>
                    <SelectItem value="Algebra">Algebra</SelectItem>
                    <SelectItem value="Calculus">Calculus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  Color
                </Label>
                <Select
                  value={newGroup.color}
                  onValueChange={(value) =>
                    setNewGroup({ ...newGroup, color: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newGroup.description}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, description: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Group description..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddGroup}>Create Group</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card
            key={group.id}
            className={`${getColorClasses(group.color)} border-2`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </div>
                <Badge variant="secondary">{group.subject}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {group.studentIds.length} students
                </span>
              </div>

              {group.studentIds.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Recent students:</p>
                  <div className="flex flex-wrap gap-1">
                    {group.studentIds.slice(0, 3).map((studentId) => (
                      <Badge
                        key={studentId}
                        variant="outline"
                        className="text-xs"
                      >
                        {
                          availableStudents.find((s) => s.id === studentId)
                            ?.firstName
                        }
                      </Badge>
                    ))}
                    {group.studentIds.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{group.studentIds.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleManageStudents(group)}
                  className="flex-1"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Manage
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditGroup(group)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteGroup(group.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Group Dialog */}
      <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>Update group information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editName" className="text-right">
                Name
              </Label>
              <Input
                id="editName"
                value={newGroup.name}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editSubject" className="text-right">
                Subject
              </Label>
              <Select
                value={newGroup.subject}
                onValueChange={(value) =>
                  setNewGroup({ ...newGroup, subject: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Geometry">Geometry</SelectItem>
                  <SelectItem value="Statistics">Statistics</SelectItem>
                  <SelectItem value="Algebra">Algebra</SelectItem>
                  <SelectItem value="Calculus">Calculus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editColor" className="text-right">
                Color
              </Label>
              <Select
                value={newGroup.color}
                onValueChange={(value) =>
                  setNewGroup({ ...newGroup, color: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editDescription" className="text-right">
                Description
              </Label>
              <Textarea
                id="editDescription"
                value={newGroup.description}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, description: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateGroup}>Update Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Students Dialog */}
      <Dialog
        open={!!manageStudentsGroup}
        onOpenChange={() => setManageStudentsGroup(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Manage Students - {manageStudentsGroup?.name}
            </DialogTitle>
            <DialogDescription>
              Add or remove students from this group.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto py-4">
            <div className="space-y-3">
              {availableStudents.map((student) => (
                <div key={student.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={student.id}
                    checked={selectedStudents.some((s) => s.id === student.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedStudents([...selectedStudents, student]);
                      } else {
                        setSelectedStudents(
                          selectedStudents.filter((s) => s.id !== student.id),
                        );
                      }
                    }}
                  />
                  <Label htmlFor={student.id} className="flex-1 cursor-pointer">
                    <div className="flex justify-between">
                      <span>{student.firstName}</span>
                      <Badge variant="outline" className="text-xs">
                        {student.grade}
                      </Badge>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <div className="flex w-full justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedStudents.length} students selected
              </p>
              <Button onClick={handleUpdateGroupStudents}>Update Group</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
