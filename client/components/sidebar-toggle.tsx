"use client"

import { ChevronLeft } from "lucide-react"
import { useSidebar } from "./sidebar-provider"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

export function SidebarToggle() {
  const { isOpen, toggle } = useSidebar()

  return (
    <Button variant="ghost" size="icon" onClick={toggle} className="absolute top-4 left-4 z-10 md:hidden">
      <ChevronLeft className={cn("h-6 w-6 transition-transform", isOpen ? "" : "rotate-180")} />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

