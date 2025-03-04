import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarToggle } from "@/components/sidebar-toggle"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, CheckCircle2, GitCommit, GitPullRequest, Github, MessageSquare, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function StudentsPage() {
  // Sample student data
  const students = [
    {
      id: 1,
      name: "John Smith",
      github: "johnsmith",
      avatar: "/placeholder.svg?height=40&width=40",
      team: "Team Alpha",
      stats: {
        commits: 42,
        issues: 12,
        prs: 8,
        comments: 24,
      },
      activity: "high",
      lastActive: "2 hours ago",
    },
    {
      id: 2,
      name: "Emily Johnson",
      github: "emilyjohnson",
      avatar: "/placeholder.svg?height=40&width=40",
      team: "Team Alpha",
      stats: {
        commits: 38,
        issues: 9,
        prs: 6,
        comments: 18,
      },
      activity: "high",
      lastActive: "4 hours ago",
    },
    {
      id: 3,
      name: "Jessica Lee",
      github: "jessicalee",
      avatar: "/placeholder.svg?height=40&width=40",
      team: "Team Beta",
      stats: {
        commits: 31,
        issues: 8,
        prs: 5,
        comments: 15,
      },
      activity: "medium",
      lastActive: "1 day ago",
    },
    {
      id: 4,
      name: "Thomas Clark",
      github: "thomasclark",
      avatar: "/placeholder.svg?height=40&width=40",
      team: "Team Gamma",
      stats: {
        commits: 45,
        issues: 14,
        prs: 7,
        comments: 27,
      },
      activity: "high",
      lastActive: "5 hours ago",
    },
    {
      id: 5,
      name: "Daniel Hall",
      github: "danielhall",
      avatar: "/placeholder.svg?height=40&width=40",
      team: "Team Gamma",
      stats: {
        commits: 8,
        issues: 2,
        prs: 1,
        comments: 5,
      },
      activity: "low",
      lastActive: "1 week ago",
    },
  ]

  return (
    <div className="p-6">
      <SidebarToggle />

      <div className="flex flex-col gap-6">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Students</h1>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search students..." className="pl-8" />
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Student Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STUDENT</TableHead>
                  <TableHead>TEAM</TableHead>
                  <TableHead>COMMITS</TableHead>
                  <TableHead>ISSUES</TableHead>
                  <TableHead>PULL REQUESTS</TableHead>
                  <TableHead>COMMENTS</TableHead>
                  <TableHead>ACTIVITY</TableHead>
                  <TableHead>LAST ACTIVE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img
                          src={student.avatar || "/placeholder.svg"}
                          alt={student.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Github className="h-3 w-3" />
                            {student.github}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{student.team}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <GitCommit className="h-4 w-4 text-blue-500" />
                        {student.stats.commits}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                        {student.stats.issues}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <GitPullRequest className="h-4 w-4 text-purple-500" />
                        {student.stats.prs}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-yellow-500" />
                        {student.stats.comments}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {student.activity === "high" && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            High
                          </span>
                        )}
                        {student.activity === "medium" && (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <CheckCircle2 className="h-4 w-4" />
                            Medium
                          </span>
                        )}
                        {student.activity === "low" && (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            Low
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{student.lastActive}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

