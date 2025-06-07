"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import { MoreVertical, Plus, X } from "lucide-react";
import { useState } from "react";

export function StudentManagement() {
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set(),
  );
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [editingGroup, setEditingGroup] = useState<{
    id: string;
    name: string;
    description: string;
  } | null>(null);

  const { data: students = [], isLoading: studentsLoading } =
    api.admin.getStudents.useQuery();
  const {
    data: groups = [],
    isLoading: groupsLoading,
    refetch: refetchGroups,
  } = api.admin.getGroups.useQuery();

  const createGroup = api.admin.createGroup.useMutation({
    onSuccess: () => {
      setSelectedStudents(new Set());
      setNewGroupName("");
      setNewGroupDescription("");
      void refetchGroups();
    },
  });

  const deleteGroup = api.admin.deleteGroup.useMutation({
    onSuccess: () => {
      void refetchGroups();
    },
  });

  const editGroup = api.admin.editGroup.useMutation({
    onSuccess: () => {
      void refetchGroups();
      setEditingGroup(null);
    },
  });

  const removeStudentFromGroup = api.admin.removeStudentFromGroup.useMutation({
    onSuccess: () => {
      void refetchGroups();
    },
  });

  const addStudentToGroup = api.admin.addStudentToGroup.useMutation({
    onSuccess: () => {
      void refetchGroups();
    },
  });

  const allSelected =
    students.length > 0 && selectedStudents.size === students.length;

  const handleSelectAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map((u) => u.id)));
    }
  };

  const handleStudentSelect = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleCreateGroup = () => {
    createGroup.mutate({
      name: newGroupName,
      description: newGroupDescription,
      studentIds: Array.from(selectedStudents),
    });
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      deleteGroup.mutate({ groupId });
    }
  };

  const handleRemoveStudent = (groupId: string, studentId: string) => {
    removeStudentFromGroup.mutate({ groupId, studentId });
  };

  const handleAddStudent = (groupId: string, studentId: string) => {
    addStudentToGroup.mutate({ groupId, studentId });
  };

  const handleEditGroup = (
    groupId: string,
    name: string,
    description: string,
  ) => {
    setEditingGroup({ id: groupId, name, description });
  };

  const handleSaveEdit = () => {
    if (editingGroup) {
      editGroup.mutate({
        groupId: editingGroup.id,
        name: editingGroup.name,
        description: editingGroup.description,
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Student Management</CardTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={selectedStudents.size === 0}
                >
                  Add to Group
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {groups.map((group) => (
                  <DropdownMenuItem
                    key={group.id}
                    onClick={() => {
                      // Add selected students to the group, ignoring those already in it
                      const studentsToAdd = Array.from(selectedStudents).filter(
                        (studentId) =>
                          !group.students.some(
                            (student) => student.id === studentId,
                          ),
                      );
                      if (studentsToAdd.length > 0) {
                        studentsToAdd.forEach((studentId) => {
                          handleAddStudent(group.id, studentId);
                        });
                      }
                    }}
                  >
                    {group.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog>
              <DialogTrigger asChild>
                <Button disabled={selectedStudents.size === 0}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>
                    Create a new group and add selected students to it.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Group Name
                    </label>
                    <input
                      id="name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateGroup}
                    disabled={createGroup.isPending || !newGroupName}
                  >
                    {createGroup.isPending ? "Creating..." : "Create Group"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all students"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subscription Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-4 rounded-sm" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                    </TableRow>
                  ))
                : students.map(({ id, user, createdAt }) => (
                    <TableRow key={id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedStudents.has(id)}
                          onCheckedChange={() => handleStudentSelect(id)}
                        />
                      </TableCell>
                      <TableCell>{user.name ?? "N/A"}</TableCell>
                      <TableCell>{user.email ?? "N/A"}</TableCell>
                      <TableCell>
                        {user.subscription?.status ?? "No Subscription"}
                      </TableCell>
                      <TableCell>
                        {new Date(createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Group Details</TableHead>
                <TableHead className="w-[60%]">Members</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupsLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="w-[40%]">
                        <Skeleton className="mb-2 h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </TableCell>
                      <TableCell className="w-[60%]">
                        <div className="flex flex-wrap gap-2">
                          {Array.from({ length: 3 }).map((_, j) => (
                            <Skeleton
                              key={j}
                              className="h-6 w-20 rounded px-2"
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="w-[50px]">
                        <Skeleton className="h-6 w-6 rounded-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : groups.map((group) => (
                    <TableRow key={group.id} className="h-full">
                      <TableCell className="w-[40%]">
                        <div className="space-y-1">
                          <div className="font-medium">{group.name}</div>
                          {group.description && (
                            <div className="text-sm text-muted-foreground">
                              {group.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="w-[60%]">
                        <div className="flex flex-wrap gap-2">
                          {group.students.map(({ id, user }) => (
                            <div
                              key={id}
                              className="mb-1 flex items-center gap-1 rounded bg-muted px-2 py-1 text-sm"
                            >
                              <span>
                                {user.name ?? user.email ?? "Unknown User"}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleRemoveStudent(group.id, id)
                                }
                                disabled={removeStudentFromGroup.isPending}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="w-[50px]">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleEditGroup(
                                  group.id,
                                  group.name,
                                  group.description ?? "",
                                )
                              }
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteGroup(group.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Update the group name and description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Group Name
              </label>
              <input
                id="edit-name"
                value={editingGroup?.name ?? ""}
                onChange={(e) =>
                  setEditingGroup((prev) =>
                    prev ? { ...prev, name: e.target.value } : null,
                  )
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="edit-description"
                value={editingGroup?.description ?? ""}
                onChange={(e) =>
                  setEditingGroup((prev) =>
                    prev ? { ...prev, description: e.target.value } : null,
                  )
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
