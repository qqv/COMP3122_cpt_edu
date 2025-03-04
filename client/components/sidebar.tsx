"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "./sidebar-provider"
import { cn } from "@/lib/utils"
import { BarChart2, FileText, Github, LayoutDashboard, LogOut, Settings, Users, Users2 } from "lucide-react"
import { Button } from "./ui/button"

export default function Sidebar() {
  const { isOpen } = useSidebar()
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Teams",
      href: "/teams",
      icon: Users2,
    },
    {
      title: "Students",
      href: "/students",
      icon: Users,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart2,
    },
    {
      title: "Reports",
      href: "/reports",
      icon: FileText,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <aside className={cn("bg-[#0d1117] text-white h-screen transition-all duration-300", isOpen ? "w-64" : "w-20")}>
      <div className="p-4 flex items-center gap-3">
        <Github className="h-8 w-8" />
        {isOpen && <h1 className="text-xl font-bold">Classroom Tracker</h1>}
      </div>

      <nav className="mt-8">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                  pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-gray-800",
                )}
              >
                <item.icon className="h-5 w-5" />
                {isOpen && <span>{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-4 left-0 right-0 px-4">
        <Button
          variant="ghost"
          className="w-full flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <LogOut className="h-5 w-5" />
          {isOpen && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  )
}

