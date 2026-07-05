import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { path: '/',            icon: '⊞', label: 'Dashboard',      desc: 'Overview' },
  { path: '/patients',    icon: '⊹', label: 'Patients',       desc: 'Records' },
  { path: '/emr',         icon: '⊟', label: 'EMR',            desc: 'Clinical notes' },
  { path: '/predictions', icon: '◈', label: 'AI Prediction',  desc: 'Diagnostics' },
  { path: '/lab-reports', icon: '⊕', label: 'Lab Reports',    desc: 'Analysis' },
  { path: '/assistant',   icon: '◉', label: 'AI Assistant',   desc: 'Medical AI' },
  { path: '/discharge',   icon: '◧', label: 'Discharge',      desc: 'Summaries' },
  { path: '/profile',     icon: '◎', label: 'Profile',        desc: 'Account' },
];

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout }          = useAuth();
  const location                  = useLocation();
  const navigate                  = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'DR';
  const currentPage = navItems.find(n => n.path === location.pathname);

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'var(--surface)' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: collapsed ? 64 : 220,
        flexShrink: 0,
        background: 'var(--navy-900)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
        borderRight: '1px solid var(--navy-800)',
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 0' : '20px 16px',
          borderBottom: '1px solid var(--navy-800)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 64,
        }}>
          {!collapsed && (
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                <div style={{
                  width:28, height:28, borderRadius:6,
                  background:'var(--navy-600)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:14, color:'blue', fontWeight:700,
                }}>D</div>
                <span style={{ color:'blue', fontWeight:600, fontSize:14, letterSpacing:'-0.01em' }}>
                  Doctor Helper
                </span>
              </div>
              <div style={{ marginLeft:36, fontSize:10, color:'#4da3e8', letterSpacing:'0.08em', textTransform:'uppercase' }}>
                CDSS Platform
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{
              width:28, height:28, borderRadius:6,
              background:'var(--navy-600)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:14, color:'white', fontWeight:700,
            }}>D</div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'12px 0', overflowY:'auto', overflowX:'hidden' }}>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{
                display:'flex',
                alignItems:'center',
                gap:10,
                padding: collapsed ? '10px 0' : '9px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                margin:'1px 8px',
                borderRadius:8,
                textDecoration:'none',
                background: active ? 'rgba(74,163,232,0.15)' : 'transparent',
                borderLeft: active ? '2px solid var(--navy-400)' : '2px solid transparent',
                transition:'all 0.15s',
              }}
              onMouseEnter={e => { if(!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if(!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{
                  fontSize:16,
                  color: active ? 'var(--navy-400)' : '#11e6e6',
                  flexShrink:0,
                  width:20,
                  textAlign:'center',
                }}>{item.icon}</span>
                {!collapsed && (
                  <div>
                    <div style={{
                      fontSize:13,
                      fontWeight: active ? 600 : 400,
                      color: active ? 'black' : '#050505',
                      lineHeight:1.2,
                    }}>{item.label}</div>
                    <div style={{ fontSize:10, color: active ? 'var(--navy-400)' : '#475569' }}>
                      {item.desc}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{
          padding: collapsed ? '12px 0' : '12px 12px',
          borderTop:'1px solid var(--navy-800)',
        }}>
          {!collapsed ? (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{
                width:32, height:32, borderRadius:8,
                background:'linear-gradient(135deg, var(--navy-600), var(--navy-400))',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:12, color:'white', fontWeight:700, flexShrink:0,
              }}>{initials}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'white', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  Dr. {user?.first_name} {user?.last_name}
                </div>
                <div style={{ fontSize:10, color:'#64748b', textTransform:'capitalize' }}>{user?.role}</div>
              </div>
              <button onClick={handleLogout} title="Sign out" style={{
                background:'none', border:'none', cursor:'pointer',
                color:'#64748b', fontSize:14, padding:4, borderRadius:4,
                transition:'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color='#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color='#64748b'}
              >✕</button>
            </div>
          ) : (
            <div style={{ display:'flex', justifyContent:'center' }}>
              <div style={{
                width:32, height:32, borderRadius:8,
                background:'linear-gradient(135deg, var(--navy-600), var(--navy-400))',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:12, color:'white', fontWeight:700,
              }}>{initials}</div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

        {/* Topbar */}
        <header style={{
          height:56,
          background:'var(--card)',
          borderBottom:'1px solid var(--border)',
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between',
          padding:'0 24px',
          flexShrink:0,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <button onClick={() => setCollapsed(!collapsed)} style={{
              background:'none', border:'1px solid var(--border)',
              borderRadius:6, cursor:'pointer', color:'var(--text-secondary)',
              width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:16, transition:'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='var(--surface)'; e.currentTarget.style.color='var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--text-secondary)'; }}
            >☰</button>
            <div>
              <span style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)' }}>
                {currentPage?.label || 'Doctor Helper'}
              </span>
              {currentPage?.desc && (
                <span style={{ fontSize:12, color:'var(--text-muted)', marginLeft:8 }}>
                  {currentPage.desc}
                </span>
              )}
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'4px 10px',
              background:'var(--clinical-green-bg)',
              border:'1px solid #b7e4d8',
              borderRadius:20,
            }}>
              <div style={{
                width:7, height:7, borderRadius:'50%',
                background:'var(--clinical-green)',
              }} className="pulse-dot" />
              <span style={{ fontSize:11, color:'var(--clinical-green)', fontWeight:600, letterSpacing:'0.03em' }}>
                SYSTEM ONLINE
              </span>
            </div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, overflowY:'auto', padding:'24px' }}>
          <div className="slide-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;