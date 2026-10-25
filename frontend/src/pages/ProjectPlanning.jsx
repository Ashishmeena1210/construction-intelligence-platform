import { useState } from 'react'
import toast from 'react-hot-toast'
import { planningAPI } from '../services/api'
import { CalendarDays, Loader2, AlertTriangle, DollarSign } from 'lucide-react'

const PROJECT_TYPES = ['New Construction', 'Renovation', 'Expansion', 'Demolition & Rebuild', 'Infrastructure', 'Fit-Out']
const BUILDING_TYPES = ['Residential', 'Commercial', 'Industrial', 'Mixed-Use', 'Healthcare', 'Education', 'Retail', 'Hotel']

const RISK_COLORS = {
  LOW: 'text-green-400 bg-green-500/10',
  MEDIUM: 'text-yellow-400 bg-yellow-500/10',
  HIGH: 'text-red-400 bg-red-500/10',
}

const inputClass = "w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"

export default function ProjectPlanning() {
  const [form, setForm] = useState({
    project_name: '', project_type: 'New Construction', building_type: 'Commercial',
    total_area_sqft: '', budget: '', duration_weeks: '24', location: '',
    team_size: '20', floors: '3', special_requirements: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.project_name || !form.budget) return toast.error('Project name and budget are required')
    setLoading(true)
    try {
      const res = await planningAPI.generate({
        ...form,
        total_area_sqft: parseFloat(form.total_area_sqft) || 0,
        budget: parseFloat(form.budget),
        duration_weeks: parseInt(form.duration_weeks),
        team_size: parseInt(form.team_size),
        floors: parseInt(form.floors)
      })
      setResult(res.data)
      toast.success('Project plan generated!')
    } catch (e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const totalBudget = result ? Object.values(result.budget_breakdown || {}).reduce((a, b) => a + b, 0) : 0

  return (
    <div className="max-w-5xl space-y-5">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <CalendarDays size={20} className="text-purple-400" /> Construction Project Planning
        </h2>
        <p className="text-slate-400 text-sm">Generate AI-powered project plans with phases, milestones, risk analysis, and budget breakdowns.</p>
      </div>

      <form onSubmit={submit} className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1">Project Name *</label>
            <input value={form.project_name} onChange={e => set('project_name', e.target.value)}
              placeholder="e.g. Riverside Tower Phase 1" className={inputClass} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Project Type</label>
            <select value={form.project_type} onChange={e => set('project_type', e.target.value)} className={inputClass}>
              {PROJECT_TYPES.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Building Type</label>
            <select value={form.building_type} onChange={e => set('building_type', e.target.value)} className={inputClass}>
              {BUILDING_TYPES.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Total Budget (USD) *</label>
            <input type="number" value={form.budget} onChange={e => set('budget', e.target.value)}
              placeholder="e.g. 5000000" className={inputClass} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Duration (weeks)</label>
            <input type="number" value={form.duration_weeks} onChange={e => set('duration_weeks', e.target.value)}
              placeholder="24" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Total Area (sq ft)</label>
            <input type="number" value={form.total_area_sqft} onChange={e => set('total_area_sqft', e.target.value)}
              placeholder="e.g. 50000" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Project Location</label>
            <input value={form.location} onChange={e => set('location', e.target.value)}
              placeholder="e.g. New York, NY" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Team Size</label>
            <input type="number" value={form.team_size} onChange={e => set('team_size', e.target.value)}
              placeholder="20" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Number of Floors</label>
            <input type="number" value={form.floors} onChange={e => set('floors', e.target.value)}
              placeholder="3" className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1">Special Requirements</label>
            <textarea value={form.special_requirements} onChange={e => set('special_requirements', e.target.value)}
              rows={2} placeholder="LEED certification, seismic zone, phased handover..."
              className={`${inputClass} resize-none`} />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Generating Plan...</> : <><CalendarDays size={18} /> Generate Project Plan</>}
        </button>
      </form>

      {result && (
        <div className="space-y-5">
          <div className="bg-gradient-to-r from-purple-900/30 to-slate-800 border border-purple-500/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-3">{result.project_name}</h3>
            <div className="flex flex-wrap gap-5">
              <div><p className="text-xs text-slate-500">Duration</p><p className="text-2xl font-bold text-white">{result.total_duration_weeks} <span className="text-sm text-slate-400">weeks</span></p></div>
              <div><p className="text-xs text-slate-500">Est. Cost</p><p className="text-2xl font-bold text-green-400">${result.estimated_cost?.toLocaleString()}</p></div>
              <div><p className="text-xs text-slate-500">Phases</p><p className="text-2xl font-bold text-white">{result.phases?.length}</p></div>
              <div><p className="text-xs text-slate-500">Milestones</p><p className="text-2xl font-bold text-white">{result.milestones?.length}</p></div>
            </div>
          </div>

          {/* Phases */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-white mb-4">Project Phases</h4>
            <div className="space-y-3">
              {result.phases?.map((phase, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{phase.phase_number}</div>
                    {i < result.phases.length - 1 && <div className="w-0.5 flex-1 bg-slate-700 my-1" />}
                  </div>
                  <div className="flex-1 bg-slate-700/40 rounded-xl p-4 mb-1">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-sm font-semibold text-white">{phase.name}</h5>
                      <span className="text-xs text-purple-400 whitespace-nowrap">{phase.duration_weeks}w</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Week {phase.start_week} – {phase.start_week + phase.duration_weeks - 1}</p>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Key Tasks</p>
                        <ul className="space-y-0.5">{phase.tasks?.slice(0, 3).map((t, j) => <li key={j} className="text-xs text-slate-300 flex items-center gap-1"><span className="w-1 h-1 bg-purple-400 rounded-full flex-shrink-0" />{t}</li>)}</ul>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Resources</p>
                        <ul className="space-y-0.5">{phase.resources?.slice(0, 3).map((r, j) => <li key={j} className="text-xs text-slate-300 flex items-center gap-1"><span className="w-1 h-1 bg-blue-400 rounded-full flex-shrink-0" />{r}</li>)}</ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Budget */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><DollarSign size={15} className="text-green-400" /> Budget Breakdown</h4>
              <div className="space-y-3">
                {Object.entries(result.budget_breakdown || {}).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-white font-medium">${value?.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-purple-500" style={{ width: `${totalBudget ? (value / totalBudget) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risks */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><AlertTriangle size={15} className="text-yellow-400" /> Risk Factors</h4>
              <div className="space-y-2">
                {result.risk_factors?.map((r, i) => (
                  <div key={i} className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${RISK_COLORS[r.probability]}`}>{r.probability}</span>
                      <span className="text-xs text-white font-medium">{r.risk}</span>
                    </div>
                    <p className="text-xs text-slate-400">{r.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-white mb-3">Key Milestones</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="text-left py-2 pr-4">Week</th>
                    <th className="text-left py-2 pr-4">Milestone</th>
                    <th className="text-left py-2">Deliverable</th>
                  </tr>
                </thead>
                <tbody>
                  {result.milestones?.map((m, i) => (
                    <tr key={i} className="border-b border-slate-700/50">
                      <td className="py-2 pr-4 text-purple-400 font-bold">W{m.week}</td>
                      <td className="py-2 pr-4 text-white">{m.milestone}</td>
                      <td className="py-2 text-slate-400">{m.deliverable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
