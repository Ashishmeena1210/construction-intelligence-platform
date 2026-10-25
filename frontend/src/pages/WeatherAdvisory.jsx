import { useState } from 'react'
import toast from 'react-hot-toast'
import { weatherAPI } from '../services/api'
import { CloudSun, Loader2, Thermometer, Wind, Droplets, Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

const ACTIVITIES = ['Foundation work', 'Concrete pouring', 'Steel erection', 'Roofing', 'Crane operations', 'Masonry', 'Exterior painting', 'Electrical work', 'Excavation', 'Scaffolding erection']

const RISK_CONFIG = {
  LOW: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', label: 'Low Risk' },
  MEDIUM: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', label: 'Moderate Risk' },
  HIGH: { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', label: 'High Risk' },
  CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', label: 'Critical Risk' },
}

const REC_CONFIG = {
  PROCEED: { color: 'text-green-400 bg-green-500/10 border-green-500/30', label: '✓ Proceed Normally' },
  PROCEED_WITH_CAUTION: { color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', label: '⚠ Proceed with Caution' },
  DELAY: { color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', label: '⏸ Delay Recommended' },
  STOP: { color: 'text-red-400 bg-red-500/10 border-red-500/30', label: '✗ Stop All Outdoor Work' },
}

export default function WeatherAdvisory() {
  const [location, setLocation] = useState('')
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const toggle = (a) => setSelected(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a])

  const submit = async (e) => {
    e.preventDefault()
    if (!location.trim()) return toast.error('Please enter a location')
    setLoading(true)
    try {
      const res = await weatherAPI.advisory({ location, planned_activities: selected })
      setResult(res)
      toast.success('Weather advisory generated!')
    } catch (e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const weather = result?.weather
  const advisory = result?.advisory
  const riskCfg = advisory ? RISK_CONFIG[advisory.overall_risk] || RISK_CONFIG.LOW : null
  const recCfg = advisory ? REC_CONFIG[advisory.work_recommendation] || REC_CONFIG.PROCEED : null

  return (
    <div className="max-w-5xl space-y-5">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <CloudSun size={20} className="text-cyan-400" /> Weather-Aware Construction Advisory
        </h2>
        <p className="text-slate-400 text-sm">Get real-time weather conditions and AI-powered safety advisories for your construction activities.</p>
      </div>

      <form onSubmit={submit} className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Construction Site Location *</label>
          <input value={location} onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Chicago, IL or Mumbai, India"
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors" required />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Planned Activities Today</label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITIES.map(a => (
              <button type="button" key={a} onClick={() => toggle(a)}
                className={`px-3 py-1 rounded-lg text-xs border transition-all ${selected.includes(a) ? 'bg-cyan-600/20 text-cyan-400 border-cyan-500/40' : 'bg-slate-700 text-slate-400 border-slate-600 hover:border-slate-500'}`}>{a}</button>
            ))}
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Fetching Advisory...</> : <><CloudSun size={18} /> Get Weather Advisory</>}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          {weather && (
            <div className="bg-gradient-to-r from-cyan-900/30 to-slate-800 border border-cyan-500/30 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{weather.location}</p>
                  <p className="text-5xl font-bold text-white mt-1">{weather.temp}°C</p>
                  <p className="text-cyan-400 mt-1 text-sm">{weather.description || weather.condition}</p>
                  {weather.source === 'mock' && <p className="text-xs text-slate-500 mt-1">Demo data — add OpenWeatherMap API key for live data</p>}
                </div>
                <CloudSun size={64} className="text-cyan-400/40" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {[
                  { Icon: Thermometer, color: 'text-orange-400', label: 'Feels Like', value: `${weather.feels_like}°C` },
                  { Icon: Droplets, color: 'text-blue-400', label: 'Humidity', value: `${weather.humidity}%` },
                  { Icon: Wind, color: 'text-slate-300', label: 'Wind', value: `${weather.wind_speed} km/h` },
                  { Icon: Eye, color: 'text-slate-300', label: 'Visibility', value: `${weather.visibility_km} km` },
                ].map(({ Icon, color, label, value }) => (
                  <div key={label} className="bg-slate-800/70 rounded-lg p-3 flex items-center gap-2">
                    <Icon size={18} className={color} />
                    <div><p className="text-xs text-slate-400">{label}</p><p className="text-sm text-white font-medium">{value}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {advisory && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${riskCfg?.bg} ${riskCfg?.color}`}>
                  <AlertTriangle size={16} />{riskCfg?.label}
                </div>
                <div className={`px-4 py-2 rounded-xl border text-sm font-bold ${recCfg?.color}`}>{recCfg?.label}</div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2"><CheckCircle size={15} /> Safe Activities</h4>
                  <ul className="space-y-1">
                    {advisory.safe_activities?.filter(Boolean).map((a, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />{a}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2"><XCircle size={15} /> Unsafe Activities</h4>
                  <ul className="space-y-1">
                    {advisory.unsafe_activities?.filter(Boolean).map((a, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />{a}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {advisory.precautions?.length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-yellow-400 mb-3">Precautions</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {advisory.precautions.map((p, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-yellow-400 rounded-full flex-shrink-0" />{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2">
                <p className="text-sm text-slate-300 leading-relaxed">{advisory.advisory_message}</p>
                {advisory.next_favorable_window && (
                  <p className="text-xs text-cyan-400">📅 {advisory.next_favorable_window}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
