import { DBAdapter } from '@/core/adapters/dbAdapter'
import { notFound } from 'next/navigation'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { userId: string }
}) {
  const userId = searchParams.userId
  if (!userId) {
    notFound()
  }

  const db = new DBAdapter()
  const user = await db.getUserById(parseInt(userId))
  const goals = await db.getUserGoals(parseInt(userId))

  if (!user) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{user.name}'s Dashboard</h1>
        <p className="text-gray-600">{user.email}</p>
      </div>

      <div className="grid gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Goals</h2>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Add New Goal
          </button>
        </div>

        <div className="grid gap-4">
          {goals.length === 0 ? (
            <p className="text-gray-500">No goals yet. Add your first goal to get started!</p>
          ) : (
            goals.map((goal) => (
              <div
                key={goal.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium mb-2">{goal.goal}</h3>
                  </div>
                </div>
                
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 