import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarToggle } from "@/components/sidebar-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CommitFrequencyChart from "@/components/analytics/commit-frequency-chart"
import IssueResolutionChart from "@/components/analytics/issue-resolution-chart"
import ContributionHeatmap from "@/components/analytics/contribution-heatmap"
import TeamComparisonRadarChart from "@/components/analytics/team-comparison-radar"

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <SidebarToggle />

      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into student activities and team performance</p>
        </header>

        <Tabs defaultValue="activity">
          <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-4">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="trends" className="hidden md:block">
              Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Commit Frequency</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <CommitFrequencyChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Issue Resolution</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <IssueResolutionChart />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Contribution Heatmap</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ContributionHeatmap />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="teams" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Comparison</CardTitle>
              </CardHeader>
              <CardContent className="h-[500px]">
                <TeamComparisonRadarChart />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Contributors</CardTitle>
                </CardHeader>
                <CardContent>
                  <TopContributorsChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Deadline Fighters</CardTitle>
                </CardHeader>
                <CardContent>
                  <DeadlineFightersChart />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ActivityTrendsChart />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function TopContributorsChart() {
  return (
    <div className="space-y-4">
      {[
        { name: "Thomas Clark", commits: 45, issues: 14, prs: 7, total: 66 },
        { name: "John Smith", commits: 42, issues: 12, prs: 8, total: 62 },
        { name: "Emily Johnson", commits: 38, issues: 9, prs: 6, total: 53 },
        { name: "Jessica Lee", commits: 31, issues: 8, prs: 5, total: 44 },
        { name: "Lisa Rodriguez", commits: 28, issues: 7, prs: 4, total: 39 },
      ].map((contributor, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">{contributor.name}</span>
            <span className="text-sm text-muted-foreground">{contributor.total} contributions</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${(contributor.total / 66) * 100}%` }} />
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Commits: {contributor.commits}</span>
            <span>Issues: {contributor.issues}</span>
            <span>PRs: {contributor.prs}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function DeadlineFightersChart() {
  return (
    <div className="space-y-4">
      {[
        { name: "Daniel Hall", lastWeek: 8, previousWeeks: 0, percentage: 100 },
        { name: "Robert Taylor", lastWeek: 12, previousWeeks: 4, percentage: 75 },
        { name: "Amanda Martinez", lastWeek: 10, previousWeeks: 5, percentage: 67 },
        { name: "Kevin Lewis", lastWeek: 15, previousWeeks: 10, percentage: 60 },
        { name: "Sarah Davis", lastWeek: 8, previousWeeks: 12, percentage: 40 },
      ].map((student, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">{student.name}</span>
            <span className="text-sm text-muted-foreground">{student.percentage}% near deadline</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${student.percentage > 70 ? "bg-red-500" : student.percentage > 40 ? "bg-yellow-500" : "bg-green-500"}`}
              style={{ width: `${student.percentage}%` }}
            />
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Last week: {student.lastWeek} commits</span>
            <span>Previous weeks: {student.previousWeeks} commits</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ActivityTrendsChart() {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-muted-foreground">Activity trends visualization would be displayed here</p>
    </div>
  )
}

