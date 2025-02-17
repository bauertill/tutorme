import { AddUserButton } from "@/components/AddUserButton"
import { UserList } from "@/components/UserList"
import "@/app/globals.css"

export default function Home() {
  return (
    <main className="min-h-screen p-8 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">Select User to Sign In</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <UserList />
          <AddUserButton />
        </div>
      </div>
    </main>
  )
}
