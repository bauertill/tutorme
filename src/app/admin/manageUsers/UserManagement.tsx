"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useState } from "react";

export function UserManagement() {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");

  const { data: users = [] } = api.admin.getUsers.useQuery();
  const { data: groups = [] } = api.admin.getGroups.useQuery();
  const createGroup = api.admin.createGroup.useMutation({
    onSuccess: () => {
      setSelectedUsers(new Set());
      setNewGroupName("");
      setNewGroupDescription("");
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
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.id} className="rounded-lg border p-4">
                <h3 className="font-semibold">{group.name}</h3>
                {group.description && (
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>
                )}
                <div className="mt-2">
                  <h4 className="mb-2 text-sm font-medium">Members:</h4>
                  <ul className="space-y-1">
                    {group.users.map((user) => (
                      <li key={user.id} className="text-sm">
                        {user.name ?? user.email ?? "Unknown User"}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
