import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import {
  LayoutDashboard, ShieldAlert, Scan, Building2,
  CalendarDays, CloudSun, MessageSquare, BookOpen, Menu
} from 'lucide-react'
import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import SafetyMonitor from './pages/SafetyMonitor'
import CrackDetection from './pages/CrackDetection'
import RealEstateValuation from './pages/RealEstateValuation'
import ProjectPlanning from './pages/ProjectPlanning'
import WeatherAdvisory from './pages/WeatherAdvisory'
import SiteAssistant from './pages/SiteAssistant'
import KnowledgeBase from './pages/KnowledgeBase'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/safety', icon: ShieldAlert, label: 'Safety Monitor' },
  { to: '/crack', icon: Scan, label: 'Crack Detection' },
  { to: '/valuation', icon: Building2, label: 'RE Valuation' },
  { to: '/planning', icon: CalendarDays, label: 'Project Planning' },
  { to: '/weather', icon: CloudSun, label: 'Weather Advisory' },
  { to: '/assistant', icon: MessageSquare, label: 'Site Assistant' },
  { to: '/knowledge', icon: BookOpen, label: 'Knowledge Base' },
]

function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-800 border-r border-slate-700 z-30 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">CI</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Construction</p>
            <p className="text-slate-400 text-xs">Intelligence Platform</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'}`
              }>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-slate-700">
          <p className="text-xs text-slate-500">Powered by Gemini AI</p>
          <p className="text-xs text-slate-600 mt-0.5">v1.0.0 • Construction Platform</p>
        </div>
      </aside>
    </>
  )
}

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const currentPage = navItems.find(n => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to))?.label || 'Dashboard'

  return (
    <div className="min-h-screen bg-slate-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <Menu size={22} />
          </button>
          <h1 className="text-base font-semibold text-white">{currentPage}</h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs text-slate-400 hidden sm:block">AI Online</span>
          </div>
        </header>
        <main className="p-4 md:p-6 min-h-[calc(100vh-57px)]">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#0f172a' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#0f172a' } },
        }}
      />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/safety" element={<SafetyMonitor />} />
          <Route path="/crack" element={<CrackDetection />} />
          <Route path="/valuation" element={<RealEstateValuation />} />
          <Route path="/planning" element={<ProjectPlanning />} />
          <Route path="/weather" element={<WeatherAdvisory />} />
          <Route path="/assistant" element={<SiteAssistant />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
