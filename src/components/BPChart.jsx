import React, { useEffect, useRef } from 'react'
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend)

export default function BPChart({ patient }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!patient || !canvasRef.current) return

    const readings = (patient.vitals || patient.diagnosis_history || []).filter(r => {
      const bp = r.blood_pressure || r.bp || r.bloodpressure
      return bp && bp.systolic != null && bp.diastolic != null
    })

    if (readings.length === 0) {
      // no chart data
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null }
      return
    }

    const byYear = {}
    readings.forEach(r => {
      const dt = new Date(r.date || r.recorded_at || r.created_at || Date.now())
      const y = dt.getFullYear()
      const bp = r.blood_pressure || r.bp || r.bloodpressure
      const s = Number(bp.systolic)
      const d = Number(bp.diastolic)
      if (!byYear[y]) byYear[y] = { s: 0, d: 0, c: 0 }
      byYear[y].s += s
      byYear[y].d += d
      byYear[y].c += 1
    })

    const years = Object.keys(byYear).sort()
    const systolic = years.map(y => Math.round(byYear[y].s / byYear[y].c))
    const diastolic = years.map(y => Math.round(byYear[y].d / byYear[y].c))

    const ctx = canvasRef.current.getContext('2d')

    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          { label: 'Systolic', data: systolic, borderWidth: 2, tension: 0.3 },
          { label: 'Diastolic', data: diastolic, borderWidth: 2, tension: 0.3 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: false } }
      }
    })

    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [patient])

  return (
    <div className="w-full h-56">
      <canvas ref={canvasRef} />
    </div>
  )
}
