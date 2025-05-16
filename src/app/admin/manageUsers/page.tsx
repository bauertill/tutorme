import { Suspense } from "react";
import { UserManagement } from "./UserManagement";

export default function ManageUsersPage() {
  return (
    <div className="space-y-8 p-8">
      <Suspense fallback={<div>Loading...</div>}>
        <UserManagement />
      </Suspense>
    </div>
  );
}
