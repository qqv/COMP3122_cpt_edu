import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarToggle } from "@/components/sidebar-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  return (
    <div className="p-6">
      <SidebarToggle />

      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your application settings</p>
        </header>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="github">GitHub Integration</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>Update your course details and project settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course-name">Course Name</Label>
                    <Input id="course-name" defaultValue="COMP3421 - Software Engineering" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input id="project-name" defaultValue="Smart Campus App" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Project Deadline</Label>
                    <Input id="deadline" type="date" defaultValue="2025-04-30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructor">Instructor Name</Label>
                    <Input id="instructor" defaultValue="Dr. Wong, Jane" />
                  </div>
                </div>

                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>Customize how information is displayed in the dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable dark mode for the application</p>
                  </div>
                  <Switch id="dark-mode" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-inactive">Show Inactive Students</Label>
                    <p className="text-sm text-muted-foreground">Show students with no recent activity</p>
                  </div>
                  <Switch id="show-inactive" defaultChecked />
                </div>

                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="github" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>GitHub Integration</CardTitle>
                <CardDescription>Configure your GitHub integration settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="github-token">GitHub Personal Access Token</Label>
                  <Input id="github-token" type="password" defaultValue="••••••••••••••••••••" />
                  <p className="text-xs text-muted-foreground">The token needs repo and read:org permissions</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github-org">GitHub Organization</Label>
                  <Input id="github-org" defaultValue="comp3421-2025" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refresh-interval">Data Refresh Interval (minutes)</Label>
                  <Input id="refresh-interval" type="number" defaultValue="30" min="5" max="1440" />
                </div>

                <Button>Save Changes</Button>
                <Button variant="outline" className="ml-2">
                  Test Connection
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure when and how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-address">Email Address</Label>
                  <Input id="email-address" type="email" defaultValue="jane.wong@example.com" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="low-activity-alerts">Low Activity Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when teams show low activity</p>
                  </div>
                  <Switch id="low-activity-alerts" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-reports">Weekly Summary Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive weekly summary reports</p>
                  </div>
                  <Switch id="weekly-reports" defaultChecked />
                </div>

                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

