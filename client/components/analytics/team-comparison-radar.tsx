"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export default function TeamComparisonRadarChart() {
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
      type: "radar",
      data: {
        labels: ["Commits", "Issues", "Pull Requests", "Code Reviews", "Comments", "Documentation"],
        datasets: [
          {
            label: "Team Alpha",
            data: [85, 75, 80, 70, 90, 65],
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderColor: "rgb(59, 130, 246)",
            pointBackgroundColor: "rgb(59, 130, 246)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgb(59, 130, 246)",
          },
          {
            label: "Team Beta",
            data: [70, 65, 60, 80, 75, 85],
            backgroundColor: "rgba(34, 197, 94, 0.2)",
            borderColor: "rgb(34, 197, 94)",
            pointBackgroundColor: "rgb(34, 197, 94)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgb(34, 197, 94)",
          },
          {
            label: "Team Gamma",
            data: [90, 85, 75, 65, 80, 70],
            backgroundColor: "rgba(168, 85, 247, 0.2)",
            borderColor: "rgb(168, 85, 247)",
            pointBackgroundColor: "rgb(168, 85, 247)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgb(168, 85, 247)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: {
              display: true,
            },
            suggestedMin: 0,
            suggestedMax: 100,
          },
        },
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
    <div className="w-full h-full">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}

