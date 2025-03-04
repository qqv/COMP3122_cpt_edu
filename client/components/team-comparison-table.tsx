"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TeamComparisonTable() {
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>TEAM</TableHead>
          <TableHead>MEMBERS</TableHead>
          <TableHead>COMMITS</TableHead>
          <TableHead>ISSUES</TableHead>
          <TableHead>PRS</TableHead>
          <TableHead>PROGRESS</TableHead>
          <TableHead>LAST ACTIVITY</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teams.map((team) => (
          <TableRow key={team.name}>
            <TableCell className="font-medium">{team.name}</TableCell>
            <TableCell>{team.members}</TableCell>
            <TableCell>{team.commits}</TableCell>
            <TableCell>{team.issues}</TableCell>
            <TableCell>{team.prs}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getProgressColor(team.progress)}`}
                    style={{ width: `${team.progress}%` }}
                  />
                </div>
                <span className="text-sm">{team.progress}%</span>
              </div>
            </TableCell>
            <TableCell>{team.lastActivity}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function getProgressColor(progress: number) {
  if (progress < 30) return "bg-red-500"
  if (progress < 70) return "bg-yellow-500"
  return "bg-green-500"
}

