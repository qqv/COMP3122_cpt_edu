"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export default function TeamProgressChart() {
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
    const labels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"]

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Team Alpha",
            data: [8, 20, 32, 45, 58, 70, 82, 85],
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.3,
          },
          {
            label: "Team Beta",
            data: [5, 15, 25, 35, 45, 55, 65, 72],
            borderColor: "rgb(34, 197, 94)",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            tension: 0.3,
          },
          {
            label: "Team Gamma",
            data: [10, 25, 40, 55, 65, 75, 85, 90],
            borderColor: "rgb(168, 85, 247)",
            backgroundColor: "rgba(168, 85, 247, 0.1)",
            tension: 0.3,
          },
          {
            label: "Team Delta",
            data: [3, 10, 18, 25, 32, 38, 42, 45],
            borderColor: "rgb(234, 179, 8)",
            backgroundColor: "rgba(234, 179, 8, 0.1)",
            tension: 0.3,
          },
          {
            label: "Team Epsilon",
            data: [2, 5, 8, 10, 11, 12, 14, 15],
            borderColor: "rgb(239, 68, 68)",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Progress (%)",
            },
            max: 100,
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
    <div className="w-full h-[400px]">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}

