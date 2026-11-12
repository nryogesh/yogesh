import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Activity,
  LayoutDashboard,
  LogOut,
  LibraryBig,
  Menu,
  Target,
  UserRound,
  X,
  Zap,
} from 'lucide-react'
import { clearLearnerProfile, loadLearnerProfile, subscribeToLearnerProfile } from '../services/learner-profile'

const navigation = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'AI Tutor', to: '/tutor', icon: BrainCircuit },
  { label: 'Learning Roadmap', to: '/roadmap', icon: Target },
  { label: 'Topics', to: '/topics', icon: BookOpen },
  { label: 'Notes', to: '/notes', icon: LibraryBig },
  { label: 'Visualizer', to: '/visualizer', icon: Activity },
  { label: 'Java Documentation', to: '/java-docs', icon: LibraryBig },
  { label: 'Practice', to: '/practice', icon: CircleHelp },
  { label: 'Progress', to: '/progress', icon: Zap },
  { label: 'Profile', to: '/profile', icon: UserRound },
]

function Sidebar({ collapsed, setCollapsed, open, setOpen }) {
  const profile = loadLearnerProfile()

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${open ? 'sidebar-open' : ''}`}>
      <div className="brand-row">
        <div className="brand-mark"><BrainCircuit size={18} /></div>
        {!collapsed && <span className="brand-name">mentor<span>.ai</span></span>}
        <button className="icon-button sidebar-close" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={18} /></button>
      </div>
      <div className="sidebar-section-label">Workspace</div>
      <nav className="side-nav" aria-label="Main navigation">
        {navigation.map(({ label, to, icon: Icon }) => (
          <NavLink key={label} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
            <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <Link className="sidebar-user sidebar-user-link" to="/profile">
        <div className="avatar avatar-small"><UserRound size={15} /></div>
        {!collapsed && <div className="user-copy"><strong>{profile?.displayName || 'Guest learner'}</strong><span>{profile ? 'Demo profile' : 'Continue as demo'}</span></div>}
        {!collapsed && <ChevronRight size={16} />}
      </Link>
      <button className="collapse-button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}<span>{!collapsed && 'Collapse'}</span>
      </button>
    </aside>
  )
}

function Navbar({ onMenu, profile }) {
  const location = useLocation()
  const navigate = useNavigate()
  const titles = { '/': 'Dashboard', '/tutor': 'AI Tutor', '/roadmap': 'Learning Roadmap', '/topics': 'Topics', '/notes': 'Notes', '/visualizer': 'Visualizer', '/practice': 'Practice', '/progress': 'Progress', '/profile': 'Profile', '/java-docs': 'Java Documentation' }
  const title = location.pathname.startsWith('/topics/') ? 'Topic lesson' : titles[location.pathname] || 'Dashboard'
  return <header className="topbar">
    <div className="topbar-left"><button className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button><div><div className="eyebrow">Workspace / {title}</div><h1>{title}</h1></div></div>
    <div className="topbar-actions"><Link className="search-button" to="/topics"><BookOpen size={17} /><span>Browse topics</span></Link>{profile ? <button className="logout-placeholder" type="button" aria-label="Log out" onClick={() => { clearLearnerProfile(); navigate('/login') }}><LogOut size={15} /><span>Log out</span></button> : <Link className="logout-placeholder" to="/login" aria-label="Continue as Demo User"><UserRound size={15} /><span>Continue as demo</span></Link>}</div>
  </header>
}

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState(loadLearnerProfile)
  const location = useLocation()

  useEffect(() => subscribeToLearnerProfile(() => setProfile(loadLearnerProfile())), [])

  if (location.pathname === '/login' || location.pathname === '/signup') {
    return <main className="auth-shell">{children}</main>
  }

  return <div className="app-shell"><Sidebar collapsed={collapsed} setCollapsed={setCollapsed} open={open} setOpen={setOpen} /><div className="shell-main"><Navbar onMenu={() => setOpen(true)} profile={profile} /><main className="page-content">{children}</main></div>{open && <button className="drawer-scrim" onClick={() => setOpen(false)} aria-label="Close navigation" />}</div>
}
