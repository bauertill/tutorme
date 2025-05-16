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

export function UserManagement() {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [editingGroup, setEditingGroup] = useState<{
    id: string;
    name: string;
    description: string;
  } | null>(null);

  const { data: users = [] } = api.admin.getUsers.useQuery();
  const { data: groups = [], refetch: refetchGroups } =
    api.admin.getGroups.useQuery();

  const createGroup = api.admin.createGroup.useMutation({
    onSuccess: () => {
      setSelectedUsers(new Set());
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

  const removeUserFromGroup = api.admin.removeUserFromGroup.useMutation({
    onSuccess: () => {
      void refetchGroups();
    },
  });

  const addUserToGroup = api.admin.addUserToGroup.useMutation({
    onSuccess: () => {
      void refetchGroups();
    },
  });

  const allSelected = users.length > 0 && selectedUsers.size === users.length;
  const someSelected =
    selectedUsers.size > 0 && selectedUsers.size < users.length;

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    }
  };

  const handleUserSelect = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleCreateGroup = () => {
    createGroup.mutate({
      name: newGroupName,
      description: newGroupDescription,
      userIds: Array.from(selectedUsers),
    });
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      deleteGroup.mutate({ groupId });
    }
  };

  const handleRemoveUser = (groupId: string, userId: string) => {
    removeUserFromGroup.mutate({ groupId, userId });
  };

  const handleAddUser = (groupId: string, userId: string) => {
    addUserToGroup.mutate({ groupId, userId });
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
          <CardTitle>User Management</CardTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={selectedUsers.size === 0}>
                  Add to Group
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {groups.map((group) => (
                  <DropdownMenuItem
                    key={group.id}
                    onClick={() => {
                      // Add selected users to the group, ignoring those already in it
                      const usersToAdd = Array.from(selectedUsers).filter(
                        (userId) =>
                          !group.users.some((user) => user.id === userId),
                      );
                      if (usersToAdd.length > 0) {
                        usersToAdd.forEach((userId) => {
                          handleAddUser(group.id, userId);
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
                <Button disabled={selectedUsers.size === 0}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>
                    Create a new group and add selected users to it.
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
                    aria-label="Select all users"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subscription Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.has(user.id)}
                      onCheckedChange={() => handleUserSelect(user.id)}
                    />
                  </TableCell>
                  <TableCell>{user.name ?? "N/A"}</TableCell>
                  <TableCell>{user.email ?? "N/A"}</TableCell>
                  <TableCell>
                    {user.subscription?.status ?? "No Subscription"}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
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
              {groups.map((group) => (
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
                      {group.users.map((user) => (
                        <div
                          key={user.id}
                          className="mb-1 flex items-center gap-1 rounded bg-muted px-2 py-1 text-sm"
                        >
                          <span>
                            {user.name ?? user.email ?? "Unknown User"}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveUser(group.id, user.id)}
                            disabled={removeUserFromGroup.isPending}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
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
