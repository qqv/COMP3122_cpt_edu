import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarToggle } from "@/components/sidebar-toggle"
import { AlertTriangle, CheckCircle2, GitCommit, GitPullRequest } from "lucide-react"
import TeamProgressChart from "@/components/team-progress-chart"
import ActivityDistributionChart from "@/components/activity-distribution-chart"
import TeamComparisonTable from "@/components/team-comparison-table"

export default function Dashboard() {
  return (
    <div className="p-6">
      <SidebarToggle />

      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">COMP3421 - Software Engineering</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div>Course Project: Smart Campus App</div>
            <div>|</div>
            <div>Groups: 10</div>
            <div>|</div>
            <div>Students: 45</div>
            <div>|</div>
            <div>Deadline: April 30, 2025</div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Commits"
            value="892"
            change="+15% from last week"
            icon={GitCommit}
            color="bg-blue-50"
            iconColor="text-blue-500"
          />
          <MetricCard
            title="Issues Closed"
            value="156"
            change="+8% from last week"
            icon={CheckCircle2}
            color="bg-green-50"
            iconColor="text-green-500"
          />
          <MetricCard
            title="Pull Requests"
            value="78"
            change="+12% from last week"
            icon={GitPullRequest}
            color="bg-purple-50"
            iconColor="text-purple-500"
          />
          <MetricCard
            title="Teams at Risk"
            value="2"
            change="1 with low activity"
            icon={AlertTriangle}
            color="bg-red-50"
            iconColor="text-red-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Team Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamProgressChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityDistributionChart />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamComparisonTable />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  change: string
  icon: React.ElementType
  color: string
  iconColor: string
}

function MetricCard({ title, value, change, icon: Icon, color, iconColor }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-full ${color}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h2 className="text-3xl font-bold">{value}</h2>
            <p className="text-xs text-muted-foreground mt-1">{change}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

