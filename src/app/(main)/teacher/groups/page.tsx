"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Edit, Trash2, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface StudentGroup {
  id: string
  name: string
  description: string
  subject: string
  studentCount: number
  students: string[]
  createdDate: string
  color: string
}

interface Student {
  id: string
  name: string
  grade: string
}

const initialGroups: StudentGroup[] = [
  {
    id: "1",
    name: "Advanced Math",
    description: "Students excelling in mathematics",
    subject: "Mathematics",
    studentCount: 12,
    students: ["Anna Müller", "Lisa Weber", "Max Schmidt"],
    createdDate: "2025-01-15",
    color: "blue",
  },
  {
    id: "2",
    name: "Basic Math",
    description: "Foundation mathematics group",
    subject: "Mathematics",
    studentCount: 18,
    students: ["Tom Fischer", "Sarah Klein", "Paul Wagner"],
    createdDate: "2025-02-20",
    color: "green",
  },
  {
    id: "3",
    name: "Geometry Focus",
    description: "Specialized geometry study group",
    subject: "Geometry",
    studentCount: 8,
    students: ["Emma Bauer", "Leon Hoffmann"],
    createdDate: "2025-03-01",
    color: "purple",
  },
]

const availableStudents: Student[] = [
  { id: "1", name: "Anna Müller", grade: "10A" },
  { id: "2", name: "Max Schmidt", grade: "10A" },
  { id: "3", name: "Lisa Weber", grade: "9B" },
  { id: "4", name: "Tom Fischer", grade: "9B" },
  { id: "5", name: "Sarah Klein", grade: "10B" },
  { id: "6", name: "Paul Wagner", grade: "9A" },
  { id: "7", name: "Emma Bauer", grade: "10A" },
  { id: "8", name: "Leon Hoffmann", grade: "9B" },
]

export default function GroupsPage() {
  const [groups, setGroups] = useState<StudentGroup[]>(initialGroups)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<StudentGroup | null>(null)
  const [manageStudentsGroup, setManageStudentsGroup] = useState<StudentGroup | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    subject: "",
    color: "blue",
  })

  const handleAddGroup = () => {
    const group: StudentGroup = {
      id: Date.now().toString(),
      ...newGroup,
      studentCount: 0,
      students: [],
      createdDate: new Date().toISOString().split("T")[0],
    }
    setGroups([...groups, group])
    setNewGroup({
      name: "",
      description: "",
      subject: "",
      color: "blue",
    })
    setIsAddDialogOpen(false)
  }

  const handleEditGroup = (group: StudentGroup) => {
    setEditingGroup(group)
    setNewGroup({
      name: group.name,
      description: group.description,
      subject: group.subject,
      color: group.color,
    })
  }

  const handleUpdateGroup = () => {
    if (editingGroup) {
      setGroups(groups.map((g) => (g.id === editingGroup.id ? { ...editingGroup, ...newGroup } : g)))
      setEditingGroup(null)
      setNewGroup({
        name: "",
        description: "",
        subject: "",
        color: "blue",
      })
    }
  }

  const handleDeleteGroup = (id: string) => {
    setGroups(groups.filter((g) => g.id !== id))
  }

  const handleManageStudents = (group: StudentGroup) => {
    setManageStudentsGroup(group)
    setSelectedStudents([...group.students])
  }

  const handleUpdateGroupStudents = () => {
    if (manageStudentsGroup) {
      setGroups(
        groups.map((g) =>
          g.id === manageStudentsGroup.id
            ? { ...g, students: selectedStudents, studentCount: selectedStudents.length }
            : g,
        ),
      )
      setManageStudentsGroup(null)
      setSelectedStudents([])
    }
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "border-blue-200 bg-blue-50"
      case "green":
        return "border-green-200 bg-green-50"
      case "purple":
        return "border-purple-200 bg-purple-50"
      case "orange":
        return "border-orange-200 bg-orange-50"
      case "red":
        return "border-red-200 bg-red-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Student Groups</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>Create a new student group for organizing assignments.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., Advanced Math"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">
                  Subject
                </Label>
                <Select
                  value={newGroup.subject}
                  onValueChange={(value) => setNewGroup({ ...newGroup, subject: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Geometry">Geometry</SelectItem>
                    <SelectItem value="Statistics">Statistics</SelectItem>
                    <SelectItem value="Algebra">Algebra</SelectItem>
                    <SelectItem value="Calculus">Calculus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  Color
                </Label>
                <Select value={newGroup.color} onValueChange={(value) => setNewGroup({ ...newGroup, color: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Group description..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddGroup}>Create Group</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.id} className={`${getColorClasses(group.color)} border-2`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </div>
                <Badge variant="secondary">{group.subject}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{group.studentCount} students</span>
              </div>

              {group.students.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Recent students:</p>
                  <div className="flex flex-wrap gap-1">
                    {group.students.slice(0, 3).map((student, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {student}
                      </Badge>
                    ))}
                    {group.students.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{group.students.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleManageStudents(group)} className="flex-1">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Manage
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEditGroup(group)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteGroup(group.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Group Dialog */}
      <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>Update group information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editName" className="text-right">
                Name
              </Label>
              <Input
                id="editName"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editSubject" className="text-right">
                Subject
              </Label>
              <Select value={newGroup.subject} onValueChange={(value) => setNewGroup({ ...newGroup, subject: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Geometry">Geometry</SelectItem>
                  <SelectItem value="Statistics">Statistics</SelectItem>
                  <SelectItem value="Algebra">Algebra</SelectItem>
                  <SelectItem value="Calculus">Calculus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editColor" className="text-right">
                Color
              </Label>
              <Select value={newGroup.color} onValueChange={(value) => setNewGroup({ ...newGroup, color: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editDescription" className="text-right">
                Description
              </Label>
              <Textarea
                id="editDescription"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateGroup}>Update Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Students Dialog */}
      <Dialog open={!!manageStudentsGroup} onOpenChange={() => setManageStudentsGroup(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Students - {manageStudentsGroup?.name}</DialogTitle>
            <DialogDescription>Add or remove students from this group.</DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {availableStudents.map((student) => (
                <div key={student.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={student.id}
                    checked={selectedStudents.includes(student.name)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedStudents([...selectedStudents, student.name])
                      } else {
                        setSelectedStudents(selectedStudents.filter((s) => s !== student.name))
                      }
                    }}
                  />
                  <Label htmlFor={student.id} className="flex-1 cursor-pointer">
                    <div className="flex justify-between">
                      <span>{student.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {student.grade}
                      </Badge>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <div className="flex justify-between w-full">
              <p className="text-sm text-muted-foreground">{selectedStudents.length} students selected</p>
              <Button onClick={handleUpdateGroupStudents}>Update Group</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
