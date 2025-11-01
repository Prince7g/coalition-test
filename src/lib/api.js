
export const API_BASE = 'https://fedskillstest.coalitiontechnologies.workers.dev'
export const PATIENTS_URL = `${API_BASE}/patients`

export async function fetchPatients() {
  const res = await fetch(PATIENTS_URL)
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`API error ${res.status}: ${txt}`)
  }
  return res.json()
}
