import { useNavigate } from 'react-router-dom'
import { ShieldAlert, Scan, Building2, CalendarDays, CloudSun, MessageSquare, BookOpen, TrendingUp, CheckCircle, Zap } from 'lucide-react'

const modules = [
  { path: '/safety', icon: ShieldAlert, label: 'Safety Monitor', desc: 'Detect PPE violations & site hazards using AI vision analysis', color: 'text-red-400', bg: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20' },
  { path: '/crack', icon: Scan, label: 'Crack Detection', desc: 'Analyze structural cracks and receive repair recommendations', color: 'text-orange-400', bg: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20' },
  { path: '/valuation', icon: Building2, label: 'RE Valuation', desc: 'AI-powered real estate property valuation & market analysis', color: 'text-blue-400', bg: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20' },
  { path: '/planning', icon: CalendarDays, label: 'Project Planning', desc: 'Generate intelligent construction project plans & schedules', color: 'text-purple-400', bg: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20' },
  { path: '/weather', icon: CloudSun, label: 'Weather Advisory', desc: 'Real-time weather-aware construction safety advisories', color: 'text-cyan-400', bg: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20' },
  { path: '/assistant', icon: MessageSquare, label: 'Site Assistant', desc: 'AI chat assistant for daily site management & questions', color: 'text-green-400', bg: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/20' },
  { path: '/knowledge', icon: BookOpen, label: 'Knowledge Base', desc: 'Construction codes, standards & best practice lookup', color: 'text-yellow-400', bg: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20' },
]

const stats = [
  { label: 'AI Modules', value: '7', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Vision + LLM', value: 'AI', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { label: 'Standards DB', value: '100+', icon: BookOpen, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { label: 'System Status', value: 'Live', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  return (
    <div className="space-y-6 max-w-6xl">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-800/60 to-slate-800/40 border border-slate-700 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">AI-Powered Construction Intelligence</h2>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Multimodal AI platform combining LLM + Vision models to analyze construction sites,
              detect hazards, estimate property values, and generate intelligent project plans in real-time.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['React 18', 'FastAPI', 'Gemini AI', 'Multimodal Vision', 'SQLite'].map(t => (
                <span key={t} className="text-xs bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full border border-slate-600">{t}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 items-start md:items-end">
            <span className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              All Systems Operational
            </span>
            <span className="text-xs text-slate-500">Gemini 2.0 Flash Multimodal</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modules Grid */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">AI-Powered Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {modules.map(m => (
            <button key={m.path} onClick={() => navigate(m.path)}
              className={`text-left p-5 rounded-xl border transition-all duration-200 cursor-pointer group ${m.bg}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-slate-800/80 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <m.icon size={20} className={m.color} />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">{m.label}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{m.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="text-slate-400 font-medium">Note:</span> This platform uses Google Gemini 2.0 Flash for multimodal AI analysis.
          Add your <code className="bg-slate-700 px-1 py-0.5 rounded text-slate-300">GEMINI_API_KEY</code> to{' '}
          <code className="bg-slate-700 px-1 py-0.5 rounded text-slate-300">backend/.env</code> for live AI responses.
          All modules include rich demo responses when no key is configured.
        </p>
      </div>
    </div>
  )
}
