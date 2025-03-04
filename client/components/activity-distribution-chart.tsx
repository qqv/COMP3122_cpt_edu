"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export default function ActivityDistributionChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Sample data
    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Commits", "Issues", "Pull Requests", "Comments", "Reviews"],
        datasets: [
          {
            data: [45, 25, 15, 10, 5],
            backgroundColor: [
              "rgb(59, 130, 246)",
              "rgb(34, 197, 94)",
              "rgb(168, 85, 247)",
              "rgb(234, 179, 8)",
              "rgb(239, 68, 68)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [])

  return (
    <div className="w-full h-[300px]">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}

