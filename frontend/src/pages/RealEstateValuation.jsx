import { useState } from 'react'
import toast from 'react-hot-toast'
import { valuationAPI } from '../services/api'
import { Building2, TrendingUp, TrendingDown, Minus, Loader2, CheckCircle } from 'lucide-react'

const AMENITIES = ['Swimming Pool', 'Gym', 'Parking', 'Garden', 'Security', 'Elevator', 'Balcony', 'Smart Home']
const PROPERTY_TYPES = ['Residential', 'Commercial', 'Industrial', 'Mixed-Use', 'Retail', 'Office']
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Under Construction']

const TREND_CONFIG = {
  RISING: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', Icon: TrendingUp },
  STABLE: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', Icon: Minus },
  DECLINING: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', Icon: TrendingDown },
}

const RATING_COLORS = {
  EXCELLENT: 'text-green-400', GOOD: 'text-blue-400', FAIR: 'text-yellow-400', POOR: 'text-red-400'
}

const inputClass = "w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"

export default function RealEstateValuation() {
  const [form, setForm] = useState({
    location: '', area_sqft: '', bedrooms: '3', bathrooms: '2',
    year_built: '2010', property_type: 'Residential', condition: 'Good', amenities: []
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const toggleAmenity = (a) => setForm(p => ({
    ...p, amenities: p.amenities.includes(a) ? p.amenities.filter(x => x !== a) : [...p.amenities, a]
  }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.location || !form.area_sqft) return toast.error('Location and area are required')
    setLoading(true)
    try {
      const res = await valuationAPI.estimate({
        ...form,
        area_sqft: parseFloat(form.area_sqft),
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseFloat(form.bathrooms),
        year_built: parseInt(form.year_built)
      })
      setResult(res.data)
      toast.success('Valuation complete!')
    } catch (e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const trend = result ? TREND_CONFIG[result.market_trend] || TREND_CONFIG.STABLE : null

  return (
    <div className="max-w-5xl space-y-5">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <Building2 size={20} className="text-blue-400" /> Real Estate Valuation Engine
        </h2>
        <p className="text-slate-400 text-sm">AI-powered property valuation using market data, location factors, and comparable sales analysis.</p>
      </div>

      <form onSubmit={submit} className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1">Location / City *</label>
            <input value={form.location} onChange={e => set('location', e.target.value)}
              placeholder="e.g. New York, NY" className={inputClass} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Area (sq ft) *</label>
            <input type="number" value={form.area_sqft} onChange={e => set('area_sqft', e.target.value)}
              placeholder="e.g. 1500" className={inputClass} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Year Built</label>
            <input type="number" value={form.year_built} onChange={e => set('year_built', e.target.value)}
              min="1900" max="2025" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Bedrooms</label>
            <select value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} className={inputClass}>
              {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Bedroom{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Bathrooms</label>
            <select value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} className={inputClass}>
              {[1, 1.5, 2, 2.5, 3, 4].map(n => <option key={n} value={n}>{n} Bathroom{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Property Type</label>
            <select value={form.property_type} onChange={e => set('property_type', e.target.value)} className={inputClass}>
              {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Condition</label>
            <div className="flex flex-wrap gap-1.5">
              {CONDITIONS.map(c => (
                <button type="button" key={c} onClick={() => set('condition', c)}
                  className={`px-3 py-1 rounded-lg text-xs border transition-all ${form.condition === c ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-700 text-slate-300 border-slate-600 hover:border-slate-500'}`}>{c}</button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map(a => (
                <button type="button" key={a} onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1 rounded-lg text-xs border transition-all flex items-center gap-1 ${form.amenities.includes(a) ? 'bg-green-600/20 text-green-400 border-green-500/40' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                  {form.amenities.includes(a) && <CheckCircle size={11} />}{a}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Estimating Value...</> : <><Building2 size={18} /> Estimate Property Value</>}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-900/30 to-slate-800 border border-blue-500/30 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-1">Estimated Market Value</p>
            <p className="text-4xl font-bold text-white">${result.estimated_value?.toLocaleString()}</p>
            <p className="text-slate-400 text-sm mt-1">${result.price_per_sqft?.toLocaleString()} per sq ft</p>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div>
                <p className="text-xs text-slate-500">Price Range</p>
                <p className="text-sm text-slate-300">${result.price_range?.min?.toLocaleString()} – ${result.price_range?.max?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Confidence</p>
                <p className="text-sm text-slate-300">{result.confidence_score}%</p>
              </div>
              {trend && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${trend.bg} ${trend.color}`}>
                  <trend.Icon size={14} /> {result.market_trend} {result.trend_percentage > 0 ? '+' : ''}{result.trend_percentage}%
                </div>
              )}
              <div className={`ml-auto text-lg font-bold ${RATING_COLORS[result.investment_rating] || 'text-white'}`}>
                ★ {result.investment_rating}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Valuation Factors</h4>
              <div className="space-y-3">
                {result.valuation_factors?.map((f, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{f.factor}</span>
                      <span className={f.impact === 'POSITIVE' ? 'text-green-400' : f.impact === 'NEGATIVE' ? 'text-red-400' : 'text-slate-400'}>
                        {f.impact === 'POSITIVE' ? '▲' : f.impact === 'NEGATIVE' ? '▼' : '─'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${(f.weight / 10) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Comparable Sales</h4>
              <div className="space-y-2">
                {result.comparable_properties?.map((p, i) => (
                  <div key={i} className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-xs text-white font-medium truncate">{p.address}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-green-400 font-bold">${p.price?.toLocaleString()}</span>
                      <span className="text-xs text-slate-400">{p.sqft?.toLocaleString()} sqft • {p.sold_date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {result.recommendations?.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><CheckCircle size={15} className="text-blue-400" /> Recommendations</h4>
              <ul className="space-y-2">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="w-5 h-5 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i + 1}</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.summary && <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"><p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p></div>}
        </div>
      )}
    </div>
  )
}
