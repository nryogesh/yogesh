import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Menu,
  LibraryBig,
  Search,
  Target,
  UserRound,
  X,
  Zap,
} from 'lucide-react'

const navigation = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'AI Tutor', to: '/tutor', icon: BrainCircuit },
  { label: 'Learning Roadmap', to: '/roadmap', icon: Target },
  { label: 'Topics', to: '/topics', icon: BookOpen },
  { label: 'Java Documentation', to: '/java-docs', icon: LibraryBig },
  { label: 'Practice', to: '/practice', icon: CircleHelp },
  { label: 'Progress', to: '/progress', icon: Zap },
  { label: 'Profile', to: '/profile', icon: UserRound },
]

function Sidebar({ collapsed, setCollapsed, open, setOpen }) {
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
      <div className="sidebar-user">
        <div className="avatar avatar-small"><UserRound size={15} /></div>
        {!collapsed && <div className="user-copy"><strong>Guest learner</strong><span>Account not connected</span></div>}
        {!collapsed && <button className="icon-button" aria-label="Open profile"><ChevronRight size={16} /></button>}
      </div>
      <button className="collapse-button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}<span>{!collapsed && 'Collapse'}</span>
      </button>
    </aside>
  )
}

function Navbar({ onMenu }) {
  const location = useLocation()
  const titles = { '/': 'Dashboard', '/tutor': 'AI Tutor', '/roadmap': 'Learning Roadmap', '/topics': 'Topics', '/practice': 'Practice', '/progress': 'Progress', '/profile': 'Profile', '/java-docs': 'Java Documentation' }
  const title = titles[location.pathname] || 'Dashboard'
  return <header className="topbar">
    <div className="topbar-left"><button className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button><div><div className="eyebrow">Workspace / {title}</div><h1>{title}</h1></div></div>
    <div className="topbar-actions"><button className="search-button" aria-label="Search"><Search size={17} /><span>Search anything</span><kbd>⌘ K</kbd></button><button className="icon-button" aria-label="Notifications"><Bell size={18} /><i className="notification-dot" /></button><button className="logout-placeholder" type="button" disabled title="Authentication is not connected yet"><LogOut size={15} /><span>Log out <small>placeholder</small></span></button></div>
  </header>
}

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  if (location.pathname === '/login' || location.pathname === '/signup') {
    return <main className="auth-shell">{children}</main>
  }

  return <div className="app-shell"><Sidebar collapsed={collapsed} setCollapsed={setCollapsed} open={open} setOpen={setOpen} /><div className="shell-main"><Navbar onMenu={() => setOpen(true)} /><main className="page-content">{children}</main></div>{open && <button className="drawer-scrim" onClick={() => setOpen(false)} aria-label="Close navigation" />}</div>
}
