import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarToggle } from "@/components/sidebar-toggle"
import { Button } from "@/components/ui/button"
import { GitCommit, GitPullRequest, Github, MessageSquare } from "lucide-react"

export default function TeamsPage() {
  // Sample team data
  const teams = [
    {
      id: 1,
      name: "Team Alpha",
      repo: "smart-campus-team-alpha",
      members: [
        { name: "John Smith", github: "johnsmith", avatar: "/placeholder.svg?height=40&width=40" },
        { name: "Emily Johnson", github: "emilyjohnson", avatar: "/placeholder.svg?height=40&width=40" },
        { name: "Michael Brown", github: "michaelbrown", avatar: "/placeholder.svg?height=40&width=40" },
        { name: "Sarah Davis", github: "sarahdavis", avatar: "/placeholder.svg?height=40&width=40" },
        { name: "David Wilson", github: "davidwilson", avatar: "/placeholder.svg?height=40&width=40" },
      ],
      stats: {
        commits: 142,
        issues: 38,
        prs: 24,
        comments: 87,
        progress: 85,
      },
      lastActivity: "2 hours ago",
    },
    {
      id: 2,
      name: "Team Beta",
      repo: "smart-campus-team-beta",
      members: [
        { name: "Jessica Lee", github: "jessicalee", avatar: "/placeholder.svg?height=40&width=40" },
        { name: "Robert Taylor", github: "roberttaylor", avatar: "/placeholder.svg?height=40&width=40" },
        { name: "Amanda Martinez", github: "amandamartinez", avatar: "/placeholder.svg?height=40&width=40" },
        { name: "James Anderson", github: "jamesanderson", avatar: "/placeholder.svg?height=40&width=40" },
      ],
      stats: {
        commits: 98,
        issues: 27,
        prs: 15,
        comments: 62,
        progress: 72,
      },
      lastActivity: "1 day ago",
    },
    {
      id: 3,
      name: "Team Gamma",
      repo: "smart-campus-team-gamma",
      members: [
        { name: "Thomas Clark", github: "thomasclark", avatar: "/placeholder.svg?height=40&width=40" },
        { name: "Lisa Rodriguez", github: "lisarodriguez", avatar: "/placeholder.svg?height=40&width=40" },
        { name: "Kevin Lewis", github: "kevinlewis", avatar: "/placeholder.svg?height=40&width=40" },
        { name: "Jennifer Walker", github: "jenniferwalker", avatar: "/placeholder.svg?height=40&width=40" },
        { name: "Daniel Hall", github: "danielhall", avatar: "/placeholder.svg?height=40&width=40" },
      ],
      stats: {
        commits: 165,
        issues: 42,
        prs: 21,
        comments: 93,
        progress: 90,
      },
      lastActivity: "5 hours ago",
    },
  ]

  return (
    <div className="p-6">
      <SidebarToggle />

      <div className="flex flex-col gap-6">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teams</h1>
          <Button>Add Team</Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="overflow-hidden">
              <CardHeader className="bg-secondary/50">
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  {team.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="text-sm text-muted-foreground">
                    Repository: <span className="font-medium text-foreground">{team.repo}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Members</h3>
                    <div className="flex flex-wrap gap-2">
                      {team.members.map((member, index) => (
                        <div key={index} className="flex items-center gap-2 bg-secondary rounded-full px-3 py-1">
                          <img
                            src={member.avatar || "/placeholder.svg"}
                            alt={member.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-xs">{member.github}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Activity</h3>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="flex flex-col items-center p-2 bg-blue-50 rounded-md">
                        <GitCommit className="h-4 w-4 text-blue-500 mb-1" />
                        <span className="text-xs text-muted-foreground">Commits</span>
                        <span className="font-medium">{team.stats.commits}</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-green-50 rounded-md">
                        <MessageSquare className="h-4 w-4 text-green-500 mb-1" />
                        <span className="text-xs text-muted-foreground">Issues</span>
                        <span className="font-medium">{team.stats.issues}</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-purple-50 rounded-md">
                        <GitPullRequest className="h-4 w-4 text-purple-500 mb-1" />
                        <span className="text-xs text-muted-foreground">PRs</span>
                        <span className="font-medium">{team.stats.prs}</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-yellow-50 rounded-md">
                        <MessageSquare className="h-4 w-4 text-yellow-500 mb-1" />
                        <span className="text-xs text-muted-foreground">Comments</span>
                        <span className="font-medium">{team.stats.comments}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <h3 className="text-sm font-medium">Progress</h3>
                      <span className="text-sm">{team.stats.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProgressColor(team.stats.progress)}`}
                        style={{ width: `${team.stats.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Last activity: {team.lastActivity}</span>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function getProgressColor(progress: number) {
  if (progress < 30) return "bg-red-500"
  if (progress < 70) return "bg-yellow-500"
  return "bg-green-500"
}

