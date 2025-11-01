import React from 'react'

export default function PatientCard({ patient, loading }) {
  const initials = patient ? `${(patient.first_name||'J').charAt(0)}${(patient.last_name||'T').charAt(0)}` : 'JT'
  return (
    <div className="flex items-center gap-4 bg-white rounded-lg p-2 shadow-sm">
      <div className="w-14 h-14 rounded-md flex items-center justify-center font-bold text-white"
           style={{ background: 'linear-gradient(135deg,#60a5fa,#7c3aed)' }}>
        {initials}
      </div>
      <div>
        <div className="text-sm font-semibold">{loading ? 'Loading...' : `${patient?.first_name || 'Jessica'} ${patient?.last_name || 'Taylor'}`}</div>
        <div className="text-xs text-slate-500">{loading ? '' : `${patient?.gender || patient?.sex || '—'}, ${patient?.age ? patient.age + ' yrs' : (patient?.date_of_birth || '')}`}</div>
      </div>
    </div>
  )
}
