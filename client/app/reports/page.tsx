import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarToggle } from "@/components/sidebar-toggle"
import { Button } from "@/components/ui/button"
import { Download, FileText, Filter, Plus, RefreshCw } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ReportsPage() {
  // Sample reports data
  const reports = [
    {
      id: 1,
      name: "Weekly Activity Summary",
      description: "Summary of all team activities for the past week",
      created: "2023-04-15",
      type: "Automated",
      format: "PDF",
    },
    {
      id: 2,
      name: "Team Comparison Report",
      description: "Detailed comparison of team performance metrics",
      created: "2023-04-10",
      type: "Custom",
      format: "Excel",
    },
    {
      id: 3,
      name: "Student Contribution Analysis",
      description: "Analysis of individual student contributions",
      created: "2023-04-05",
      type: "Custom",
      format: "PDF",
    },
    {
      id: 4,
      name: "Deadline Fighters Report",
      description: "Identifies students who commit mostly near deadlines",
      created: "2023-04-01",
      type: "Automated",
      format: "PDF",
    },
    {
      id: 5,
      name: "Free Riders Detection",
      description: "Identifies potential free riders in teams",
      created: "2023-03-28",
      type: "Automated",
      format: "PDF",
    },
  ]

  return (
    <div className="p-6">
      <SidebarToggle />

      <div className="flex flex-col gap-6">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Reports</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NAME</TableHead>
                  <TableHead>DESCRIPTION</TableHead>
                  <TableHead>CREATED</TableHead>
                  <TableHead>TYPE</TableHead>
                  <TableHead>FORMAT</TableHead>
                  <TableHead>ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {report.name}
                      </div>
                    </TableCell>
                    <TableCell>{report.description}</TableCell>
                    <TableCell>{report.created}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          report.type === "Automated" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {report.type}
                      </span>
                    </TableCell>
                    <TableCell>{report.format}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {report.type === "Automated" && (
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4" />
                            <span className="sr-only">Refresh</span>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                      </div>
                    </TableCell>
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

