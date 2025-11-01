import React, { useEffect, useState } from 'react'
import { fetchPatients } from './lib/api'
import BPChart from './components/BPChart'
import PatientCard from './components/PatientCard'

export default function App() {
  const [jessica, setJessica] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async function load() {
      try {
        const data = await fetchPatients()
        const patients = Array.isArray(data) ? data : data.data || data.patients || []
        const found = patients.find(p => {
          const fn = (p.first_name || '').toLowerCase()
          const ln = (p.last_name || '').toLowerCase()
          return fn === 'jessica' && ln === 'taylor'
        })
        if (!found) setError('Jessica Taylor not found in API response')
        else if (mounted) setJessica(found)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to fetch patients')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="flex">
        <aside className="w-56 bg-brand text-white p-6">
          <div className="text-xl font-semibold mb-6">Coalition Health</div>
          <nav className="flex flex-col gap-2">
            <div className="px-3 py-2 rounded bg-white/6">Dashboard</div>
            <div className="px-3 py-2 rounded opacity-80">Patients</div>
            <div className="px-3 py-2 rounded opacity-80">Reports</div>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Patient Summary</h1>
            <PatientCard patient={jessica} loading={loading} />
          </header>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-100 rounded">
              {error}
            </div>
          )}

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-white rounded-lg shadow p-5">
                <h2 className="text-lg font-medium mb-3">Vitals (latest)</h2>
                {loading ? (
                  <div>Loading...</div>
                ) : jessica ? (
                  <ul className="space-y-3">
                    {renderLatestVitals(jessica).map((v, idx) => (
                      <li key={idx} className="flex justify-between items-start border-b border-slate-100 py-2">
                        <div>
                          <div className="font-semibold">{v.label}</div>
                          <div className="text-sm text-slate-500">{v.date}</div>
                        </div>
                        <div className="text-sm">{v.value}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div>No vitals to show</div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-5">
                <h2 className="text-lg font-medium mb-2">Notes</h2>
                <p className="text-slate-600">{loading ? 'Loading...' : jessica?.notes || 'No notes available'}</p>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-medium mb-3">Blood Pressure (Yearly)</h2>
                {loading ? <div>Loading chart...</div> : jessica ? <BPChart patient={jessica} /> : <div>No data</div>}
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-md font-medium mb-2">Contact</h3>
                <div className="text-slate-600">
                  {loading ? 'Loading...' : (
                    <>
                      <div>{jessica?.phone_number || jessica?.phone || 'N/A'}</div>
                      <div>{jessica?.email || 'N/A'}</div>
                    </>
                  )}
                </div>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </div>
  )
}

function renderLatestVitals(patient) {
  const vitals = (patient.vitals && Array.isArray(patient.vitals) && patient.vitals) ||
                 (patient.diagnosis_history && Array.isArray(patient.diagnosis_history) && patient.diagnosis_history) ||
                 []
  const latest = vitals.slice(-5).reverse()
  return latest.map(item => {
    const date = item.date || item.recorded_at || item.created_at || ''
    const bp = item.blood_pressure || item.bp || item.bloodpressure
    const value = bp ? `${bp.systolic}/${bp.diastolic} mmHg` : (item.value || '—')
    const label = item.type || 'Blood Pressure'
    return { date: formatDate(date), value, label }
  })
}

function formatDate(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString()
  } catch {
    return d
  }
}
