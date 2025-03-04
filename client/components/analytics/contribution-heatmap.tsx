"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export default function ContributionHeatmap() {
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

    // Sample data - this would be a simplified heatmap
    // In a real implementation, you might use a dedicated heatmap library
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"]

    // Generate random data for the heatmap
    const data = weeks.flatMap(() => days.map(() => Math.floor(Math.random() * 10)))

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Array(days.length * weeks.length)
          .fill("")
          .map((_, i) => `${weeks[Math.floor(i / days.length)]}, ${days[i % days.length]}`),
        datasets: [
          {
            label: "Contributions",
            data,
            backgroundColor: data.map((value) => {
              if (value === 0) return "rgba(229, 231, 235, 0.8)"
              if (value < 3) return "rgba(147, 197, 253, 0.8)"
              if (value < 6) return "rgba(59, 130, 246, 0.8)"
              return "rgba(30, 64, 175, 0.8)"
            }),
            borderColor: "rgba(255, 255, 255, 0.3)",
            borderWidth: 1,
            borderRadius: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        scales: {
          x: {
            display: false,
            grid: {
              display: false,
            },
          },
          y: {
            display: true,
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number
                return `${value} contribution${value !== 1 ? "s" : ""}`
              },
            },
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

