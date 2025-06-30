"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, BookOpen, Users, Target, TrendingUp, CheckCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { toast } from "@/components/ui/use-toast"

// Mock data for books and topics
const books = [
  {
    id: "math-eng",
    title: "Mathematik für Ingenieure",
    author: "Dr. Schmidt",
    chapters: 12,
    totalProblems: 450,
    topics: [
      { id: "algebra", name: "Algebra Basics", difficulty: 2, problems: 45, estimatedHours: 8, prerequisites: [] },
      {
        id: "quadratic",
        name: "Quadratic Equations",
        difficulty: 3,
        problems: 38,
        estimatedHours: 12,
        prerequisites: ["algebra"],
      },
      {
        id: "functions",
        name: "Functions & Graphs",
        difficulty: 3,
        problems: 42,
        estimatedHours: 10,
        prerequisites: ["algebra"],
      },
      {
        id: "trigonometry",
        name: "Trigonometry",
        difficulty: 4,
        problems: 35,
        estimatedHours: 15,
        prerequisites: ["functions"],
      },
      {
        id: "calculus-intro",
        name: "Introduction to Calculus",
        difficulty: 4,
        problems: 50,
        estimatedHours: 18,
        prerequisites: ["functions", "trigonometry"],
      },
      {
        id: "derivatives",
        name: "Derivatives",
        difficulty: 5,
        problems: 55,
        estimatedHours: 20,
        prerequisites: ["calculus-intro"],
      },
      {
        id: "integrals",
        name: "Integrals",
        difficulty: 5,
        problems: 48,
        estimatedHours: 22,
        prerequisites: ["derivatives"],
      },
      {
        id: "differential-eq",
        name: "Differential Equations",
        difficulty: 6,
        problems: 40,
        estimatedHours: 25,
        prerequisites: ["integrals"],
      },
    ],
  },
  {
    id: "physics-mech",
    title: "Physics: Mechanics",
    author: "Prof. Weber",
    chapters: 8,
    totalProblems: 320,
    topics: [
      { id: "kinematics", name: "Kinematics", difficulty: 3, problems: 40, estimatedHours: 12, prerequisites: [] },
      {
        id: "dynamics",
        name: "Dynamics",
        difficulty: 4,
        problems: 45,
        estimatedHours: 15,
        prerequisites: ["kinematics"],
      },
      {
        id: "energy",
        name: "Energy & Work",
        difficulty: 4,
        problems: 38,
        estimatedHours: 14,
        prerequisites: ["dynamics"],
      },
      {
        id: "momentum",
        name: "Momentum",
        difficulty: 4,
        problems: 35,
        estimatedHours: 13,
        prerequisites: ["dynamics"],
      },
      {
        id: "rotation",
        name: "Rotational Motion",
        difficulty: 5,
        problems: 42,
        estimatedHours: 18,
        prerequisites: ["energy", "momentum"],
      },
    ],
  },
]

const groups = [
  { id: "advanced-math", name: "Advanced Math Group", students: 24, level: "Advanced" },
  { id: "regular-math", name: "Regular Math Group", students: 28, level: "Intermediate" },
  { id: "physics-a", name: "Physics Group A", students: 22, level: "Advanced" },
  { id: "physics-b", name: "Physics Group B", students: 26, level: "Beginner" },
]

// Assignment interface to match the existing system
interface Assignment {
  id: string
  title: string
  description: string
  subject: string
  dueDate: string
  estimatedTime: number
  difficulty: "Easy" | "Medium" | "Hard"
  status: "Draft" | "Active" | "Completed"
  assignedGroups: string[]
  createdDate: string
  book?: string
  chapters?: string[]
  bookProblems?: any[]
  customProblems?: any[]
  generatedFromPlan?: boolean
  planWeek?: number
}

export default function SemesterPlanningPage() {
  const router = useRouter()
  const [selectedBook, setSelectedBook] = useState<string>("")
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [semesterWeeks, setSemesterWeeks] = useState([16])
  const [problemsPerWeek, setProblemsPerWeek] = useState([5])
  const [maxHoursPerWeek, setMaxHoursPerWeek] = useState([3])
  const [difficultyProgression, setDifficultyProgression] = useState("adaptive")
  const [includeReviews, setIncludeReviews] = useState(true)
  const [reviewFrequency, setReviewFrequency] = useState([4])
  const [startDate, setStartDate] = useState("2025-08-25")
  const [generatedPlan, setGeneratedPlan] = useState<any>(null)
  const [isCreatingAssignments, setIsCreatingAssignments] = useState(false)

  const selectedBookData = books.find((book) => book.id === selectedBook)
  const selectedGroupData = groups.find((group) => group.id === selectedGroup)
  const selectedTopicsData = selectedBookData?.topics.filter((topic) => selectedTopics.includes(topic.id)) || []

  const totalProblems = selectedTopicsData.reduce((sum, topic) => sum + topic.problems, 0)
  const totalHours = selectedTopicsData.reduce((sum, topic) => sum + topic.estimatedHours, 0)
  const averageDifficulty =
    selectedTopicsData.length > 0
      ? selectedTopicsData.reduce((sum, topic) => sum + topic.difficulty, 0) / selectedTopicsData.length
      : 0

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics((prev) => (prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]))
  }

  const generateSemesterPlan = () => {
    if (!selectedBookData || selectedTopics.length === 0) return

    // Topological sort for prerequisites
    const sortedTopics = topologicalSort(selectedTopicsData)

    // Generate weekly schedule
    const weeks = []
    const totalWeeks = semesterWeeks[0]
    const reviewWeeks = includeReviews ? Math.floor(totalWeeks / reviewFrequency[0]) : 0
    const contentWeeks = totalWeeks - reviewWeeks

    const currentDate = new Date(startDate)
    let topicIndex = 0
    let problemsInCurrentTopic = 0

    for (let week = 1; week <= totalWeeks; week++) {
      const isReviewWeek = includeReviews && week % reviewFrequency[0] === 0 && week < totalWeeks

      if (isReviewWeek) {
        weeks.push({
          week,
          startDate: new Date(currentDate),
          type: "review",
          title: "Review Week",
          topics: [],
          problems: [],
          totalProblems: Math.min(problemsPerWeek[0], 10),
          estimatedHours: maxHoursPerWeek[0] * 0.8,
        })
      } else if (topicIndex < sortedTopics.length) {
        const currentTopic = sortedTopics[topicIndex]
        const remainingProblemsInTopic = currentTopic.problems - problemsInCurrentTopic
        const problemsThisWeek = Math.min(problemsPerWeek[0], remainingProblemsInTopic)

        // Generate sample problems for this week
        const weekProblems = Array.from({ length: problemsThisWeek }, (_, i) => ({
          id: `${currentTopic.id}-${problemsInCurrentTopic + i + 1}`,
          title: `${currentTopic.name} - Problem ${problemsInCurrentTopic + i + 1}`,
          difficulty: currentTopic.difficulty,
          estimatedTime: Math.round((currentTopic.estimatedHours / currentTopic.problems) * 60),
          solution: "Solution will be provided after submission",
          problemText: `Solve this ${currentTopic.name.toLowerCase()} problem: [Problem ${problemsInCurrentTopic + i + 1}]`,
          topic: currentTopic.name,
        }))

        weeks.push({
          week,
          startDate: new Date(currentDate),
          type: "content",
          title: `Week ${week}: ${currentTopic.name}`,
          topics: [currentTopic],
          problems: weekProblems,
          totalProblems: problemsThisWeek,
          estimatedHours: (currentTopic.estimatedHours / currentTopic.problems) * problemsThisWeek,
          learningObjectives: [
            `Master ${currentTopic.name} concepts`,
            `Solve ${problemsThisWeek} practice problems`,
            `Apply knowledge to real-world scenarios`,
          ],
        })

        problemsInCurrentTopic += problemsThisWeek

        if (problemsInCurrentTopic >= currentTopic.problems) {
          topicIndex++
          problemsInCurrentTopic = 0
        }
      }

      currentDate.setDate(currentDate.getDate() + 7)
    }

    setGeneratedPlan({
      book: selectedBookData,
      group: selectedGroupData,
      topics: selectedTopicsData,
      weeks,
      summary: {
        totalWeeks: totalWeeks,
        contentWeeks,
        reviewWeeks,
        totalProblems: weeks.reduce((sum, week) => sum + week.totalProblems, 0),
        totalHours: weeks.reduce((sum, week) => sum + week.estimatedHours, 0),
        averageDifficulty: averageDifficulty.toFixed(1),
      },
    })
  }

  // Simple topological sort for prerequisites
  const topologicalSort = (topics: any[]) => {
    const sorted = []
    const visited = new Set()
    const visiting = new Set()

    const visit = (topic: any) => {
      if (visiting.has(topic.id)) return // Circular dependency
      if (visited.has(topic.id)) return

      visiting.add(topic.id)

      // Visit prerequisites first
      topic.prerequisites.forEach((prereqId: string) => {
        const prereq = topics.find((t) => t.id === prereqId)
        if (prereq) visit(prereq)
      })

      visiting.delete(topic.id)
      visited.add(topic.id)
      sorted.push(topic)
    }

    topics.forEach(visit)
    return sorted
  }

  const mapDifficultyToAssignment = (topicDifficulty: number): "Easy" | "Medium" | "Hard" => {
    if (topicDifficulty <= 2) return "Easy"
    if (topicDifficulty <= 4) return "Medium"
    return "Hard"
  }

  const createAssignmentsFromPlan = async () => {
    if (!generatedPlan) return

    setIsCreatingAssignments(true)

    try {
      // Get existing assignments from localStorage or initialize empty array
      const existingAssignments = JSON.parse(localStorage.getItem("assignments") || "[]")
      const newAssignments: Assignment[] = []

      // Create assignments for content weeks only
      const contentWeeks = generatedPlan.weeks.filter((week: any) => week.type === "content")

      for (const week of contentWeeks) {
        if (week.problems.length === 0) continue

        // Calculate due date (end of the week)
        const dueDate = new Date(week.startDate)
        dueDate.setDate(dueDate.getDate() + 6) // End of week

        // Convert week problems to assignment format
        const customProblems = week.problems.map((problem: any) => ({
          id: problem.id,
          problemText: problem.problemText,
          solution: problem.solution,
          difficulty: mapDifficultyToAssignment(problem.difficulty),
          estimatedTime: problem.estimatedTime,
          topic: problem.topic,
        }))

        const assignment: Assignment = {
          id: `semester-plan-${Date.now()}-week-${week.week}`,
          title: week.title,
          description: `Auto-generated assignment from semester plan. ${week.learningObjectives.join(". ")}.`,
          subject: generatedPlan.book.title.includes("Math") ? "Mathematics" : "Physics",
          dueDate: dueDate.toISOString().split("T")[0],
          estimatedTime: Math.round(week.estimatedHours * 60), // Convert to minutes
          difficulty: mapDifficultyToAssignment(week.topics.length > 0 ? week.topics[0].difficulty : 3),
          status: "Draft",
          assignedGroups: [generatedPlan.group.name],
          createdDate: new Date().toISOString().split("T")[0],
          book: generatedPlan.book.title,
          chapters: week.topics.map((topic: any) => topic.name),
          customProblems,
          generatedFromPlan: true,
          planWeek: week.week,
        }

        newAssignments.push(assignment)
      }

      // Save all assignments to localStorage
      const allAssignments = [...existingAssignments, ...newAssignments]
      localStorage.setItem("assignments", JSON.stringify(allAssignments))

      // Show success message
      toast({
        title: "Assignments Created Successfully!",
        description: `Created ${newAssignments.length} assignments from your semester plan. You can now view and manage them in the Assignments page.`,
      })

      // Navigate to assignments page after a short delay
      setTimeout(() => {
        router.push("/assignments")
      }, 2000)
    } catch (error) {
      console.error("Error creating assignments:", error)
      toast({
        title: "Error Creating Assignments",
        description: "There was an error creating assignments from your semester plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingAssignments(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Semester Planning</h2>
            <p className="text-muted-foreground">Create an automated semester-long learning timeline from textbooks</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProblems}</div>
            <p className="text-xs text-muted-foreground">From {selectedTopics.length} selected topics</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}h</div>
            <p className="text-xs text-muted-foreground">
              ~{Math.round(totalHours / (semesterWeeks[0] || 1))}h per week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Difficulty</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageDifficulty.toFixed(1)}/6</div>
            <p className="text-xs text-muted-foreground">
              {averageDifficulty < 3 ? "Beginner" : averageDifficulty < 5 ? "Intermediate" : "Advanced"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Book & Topic Selection
              </CardTitle>
              <CardDescription>Choose a textbook and select the topics to cover this semester</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="book-select">Select Textbook</Label>
                <Select value={selectedBook} onValueChange={setSelectedBook}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a textbook..." />
                  </SelectTrigger>
                  <SelectContent>
                    {books.map((book) => (
                      <SelectItem key={book.id} value={book.id}>
                        <div className="flex flex-col">
                          <span>{book.title}</span>
                          <span className="text-sm text-muted-foreground">
                            {book.author} • {book.totalProblems} problems
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedBookData && (
                <div className="space-y-3">
                  <Label>Topics to Cover ({selectedTopics.length} selected)</Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedBookData.topics.map((topic) => (
                      <div key={topic.id} className="flex items-center space-x-2 p-2 border rounded">
                        <Checkbox
                          id={topic.id}
                          checked={selectedTopics.includes(topic.id)}
                          onCheckedChange={() => handleTopicToggle(topic.id)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={topic.id} className="text-sm font-medium">
                            {topic.name}
                          </Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {topic.problems} problems
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              ~{topic.estimatedHours}h
                            </Badge>
                            <div className="flex">
                              {Array.from({ length: topic.difficulty }, (_, i) => (
                                <div key={i} className="w-2 h-2 bg-orange-400 rounded-full mr-0.5" />
                              ))}
                            </div>
                          </div>
                          {topic.prerequisites.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Requires: {topic.prerequisites.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Group Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="group-select">Target Student Group</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student group..." />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex flex-col">
                          <span>{group.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {group.students} students • {group.level} level
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Semester Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Semester Length: {semesterWeeks[0]} weeks</Label>
                <Slider
                  value={semesterWeeks}
                  onValueChange={setSemesterWeeks}
                  max={20}
                  min={8}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Problems per Week: {problemsPerWeek[0]}</Label>
                <Slider
                  value={problemsPerWeek}
                  onValueChange={setProblemsPerWeek}
                  max={15}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Max Hours per Week: {maxHoursPerWeek[0]}h</Label>
                <Slider
                  value={maxHoursPerWeek}
                  onValueChange={setMaxHoursPerWeek}
                  max={8}
                  min={1}
                  step={0.5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-date">Semester Start Date</Label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
              </div>

              <div className="space-y-3">
                <Label>Difficulty Progression</Label>
                <Select value={difficultyProgression} onValueChange={setDifficultyProgression}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear - Steady increase</SelectItem>
                    <SelectItem value="adaptive">Adaptive - Based on group level</SelectItem>
                    <SelectItem value="mixed">Mixed - Varied difficulty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="include-reviews" checked={includeReviews} onCheckedChange={setIncludeReviews} />
                <Label htmlFor="include-reviews">Include Review Weeks</Label>
              </div>

              {includeReviews && (
                <div className="space-y-2">
                  <Label>Review Every {reviewFrequency[0]} Weeks</Label>
                  <Slider
                    value={reviewFrequency}
                    onValueChange={setReviewFrequency}
                    max={6}
                    min={2}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={generateSemesterPlan}
            className="w-full"
            size="lg"
            disabled={!selectedBook || selectedTopics.length === 0 || !selectedGroup}
          >
            Generate Semester Plan
          </Button>
        </div>
      </div>

      {/* Generated Plan Preview */}
      {generatedPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Generated Semester Plan
            </CardTitle>
            <CardDescription>
              {generatedPlan.summary.totalWeeks} weeks • {generatedPlan.summary.totalProblems} problems • ~
              {Math.round(generatedPlan.summary.totalHours)}h total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{generatedPlan.summary.contentWeeks}</div>
                <div className="text-sm text-muted-foreground">Content Weeks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{generatedPlan.summary.reviewWeeks}</div>
                <div className="text-sm text-muted-foreground">Review Weeks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{generatedPlan.summary.totalProblems}</div>
                <div className="text-sm text-muted-foreground">Total Problems</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{generatedPlan.summary.averageDifficulty}</div>
                <div className="text-sm text-muted-foreground">Avg Difficulty</div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h4 className="font-semibold">First 4 Weeks Preview:</h4>
              {generatedPlan.weeks.slice(0, 4).map((week: any) => (
                <div key={week.week} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{week.title}</h5>
                    <div className="flex items-center gap-2">
                      <Badge variant={week.type === "review" ? "secondary" : "default"}>
                        {week.type === "review" ? "Review" : "Content"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{week.startDate.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <p className="text-sm">
                        <strong>Problems:</strong> {week.totalProblems}
                      </p>
                      <p className="text-sm">
                        <strong>Est. Time:</strong> {Math.round(week.estimatedHours)}h
                      </p>
                    </div>
                    {week.learningObjectives && (
                      <div>
                        <p className="text-sm font-medium">Learning Objectives:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {week.learningObjectives.slice(0, 2).map((obj: string, i: number) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {week.problems.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Sample Problems:</p>
                      <div className="grid gap-2 md:grid-cols-2">
                        {week.problems.slice(0, 2).map((problem: any) => (
                          <div key={problem.id} className="text-sm p-2 bg-muted rounded">
                            <p className="font-medium">{problem.title}</p>
                            <p className="text-muted-foreground">~{problem.estimatedTime}min</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="outline">Export to Calendar</Button>
              <Button
                onClick={createAssignmentsFromPlan}
                disabled={isCreatingAssignments}
                className="flex items-center gap-2"
              >
                {isCreatingAssignments ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Assignments
                  </>
                )}
              </Button>
              <Button>Save Plan</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
