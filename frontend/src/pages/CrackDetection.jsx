import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { crackAPI } from '../services/api'
import { Upload, Scan, Loader2, AlertTriangle, Wrench, CheckCircle } from 'lucide-react'

const SEVERITY_COLORS = {
  LOW: 'text-green-400 bg-green-500/10 border-green-500/30',
  MEDIUM: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/30',
}

const PRIORITY_COLORS = {
  MONITOR: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  ROUTINE: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  URGENT: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  IMMEDIATE: 'text-red-400 bg-red-500/10 border-red-500/30',
}

export default function CrackDetection() {
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) { setFile(accepted[0]); setPreview(URL.createObjectURL(accepted[0])); setResult(null) }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1
  })

  const analyze = async () => {
    if (!file) return toast.error('Please upload an image first')
    setLoading(true)
    try {
      const res = await crackAPI.analyze(file)
      setResult(res.data)
      toast.success('Crack analysis complete!')
    } catch (e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <Scan size={20} className="text-orange-400" /> Structural Crack Detection & Analysis
        </h2>
        <p className="text-slate-400 text-sm">Upload an image of a structural surface to detect cracks, assess severity, and receive repair recommendations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-3">
          <div {...getRootProps()} className={`drop-zone rounded-xl p-8 text-center cursor-pointer min-h-56 flex flex-col items-center justify-center ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            {preview ? (
              <img src={preview} alt="preview" className="max-h-52 rounded-lg object-contain" />
            ) : (
              <div className="text-slate-400">
                <Upload size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="text-sm font-medium text-slate-300">Upload wall or structural surface image</p>
                <p className="text-xs mt-1 text-slate-500">JPG, PNG, WebP supported</p>
              </div>
            )}
          </div>
          {preview && (
            <button onClick={analyze} disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Analyzing Cracks...</> : <><Scan size={18} /> Detect Cracks</>}
            </button>
          )}
          {!preview && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
              <p className="text-xs text-slate-400 font-medium mb-1">Analysis capabilities:</p>
              <ul className="text-xs text-slate-500 space-y-0.5">
                {['Hairline, surface & structural crack types', 'Severity assessment (LOW → CRITICAL)', 'Affected area percentage estimation', 'Repair method recommendations'].map(i => (
                  <li key={i} className="flex items-center gap-1.5"><span className="w-1 h-1 bg-orange-400 rounded-full" />{i}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {result && (
          <div className="space-y-3">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${SEVERITY_COLORS[result.severity]}`}>{result.severity} SEVERITY</span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${PRIORITY_COLORS[result.repair_priority]}`}>{result.repair_priority}</span>
                <span className="px-3 py-1 text-xs font-medium rounded-full border border-slate-600 text-slate-300">{result.crack_type?.replace(/_/g, ' ')}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Affected Area</p>
                  <p className="text-2xl font-bold text-white">{result.affected_area_percent}%</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Est. Width</p>
                  <p className="text-2xl font-bold text-white">{result.width_estimate_mm} <span className="text-sm text-slate-400">mm</span></p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Structural Risk</p>
                  <p className={`text-sm font-bold mt-1 ${result.structural_risk === 'HIGH' ? 'text-red-400' : result.structural_risk === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'}`}>{result.structural_risk}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Crack Detected</p>
                  <p className={`text-sm font-bold mt-1 ${result.crack_detected ? 'text-red-400' : 'text-green-400'}`}>{result.crack_detected ? '⚠ Yes' : '✓ None'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><AlertTriangle size={15} className="text-yellow-400" /> Possible Causes</h4>
            <ul className="space-y-2">
              {result.possible_causes?.map((c, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full flex-shrink-0 mt-1.5" />{c}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Wrench size={15} className="text-blue-400" /> Repair Methods</h4>
            <ul className="space-y-2">
              {result.repair_methods?.map((m, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0 mt-1.5" />{m}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><CheckCircle size={15} className="text-green-400" /> Recommendations</h4>
            <ul className="space-y-2">
              {result.recommendations?.map((r, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0 mt-1.5" />{r}
                </li>
              ))}
            </ul>
          </div>
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
