import { DBAdapter } from "@/core/adapters/dbAdapter";
import Link from "next/link";

export async function UserList() {
  const db = new DBAdapter();
  const users = await db.getAllUsers();

  return (
    <div className="divide-y divide-gray-700">
      {users.map(user => (
        <Link
          key={user.id}
          href={`/dashboard?userId=${user.id}`}
          className="flex items-center p-4 hover:bg-gray-800 transition-colors group"
        >
          <div className="flex-1">
            <h3 className="font-medium text-gray-100 group-hover:text-gray-50">
              {user.name}
            </h3>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
