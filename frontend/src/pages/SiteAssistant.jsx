import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import { assistantAPI } from '../services/api'
import { Send, Paperclip, X, Loader2, Bot, User, Image } from 'lucide-react'

const QUICK_PROMPTS = [
  'What is the minimum concrete cover for rebars?',
  'Explain OSHA fall protection requirements',
  'What are safe scaffolding erection procedures?',
  'How to calculate concrete mix design?',
]

export default function SiteAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your AI construction site assistant powered by Gemini. Ask me anything about construction safety, building codes, materials, project management, or upload a site image for visual analysis.',
      suggestions: QUICK_PROMPTS.slice(0, 3)
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [attachedFile, setAttachedFile] = useState(null)
  const [attachedPreview, setAttachedPreview] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const attachFile = (f) => {
    if (!f) return
    setAttachedFile(f)
    setAttachedPreview(URL.createObjectURL(f))
  }

  const send = async () => {
    const msg = input.trim()
    if (!msg && !attachedFile) return
    const userMsg = {
      role: 'user',
      content: msg || 'Please analyze this construction site image.',
      image: attachedPreview
    }
    setMessages(p => [...p, userMsg])
    setInput('')
    setLoading(true)
    const file = attachedFile
    setAttachedFile(null)
    setAttachedPreview(null)
    try {
      let res
      const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }))
      if (file) {
        res = await assistantAPI.analyzeSite(file, msg || 'Analyze this construction site image and provide expert observations')
      } else {
        res = await assistantAPI.chat({ message: msg, history })
      }
      setMessages(p => [...p, {
        role: 'assistant',
        content: res.data.response,
        suggestions: res.data.suggestions,
        references: res.data.references
      }])
    } catch (e) {
      toast.error(e.message)
      setMessages(p => [...p, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally { setLoading(false) }
  }

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }
  const clickSuggestion = (s) => { setInput(s); inputRef.current?.focus() }

  return (
    <div className="max-w-4xl h-[calc(100vh-130px)] flex flex-col gap-3">
      {/* Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center">
          <Bot size={22} className="text-green-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">AI Site Assistant</h2>
          <p className="text-xs text-slate-400">Construction expert • Image analysis • Code lookup • 24/7</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />Online
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl p-4 overflow-y-auto space-y-4 min-h-0">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${m.role === 'user' ? 'bg-blue-600' : 'bg-green-600/30'}`}>
              {m.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-green-400" />}
            </div>
            <div className={`max-w-[80%] space-y-2 ${m.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              {m.image && <img src={m.image} alt="attached" className="max-h-32 rounded-lg" />}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-700 text-slate-100 rounded-tl-sm'}`}>
                {m.content}
              </div>
              {m.suggestions?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {m.suggestions.filter(Boolean).map((s, j) => (
                    <button key={j} onClick={() => clickSuggestion(s)}
                      className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2.5 py-1 rounded-full border border-slate-600 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {m.references?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {m.references.filter(Boolean).map((r, j) => (
                    <span key={j} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-600">{r}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-green-600/30 flex items-center justify-center">
              <Bot size={14} className="text-green-400" />
            </div>
            <div className="bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-green-400" />
              <span className="text-xs text-slate-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex-shrink-0">
        {attachedPreview && (
          <div className="flex items-center gap-2 mb-2 bg-slate-700 rounded-lg px-3 py-2">
            <Image size={14} className="text-blue-400 flex-shrink-0" />
            <img src={attachedPreview} alt="preview" className="h-8 w-8 rounded object-cover" />
            <span className="text-xs text-slate-300 flex-1 truncate">{attachedFile?.name}</span>
            <button onClick={() => { setAttachedFile(null); setAttachedPreview(null) }}>
              <X size={14} className="text-slate-400 hover:text-white transition-colors" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <button onClick={() => fileRef.current?.click()} className="text-slate-400 hover:text-white transition-colors p-2 flex-shrink-0" title="Attach image">
            <Paperclip size={18} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => attachFile(e.target.files?.[0])} />
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about construction, safety, codes... or attach a site image"
            rows={1}
            className="flex-1 bg-slate-700 text-white text-sm rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-green-500 border border-slate-600 transition-colors max-h-28"
            style={{ fieldSizing: 'content' }}
          />
          <button onClick={send} disabled={loading || (!input.trim() && !attachedFile)}
            className="bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white p-2.5 rounded-lg transition-colors flex-shrink-0">
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-1.5 text-center">Enter to send • Shift+Enter for new line • 📎 Attach images for visual analysis</p>
      </div>
    </div>
  )
}
