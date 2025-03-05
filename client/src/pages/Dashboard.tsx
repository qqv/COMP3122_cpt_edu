import React, { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card'
import { Chart as ChartJS, ChartTypeRegistry } from 'chart.js/auto'
import Sidebar from '../components/Sidebar'

interface MetricCardProps {
  title: string
  value: string
  change: string
  icon: string
  color: string
  iconColor: string
}

function MetricCard({ title, value, change, icon, color, iconColor }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
            <i className={`fas ${icon} ${iconColor}`}></i>
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-gray-500">{title}</h2>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <p className={`text-sm ${change.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const teamProgressChartRef = useRef<HTMLCanvasElement>(null)
  const activityChartRef = useRef<HTMLCanvasElement>(null)
  const teamProgressChart = useRef<ChartJS<keyof ChartTypeRegistry> | null>(null)
  const activityChart = useRef<ChartJS<keyof ChartTypeRegistry> | null>(null)

  useEffect(() => {
    if (teamProgressChartRef.current && activityChartRef.current) {
      // 销毁现有的图表实例
      if (teamProgressChart.current) {
        teamProgressChart.current.destroy()
      }
      if (activityChart.current) {
        activityChart.current.destroy()
      }

      // 创建新的图表实例
      teamProgressChart.current = new ChartJS(teamProgressChartRef.current, {
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
          datasets: [
            {
              label: 'Team Alpha',
              data: [5, 15, 25, 30, 45, 60, 75, 85],
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.3
            },
            {
              label: 'Team Beta',
              data: [3, 10, 20, 35, 42, 55, 65, 72],
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      })

      activityChart.current = new ChartJS(activityChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Commits', 'Issues', 'Pull Requests', 'Comments', 'Reviews'],
          datasets: [{
            data: [45, 25, 15, 10, 5],
            backgroundColor: [
              'rgb(59, 130, 246)',
              'rgb(16, 185, 129)',
              'rgb(139, 92, 246)',
              'rgb(245, 158, 11)',
              'rgb(239, 68, 68)'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      })
    }

    // 清理函数
    return () => {
      if (teamProgressChart.current) {
        teamProgressChart.current.destroy()
      }
      if (activityChart.current) {
        activityChart.current.destroy()
      }
    }
  }, [])

  const teams = [
    {
      name: "Team Alpha",
      members: 5,
      commits: 142,
      issues: 38,
      prs: 24,
      progress: 85,
      lastActivity: "2 hours ago",
    },
    {
      name: "Team Beta",
      members: 4,
      commits: 98,
      issues: 27,
      prs: 15,
      progress: 72,
      lastActivity: "1 day ago",
    },
    {
      name: "Team Gamma",
      members: 5,
      commits: 165,
      issues: 42,
      prs: 21,
      progress: 90,
      lastActivity: "5 hours ago",
    },
    {
      name: "Team Delta",
      members: 4,
      commits: 76,
      issues: 19,
      prs: 12,
      progress: 45,
      lastActivity: "3 days ago",
    },
    {
      name: "Team Epsilon",
      members: 3,
      commits: 32,
      issues: 8,
      prs: 6,
      progress: 15,
      lastActivity: "1 week ago",
    },
  ]

  const getProgressColor = (progress: number) => {
    if (progress < 30) return "bg-red-500"
    if (progress < 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-4 py-3 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">COMP3421 - Software Engineering</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-500">Dr. Wong, Jane</span>
              <img className="h-8 w-8 rounded-full" src="/api/placeholder/32/32" alt="User Profile" />
            </div>
          </div>
          <div className="px-4 py-2 sm:px-6 lg:px-8 bg-white border-t border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-500">Course Project: Smart Campus App</span>
              <span className="text-sm text-gray-500">|</span>
              <span className="text-sm text-gray-500">Groups: 10</span>
              <span className="text-sm text-gray-500">|</span>
              <span className="text-sm text-gray-500">Students: 45</span>
              <span className="text-sm text-gray-500">|</span>
              <span className="text-sm text-gray-500">Deadline: April 30, 2025</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
              title="Total Commits"
              value="892"
              change="+15% from last week"
              icon="fa-code-branch"
              color="bg-blue-100"
              iconColor="text-blue-500"
            />
            <MetricCard
              title="Issues Closed"
              value="156"
              change="+8% from last week"
              icon="fa-check-circle"
              color="bg-green-100"
              iconColor="text-green-500"
            />
            <MetricCard
              title="Pull Requests"
              value="78"
              change="+12% from last week"
              icon="fa-code-pull-request"
              color="bg-purple-100"
              iconColor="text-purple-500"
            />
            <MetricCard
              title="Teams at Risk"
              value="2"
              change="1 with low activity"
              icon="fa-exclamation-triangle"
              color="bg-red-100"
              iconColor="text-red-500"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Team Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <canvas ref={teamProgressChartRef}></canvas>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Activity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <canvas ref={activityChartRef}></canvas>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Comparison Table */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Team Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commits</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRs</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teams.map((team) => (
                      <tr key={team.name}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{team.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{team.members}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{team.commits}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{team.issues}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{team.prs}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`${getProgressColor(team.progress)} h-2.5 rounded-full`} 
                                style={{ width: `${team.progress}%` }}
                              />
                            </div>
                            <span className="ml-2 text-sm text-gray-600">{team.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.lastActivity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
} 