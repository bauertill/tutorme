import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import prisma from "@/lib/prisma";
import { type SubscriptionStatus } from "@prisma/client";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: Date;
  subscription?: {
    status: SubscriptionStatus;
  } | null;
}

async function getUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      subscription: {
        select: {
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
}

export default async function ManageUsersPage() {
  const users = await getUsers();

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subscription Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name ?? "N/A"}</TableCell>
                  <TableCell>{user.email ?? "N/A"}</TableCell>
                  <TableCell>
                    {user.subscription?.status ?? "No Subscription"}
                  </TableCell>
                  <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
