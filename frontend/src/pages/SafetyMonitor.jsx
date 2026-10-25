import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { safetyAPI } from '../services/api'
import { Upload, ShieldAlert, AlertTriangle, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react'

const RISK_COLORS = {
  LOW: 'text-green-400 bg-green-500/10 border-green-500/30',
  MEDIUM: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/30',
}

const SEVERITY_DOT = {
  LOW: 'bg-green-400', MEDIUM: 'bg-yellow-400', HIGH: 'bg-orange-400', CRITICAL: 'bg-red-400',
}

const PPE_ICONS = {
  COMPLIANT: <CheckCircle size={15} className="text-green-400" />,
  VIOLATION: <XCircle size={15} className="text-red-400" />,
  NOT_VISIBLE: <Eye size={15} className="text-slate-500" />,
}

export default function SafetyMonitor() {
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) {
      setFile(accepted[0])
      setPreview(URL.createObjectURL(accepted[0]))
      setResult(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1, maxSize: 10 * 1024 * 1024
  })

  const analyze = async () => {
    if (!file) return toast.error('Please upload an image first')
    setLoading(true)
    try {
      const res = await safetyAPI.analyze(file)
      setResult(res.data)
      toast.success('Safety analysis complete!')
    } catch (e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const score = result?.compliance_score || 0
  const scoreColor = score >= 75 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444'

  return (
    <div className="max-w-5xl space-y-5">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <ShieldAlert size={20} className="text-red-400" /> Construction Site Safety Monitor
        </h2>
        <p className="text-slate-400 text-sm">Upload a construction site image to detect PPE violations, safety hazards, and compliance issues using AI vision.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upload */}
        <div className="space-y-3">
          <div {...getRootProps()} className={`drop-zone rounded-xl p-8 text-center cursor-pointer min-h-52 flex flex-col items-center justify-center ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            {preview ? (
              <img src={preview} alt="preview" className="max-h-48 rounded-lg object-contain" />
            ) : (
              <div className="text-slate-400">
                <Upload size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="text-sm font-medium text-slate-300">Drop site image here or click to browse</p>
                <p className="text-xs mt-1 text-slate-500">JPG, PNG, WebP • Max 10MB</p>
              </div>
            )}
          </div>
          {preview && (
            <button onClick={analyze} disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Analyzing Safety...</> : <><ShieldAlert size={18} /> Analyze Safety</>}
            </button>
          )}
          {!preview && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
              <p className="text-xs text-slate-400 font-medium mb-1">What this module detects:</p>
              <ul className="text-xs text-slate-500 space-y-0.5">
                {['PPE compliance (hardhat, vest, boots, gloves)', 'Unguarded excavations & fall hazards', 'Electrical hazards & equipment misuse', 'Debris on walkways & access routes'].map(i => (
                  <li key={i} className="flex items-center gap-1.5"><span className="w-1 h-1 bg-red-400 rounded-full" />{i}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Results right */}
        {result && (
          <div className="space-y-3">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${RISK_COLORS[result.risk_level]}`}>
                  {result.risk_level} RISK
                </span>
                <span className="text-2xl font-bold" style={{ color: scoreColor }}>{score}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
                <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: scoreColor }} />
              </div>
              <p className="text-xs text-slate-500">Compliance Score</p>
            </div>

            {/* PPE Status */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3">PPE Status</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(result.ppe_status || {}).map(([item, status]) => (
                  <div key={item} className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2">
                    {PPE_ICONS[status] || <Eye size={15} className="text-slate-500" />}
                    <div>
                      <p className="text-xs font-medium text-white capitalize">{item.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-slate-500">{status.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hazards + Recommendations */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {result.hazards?.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle size={15} className="text-orange-400" /> Hazards Detected ({result.hazards.length})
              </h4>
              <div className="space-y-2">
                {result.hazards.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 bg-slate-700/50 rounded-lg p-3">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${SEVERITY_DOT[h.severity] || 'bg-slate-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">{h.type}</p>
                      <p className="text-xs text-slate-400">{h.location}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded border flex-shrink-0 ${RISK_COLORS[h.severity]}`}>{h.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle size={15} className="text-blue-400" /> Recommendations
            </h4>
            <ul className="space-y-2">
              {result.recommendations?.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="w-5 h-5 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {result?.safety_violations?.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2"><XCircle size={15} /> Safety Violations</h4>
          <ul className="space-y-1">{result.safety_violations.map((v, i) => <li key={i} className="text-xs text-red-300 flex items-start gap-2"><span className="w-1 h-1 bg-red-400 rounded-full flex-shrink-0 mt-1.5" />{v}</li>)}</ul>
        </div>
      )}

      {result?.summary && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
        </div>
      )}
    </div>
  )
}
