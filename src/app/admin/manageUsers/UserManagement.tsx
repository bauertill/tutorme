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
import { MoreVertical, X } from "lucide-react";
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
          <Dialog>
            <DialogTrigger asChild>
              <Button>Create Group</Button>
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
                  <label htmlFor="description" className="text-sm font-medium">
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
                  disabled={createGroup.isPending}
                >
                  {createGroup.isPending ? "Creating..." : "Create Group"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
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
            {groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{group.name}</div>
                    {group.description && (
                      <div className="text-sm text-muted-foreground">
                        {group.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {group.users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{user.name ?? user.email ?? "Unknown User"}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveUser(group.id, user.id)}
                          disabled={removeUserFromGroup.isPending}
                          className="h-6 w-6"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
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
                            group.description || "",
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
