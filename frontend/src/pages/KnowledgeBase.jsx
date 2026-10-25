import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { knowledgeAPI } from '../services/api'
import { BookOpen, Search, Loader2, ExternalLink, Tag, ChevronRight } from 'lucide-react'

const SAMPLE_QUERIES = [
  'Minimum slab thickness for residential floors',
  'OSHA requirements for fall protection systems',
  'Concrete curing time and temperature requirements',
  'Seismic design requirements for buildings',
  'Steel connection design for moment frames',
  'Scaffold erection safety standards',
]

export default function KnowledgeBase() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('General')
  const [categories, setCategories] = useState(['General', 'Structural Engineering', 'Safety & OSHA', 'Concrete & Masonry', 'Steel Construction', 'MEP Systems', 'Project Management', 'Building Codes'])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    knowledgeAPI.categories().then(r => setCategories(r.categories)).catch(() => { })
    knowledgeAPI.history().then(r => setHistory(r.history || [])).catch(() => { })
  }, [])

  const search = async (q = query) => {
    if (!q.trim()) return toast.error('Please enter a query')
    setLoading(true)
    try {
      const res = await knowledgeAPI.query({ query: q, category })
      setResult(res.data)
      setHistory(p => [{ query: q, created_at: new Date().toISOString() }, ...p.slice(0, 9)])
    } catch (e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const quickSearch = (q) => { setQuery(q); search(q) }

  return (
    <div className="max-w-5xl space-y-5">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <BookOpen size={20} className="text-yellow-400" /> Construction Knowledge Base
        </h2>
        <p className="text-slate-400 text-sm">Query construction standards, building codes, engineering guidelines, and best practices powered by AI.</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-lg text-xs border transition-all ${category === c ? 'bg-yellow-600/20 text-yellow-400 border-yellow-500/40' : 'bg-slate-700 text-slate-400 border-slate-600 hover:border-slate-500'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="Ask about standards, codes, best practices..."
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-yellow-500 transition-colors" />
          </div>
          <button onClick={() => search()} disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-2">Quick searches:</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUERIES.map((q, i) => (
              <button key={i} onClick={() => quickSearch(q)}
                className="text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded border border-slate-600 transition-all flex items-center gap-1">
                <ChevronRight size={10} className="flex-shrink-0" />{q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <BookOpen size={16} className="text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="text-xs text-slate-400">{result.category}</span>
                  <span className="text-xs text-slate-500 flex-shrink-0">Confidence: {result.confidence}%</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">{result.answer}</p>
              </div>
            </div>
          </div>

          {result.key_points?.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Key Points</h4>
              <ul className="space-y-2">
                {result.key_points.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="w-5 h-5 bg-yellow-600/20 text-yellow-400 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i + 1}</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {result.references?.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <ExternalLink size={14} className="text-blue-400" /> Standards & References
                </h4>
                <div className="space-y-2">
                  {result.references.map((r, i) => (
                    <div key={i} className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-blue-400">{r.standard}</p>
                          <p className="text-xs text-white mt-0.5">{r.title}</p>
                        </div>
                        <span className="text-xs text-slate-500 flex-shrink-0">{r.year}</span>
                      </div>
                      {r.section && <p className="text-xs text-slate-400 mt-1">{r.section}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.related_topics?.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Tag size={14} className="text-green-400" /> Related Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.related_topics.map((t, i) => (
                    <button key={i} onClick={() => quickSearch(t)}
                      className="text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full transition-all">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {history.length > 0 && !result && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Recent Searches</h4>
          <div className="space-y-0.5">
            {history.slice(0, 6).map((h, i) => (
              <button key={i} onClick={() => quickSearch(h.query || h.input || '')}
                className="w-full text-left text-xs text-slate-400 hover:text-slate-200 py-2 border-b border-slate-700 last:border-0 transition-colors flex items-center gap-2">
                <Search size={12} className="flex-shrink-0 text-slate-600" />
                <span className="truncate">{h.query || h.input || 'Previous query'}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
