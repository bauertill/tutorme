"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, BookOpen, Eye, CheckCircle, Clock, Package, X } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllBooks, getAllBookRequests, type Book, type BookRequest } from "@/lib/data"

interface BookProblem {
  id: string
  chapter: string
  section: string
  problemNumber: string
  difficulty: "Easy" | "Medium" | "Hard"
  topic: string
  problemText: string
  solution: string
  estimatedTime: number
}

// Mock German math books data with problems for ISBN search
const germanMathBooks: (Book & { problems?: BookProblem[] })[] = [
  {
    id: "search-1",
    title: "Mathematik für Ingenieure und Naturwissenschaftler",
    author: "Lothar Papula",
    isbn: "9783827420923",
    publisher: "Springer Vieweg",
    year: 2022,
    subject: "Engineering Mathematics",
    grade: "11",
    available: true,
    totalCopies: 0,
    availableCopies: 0,
    isScanned: true,
    problems: [
      {
        id: "1",
        chapter: "Kapitel 3",
        section: "3.1",
        problemNumber: "3.1.1",
        difficulty: "Easy",
        topic: "Lineare Gleichungen",
        problemText: "Lösen Sie die Gleichung: 2x + 5 = 13",
        solution: "x = 4\n\nLösungsweg:\n2x + 5 = 13\n2x = 13 - 5\n2x = 8\nx = 4",
        estimatedTime: 5,
      },
      {
        id: "2",
        chapter: "Kapitel 3",
        section: "3.2",
        problemNumber: "3.2.3",
        difficulty: "Medium",
        topic: "Quadratische Gleichungen",
        problemText: "Lösen Sie die quadratische Gleichung: x² - 5x + 6 = 0",
        solution: "x₁ = 2, x₂ = 3\n\nLösungsweg:\nx² - 5x + 6 = 0\n(x - 2)(x - 3) = 0\nx = 2 oder x = 3",
        estimatedTime: 10,
      },
      {
        id: "3",
        chapter: "Kapitel 4",
        section: "4.1",
        problemNumber: "4.1.2",
        difficulty: "Hard",
        topic: "Funktionen",
        problemText: "Bestimmen Sie die Ableitung von f(x) = x³ - 2x² + 3x - 1",
        solution: "f'(x) = 3x² - 4x + 3\n\nLösungsweg:\nf(x) = x³ - 2x² + 3x - 1\nf'(x) = 3x² - 4x + 3",
        estimatedTime: 15,
      },
    ],
  },
  {
    id: "search-2",
    title: "Grundlagen der Mathematik für Dummies",
    author: "Mark Zegarelli",
    isbn: "9783446451827",
    publisher: "Wiley-VCH",
    year: 2021,
    subject: "Basic Mathematics",
    grade: "7",
    available: true,
    totalCopies: 0,
    availableCopies: 0,
    isScanned: true,
    problems: [
      {
        id: "4",
        chapter: "Kapitel 2",
        section: "2.1",
        problemNumber: "2.1.1",
        difficulty: "Easy",
        topic: "Grundrechenarten",
        problemText: "Berechnen Sie: 15 + 23 - 8",
        solution: "30\n\nLösungsweg:\n15 + 23 = 38\n38 - 8 = 30",
        estimatedTime: 3,
      },
      {
        id: "5",
        chapter: "Kapitel 5",
        section: "5.2",
        problemNumber: "5.2.4",
        difficulty: "Medium",
        topic: "Bruchrechnung",
        problemText: "Vereinfachen Sie: 3/4 + 2/3",
        solution: "17/12\n\nLösungsweg:\n3/4 + 2/3 = 9/12 + 8/12 = 17/12",
        estimatedTime: 8,
      },
    ],
  },
]

export default function BooksPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<(Book & { problems?: BookProblem[] })[]>([])
  const [viewingBook, setViewingBook] = useState<Book | null>(null)
  const [viewingProblems, setViewingProblems] = useState<(Book & { problems?: BookProblem[] }) | null>(null)
  const [selectedProblems, setSelectedProblems] = useState<string[]>([])
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false)
  const [requestForm, setRequestForm] = useState({
    isbn: "",
    title: "",
    author: "",
    reason: "",
  })

  // Filter states
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "unavailable">("all")
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [scannedFilter, setScannedFilter] = useState<"all" | "scanned" | "not-scanned">("all")
  const [requestStatusFilter, setRequestStatusFilter] = useState<
    "all" | "pending" | "approved" | "ordered" | "received" | "rejected"
  >("all")

  const allBooks = getAllBooks()
  const allBookRequests = getAllBookRequests()

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const results = germanMathBooks.filter(
        (book) =>
          book.isbn.includes(searchTerm) ||
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const handleViewBook = (book: Book) => {
    setViewingBook(book)
  }

  const handleViewProblems = (book: Book & { problems?: BookProblem[] }) => {
    setViewingProblems(book)
    setSelectedProblems([])
  }

  const handleProblemSelection = (problemId: string) => {
    setSelectedProblems((prev) =>
      prev.includes(problemId) ? prev.filter((id) => id !== problemId) : [...prev, problemId],
    )
  }

  const handleCreateAssignmentFromProblems = () => {
    if (selectedProblems.length > 0) {
      setIsCreateAssignmentOpen(true)
    }
  }

  const handleRequestBook = () => {
    console.log("Book request submitted:", requestForm)
    setIsRequestDialogOpen(false)
    setRequestForm({ isbn: "", title: "", author: "", reason: "" })
  }

  const prefillRandomISBN = () => {
    const randomBook = germanMathBooks[Math.floor(Math.random() * germanMathBooks.length)]
    setSearchTerm(randomBook.isbn)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600"
      case "Medium":
        return "text-yellow-600"
      case "Hard":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getSelectedProblemsFromBook = () => {
    if (!viewingProblems?.problems) return []
    return viewingProblems.problems.filter((p) => selectedProblems.includes(p.id))
  }

  const getRequestStatusIcon = (status: BookRequest["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "ordered":
        return <Package className="h-4 w-4 text-blue-500" />
      case "received":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getRequestStatusBadge = (status: BookRequest["status"]) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "approved":
        return "default"
      case "ordered":
        return "outline"
      case "received":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const filteredBooks = allBooks.filter((book) => {
    if (availabilityFilter === "available" && !book.available) return false
    if (availabilityFilter === "unavailable" && book.available) return false
    if (gradeFilter !== "all" && book.grade !== gradeFilter) return false
    if (scannedFilter === "scanned" && !book.isScanned) return false
    if (scannedFilter === "not-scanned" && book.isScanned) return false
    return true
  })

  const filteredRequests = allBookRequests.filter((request) => {
    if (requestStatusFilter !== "all" && request.status !== requestStatusFilter) return false
    return true
  })

  const uniqueGrades = Array.from(new Set(allBooks.map((book) => book.grade))).sort()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Books</h2>
        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Request Book
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request a Book</DialogTitle>
              <DialogDescription>
                Request a book that's not in our catalog. We'll review your request and add it if approved.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isbn" className="text-right">
                  ISBN
                </Label>
                <Input
                  id="isbn"
                  value={requestForm.isbn}
                  onChange={(e) => setRequestForm({ ...requestForm, isbn: e.target.value })}
                  className="col-span-3"
                  placeholder="978-3-..."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={requestForm.title}
                  onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                  className="col-span-3"
                  placeholder="Book title"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="author" className="text-right">
                  Author
                </Label>
                <Input
                  id="author"
                  value={requestForm.author}
                  onChange={(e) => setRequestForm({ ...requestForm, author: e.target.value })}
                  className="col-span-3"
                  placeholder="Author name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reason" className="text-right">
                  Reason
                </Label>
                <Textarea
                  id="reason"
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  className="col-span-3"
                  placeholder="Why do you need this book?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleRequestBook}>Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="catalog">Book Catalog</TabsTrigger>
          <TabsTrigger value="requests">Book Requests</TabsTrigger>
          <TabsTrigger value="search">ISBN Search</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Availability:</span>
              <Button
                variant={availabilityFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setAvailabilityFilter("all")}
              >
                All ({allBooks.length})
              </Button>
              <Button
                variant={availabilityFilter === "available" ? "default" : "outline"}
                size="sm"
                onClick={() => setAvailabilityFilter("available")}
              >
                Available ({allBooks.filter((b) => b.available).length})
              </Button>
              <Button
                variant={availabilityFilter === "unavailable" ? "default" : "outline"}
                size="sm"
                onClick={() => setAvailabilityFilter("unavailable")}
              >
                Unavailable ({allBooks.filter((b) => !b.available).length})
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Grade:</span>
              <Button
                variant={gradeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setGradeFilter("all")}
              >
                All Grades
              </Button>
              {uniqueGrades.map((grade) => (
                <Button
                  key={grade}
                  variant={gradeFilter === grade ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGradeFilter(grade)}
                >
                  Grade {grade}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Scanned:</span>
              <Button
                variant={scannedFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setScannedFilter("all")}
              >
                All
              </Button>
              <Button
                variant={scannedFilter === "scanned" ? "default" : "outline"}
                size="sm"
                onClick={() => setScannedFilter("scanned")}
              >
                Scanned ({allBooks.filter((b) => b.isScanned).length})
              </Button>
              <Button
                variant={scannedFilter === "not-scanned" ? "default" : "outline"}
                size="sm"
                onClick={() => setScannedFilter("not-scanned")}
              >
                Not Scanned ({allBooks.filter((b) => !b.isScanned).length})
              </Button>
            </div>
          </div>

          {/* Books Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <Card
                key={book.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewBook(book)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{book.title}</CardTitle>
                      <CardDescription>by {book.author}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant={book.available ? "default" : "secondary"}>
                        {book.available ? "Available" : "Unavailable"}
                      </Badge>
                      {book.isScanned && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Scanned
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>ISBN:</strong> {book.isbn}
                    </p>
                    <p>
                      <strong>Publisher:</strong> {book.publisher}
                    </p>
                    <p>
                      <strong>Year:</strong> {book.year}
                    </p>
                    <p>
                      <strong>Subject:</strong> {book.subject}
                    </p>
                    <p>
                      <strong>Grade:</strong> {book.grade}
                    </p>
                    <p>
                      <strong>Copies:</strong> {book.availableCopies}/{book.totalCopies}
                    </p>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewBook(book)
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Book
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {/* Request Status Filter */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Status:</span>
              <Button
                variant={requestStatusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setRequestStatusFilter("all")}
              >
                All ({allBookRequests.length})
              </Button>
              <Button
                variant={requestStatusFilter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setRequestStatusFilter("pending")}
              >
                Pending ({allBookRequests.filter((r) => r.status === "pending").length})
              </Button>
              <Button
                variant={requestStatusFilter === "approved" ? "default" : "outline"}
                size="sm"
                onClick={() => setRequestStatusFilter("approved")}
              >
                Approved ({allBookRequests.filter((r) => r.status === "approved").length})
              </Button>
              <Button
                variant={requestStatusFilter === "ordered" ? "default" : "outline"}
                size="sm"
                onClick={() => setRequestStatusFilter("ordered")}
              >
                Ordered ({allBookRequests.filter((r) => r.status === "ordered").length})
              </Button>
              <Button
                variant={requestStatusFilter === "received" ? "default" : "outline"}
                size="sm"
                onClick={() => setRequestStatusFilter("received")}
              >
                Received ({allBookRequests.filter((r) => r.status === "received").length})
              </Button>
              <Button
                variant={requestStatusFilter === "rejected" ? "default" : "outline"}
                size="sm"
                onClick={() => setRequestStatusFilter("rejected")}
              >
                Rejected ({allBookRequests.filter((r) => r.status === "rejected").length})
              </Button>
            </div>
          </div>

          {/* Requests Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{request.title}</CardTitle>
                      <CardDescription>by {request.author}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getRequestStatusIcon(request.status)}
                      <Badge variant={getRequestStatusBadge(request.status)}>{request.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>ISBN:</strong> {request.isbn}
                    </p>
                    <p>
                      <strong>Publisher:</strong> {request.publisher}
                    </p>
                    <p>
                      <strong>Year:</strong> {request.year}
                    </p>
                    <p>
                      <strong>Grade:</strong> {request.grade}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {request.quantity}
                    </p>
                    <p>
                      <strong>Cost:</strong> {request.estimatedCost}
                    </p>
                    <p>
                      <strong>Priority:</strong>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {request.priority}
                      </Badge>
                    </p>
                    <p>
                      <strong>Requested:</strong> {new Date(request.requestDate).toLocaleDateString()}
                    </p>
                    {request.expectedDelivery && (
                      <p>
                        <strong>Expected:</strong> {new Date(request.expectedDelivery).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Reason:</strong> {request.reason}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Books by ISBN</CardTitle>
              <CardDescription>Search for books in our catalog using ISBN number</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter ISBN number (e.g., 9783827420923)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
                <Button variant="outline" onClick={prefillRandomISBN}>
                  Random ISBN
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Search Results</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {searchResults.map((book) => (
                      <Card key={book.isbn} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-base">{book.title}</CardTitle>
                              <CardDescription>by {book.author}</CardDescription>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Badge variant={book.available ? "default" : "secondary"}>
                                {book.available ? "Available" : "Unavailable"}
                              </Badge>
                              {book.isScanned && (
                                <Badge variant="outline" className="text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Scanned
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <p>
                              <strong>ISBN:</strong> {book.isbn}
                            </p>
                            <p>
                              <strong>Publisher:</strong> {book.publisher}
                            </p>
                            <p>
                              <strong>Year:</strong> {book.year}
                            </p>
                            <p>
                              <strong>Subject:</strong> {book.subject}
                            </p>
                            {book.isScanned && book.problems && (
                              <p>
                                <strong>Problems:</strong> {book.problems.length} available
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <Button className="flex-1" onClick={() => handleViewBook(book)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Book
                            </Button>
                            {book.isScanned && book.problems && (
                              <Button variant="outline" onClick={() => handleViewProblems(book)}>
                                <BookOpen className="mr-2 h-4 w-4" />
                                View Problems
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Book Details Modal */}
      <Dialog open={!!viewingBook} onOpenChange={() => setViewingBook(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{viewingBook?.title}</DialogTitle>
            <DialogDescription>Complete book information and details</DialogDescription>
          </DialogHeader>

          {viewingBook && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Author</h4>
                    <p className="text-sm">{viewingBook.author}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">ISBN</h4>
                    <p className="text-sm font-mono">{viewingBook.isbn}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Publisher</h4>
                    <p className="text-sm">{viewingBook.publisher}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Year</h4>
                    <p className="text-sm">{viewingBook.year}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Subject</h4>
                    <p className="text-sm">{viewingBook.subject}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Grade Level</h4>
                    <p className="text-sm">Grade {viewingBook.grade}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Availability</h4>
                    <Badge variant={viewingBook.available ? "default" : "secondary"}>
                      {viewingBook.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Copies</h4>
                    <p className="text-sm">
                      {viewingBook.availableCopies} of {viewingBook.totalCopies} available
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex gap-2">
                {viewingBook.isScanned && (
                  <Badge variant="outline">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Digitally Scanned
                  </Badge>
                )}
                <Badge variant="outline">{viewingBook.available ? "In Stock" : "Out of Stock"}</Badge>
              </div>

              {/* Problems Section - Only show if book has problems */}
              {viewingBook.problems && viewingBook.problems.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Available Problems ({viewingBook.problems.length})</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProblems(viewingBook as Book & { problems?: BookProblem[] })}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Browse Problems
                    </Button>
                  </div>

                  <div className="grid gap-3 max-h-64 overflow-y-auto">
                    {viewingBook.problems.slice(0, 3).map((problem) => (
                      <Card key={problem.id} className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="font-medium text-sm">Problem {problem.problemNumber}</h5>
                            <p className="text-xs text-muted-foreground">{problem.topic}</p>
                          </div>
                          <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
                            {problem.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{problem.problemText}</p>
                        <div className="text-xs text-muted-foreground">
                          {problem.chapter} • Section {problem.section} • {problem.estimatedTime} min
                        </div>
                      </Card>
                    ))}
                    {viewingBook.problems.length > 3 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        ... and {viewingBook.problems.length - 3} more problems
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingBook(null)}>
              Close
            </Button>
            {viewingBook?.problems && viewingBook.problems.length > 0 && (
              <Button onClick={() => handleViewProblems(viewingBook as Book & { problems?: BookProblem[] })}>
                <BookOpen className="mr-2 h-4 w-4" />
                Browse All Problems
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Problem Browser Dialog */}
      <Dialog open={!!viewingProblems} onOpenChange={() => setViewingProblems(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Problems from: {viewingProblems?.title}</DialogTitle>
            <DialogDescription>
              Select problems to create assignments. {selectedProblems.length} problems selected.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Problems</TabsTrigger>
              <TabsTrigger value="easy">Easy</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="hard">Hard</TabsTrigger>
            </TabsList>

            {["all", "easy", "medium", "hard"].map((tab) => (
              <TabsContent key={tab} value={tab} className="max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {viewingProblems?.problems
                    ?.filter((problem) => tab === "all" || problem.difficulty.toLowerCase() === tab)
                    .map((problem) => (
                      <Card
                        key={problem.id}
                        className={`cursor-pointer transition-all ${
                          selectedProblems.includes(problem.id) ? "border-blue-500 bg-blue-50" : "hover:shadow-md"
                        }`}
                        onClick={() => handleProblemSelection(problem.id)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-sm">
                                Problem {problem.problemNumber} - {problem.topic}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {problem.chapter} • Section {problem.section} • {problem.estimatedTime} min
                              </CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
                                {problem.difficulty}
                              </Badge>
                              {selectedProblems.includes(problem.id) && (
                                <CheckCircle className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div>
                              <h5 className="text-xs font-medium text-muted-foreground mb-1">Problem:</h5>
                              <p className="text-sm">{problem.problemText}</p>
                            </div>
                            <div>
                              <h5 className="text-xs font-medium text-muted-foreground mb-1">Solution:</h5>
                              <div className="text-sm bg-muted p-2 rounded whitespace-pre-line">{problem.solution}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <DialogFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">{selectedProblems.length} problem(s) selected</div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setViewingProblems(null)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAssignmentFromProblems} disabled={selectedProblems.length === 0}>
                Create Assignment ({selectedProblems.length})
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Assignment from Problems Dialog */}
      <Dialog open={isCreateAssignmentOpen} onOpenChange={setIsCreateAssignmentOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Assignment from Selected Problems</DialogTitle>
            <DialogDescription>
              Configure your assignment with the {selectedProblems.length} selected problems.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignmentTitle" className="text-right">
                Title
              </Label>
              <Input id="assignmentTitle" placeholder="Assignment title" className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <Input id="dueDate" type="date" className="col-span-3" />
            </div>

            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
              <h4 className="font-medium mb-2">Selected Problems:</h4>
              <div className="space-y-2">
                {getSelectedProblemsFromBook().map((problem) => (
                  <div key={problem.id} className="flex justify-between items-center text-sm">
                    <span>
                      {problem.problemNumber}: {problem.topic}
                    </span>
                    <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
                      {problem.difficulty}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateAssignmentOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Here you would save the assignment
                console.log("Creating assignment with problems:", selectedProblems)
                setIsCreateAssignmentOpen(false)
                setViewingProblems(null)
                setSelectedProblems([])
              }}
            >
              Create Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
