import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import StatCard from '../components/common/StatCard';
import Spinner from '../components/common/Spinner';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Icon = {
  users:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  check:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  brain:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  lab:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>,
  alert:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  doc:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  chat:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  activity: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
};

const Card = ({ children, style={} }) => (
  <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'18px 20px',...style}}>
    {children}
  </div>
);

const SectionTitle = ({ icon, title, sub }) => (
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <span style={{color:'var(--blue-600)'}}>{icon}</span>
      <span style={{fontSize:13,fontWeight:700,color:'var(--gray-900)'}}>{title}</span>
    </div>
    {sub && <span style={{fontSize:11,color:'var(--gray-400)'}}>{sub}</span>}
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    active:     {bg:'var(--green-50)',color:'var(--green-800)'},
    critical:   {bg:'var(--red-50)',  color:'var(--red-800)'},
    discharged: {bg:'var(--blue-50)', color:'var(--blue-800)'},
    deceased:   {bg:'var(--gray-100)',color:'var(--gray-500)'},
  };
  const s = map[status]||map.discharged;
  return <span style={{fontSize:10,fontWeight:700,padding:'3px 9px',borderRadius:20,letterSpacing:'0.04em',textTransform:'uppercase',...s}}>{status}</span>;
};

const CustomTooltip = ({ active, payload, label }) => active&&payload?.length ? (
  <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:9,padding:'8px 14px',boxShadow:'0 4px 16px rgba(0,0,0,0.08)',fontSize:12}}>
    <div style={{fontWeight:600,color:'var(--gray-500)',marginBottom:3}}>{label}</div>
    <div style={{fontWeight:800,color:'var(--blue-600)'}}>{payload[0].value} {payload[0].name}</div>
  </div>
) : null;

export default function DashboardPage() {
  const [stats, setStats]       = useState(null);
  const [activity, setActivity] = useState(null);
  const [diseases, setDiseases] = useState(null);
  const [notifs, setNotifs]     = useState([]);
  const [trends, setTrends]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardAPI.getStats(),
      dashboardAPI.getActivity(),
      dashboardAPI.getDiseaseTrends(),
      dashboardAPI.getNotifications(),
      dashboardAPI.getTrends(),
    ]).then(([s,a,d,n,t]) => {
      setStats(s.data); setActivity(a.data); setDiseases(d.data);
      setNotifs(n.data.notifications||[]); setTrends(t.data.monthly_registrations||[]);
    }).finally(()=>setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" label="Loading dashboard..."/>;

  const highAlerts = notifs.filter(n=>n.priority==='high');

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>

      {/* Alert banner */}
      {highAlerts.length > 0 && (
        <div style={{background:'var(--red-50)',border:'1px solid #FECACA',borderRadius:12,padding:'12px 16px',display:'flex',alignItems:'center',gap:10}}>
          <span style={{color:'var(--red-600)',flexShrink:0}}>{Icon.alert}</span>
          <div>
            <span style={{fontWeight:800,color:'var(--red-800)',fontSize:13}}>{highAlerts.length} critical alert{highAlerts.length>1?'s':''} require immediate attention</span>
            <span style={{fontSize:12,color:'var(--red-600)',opacity:.8,marginLeft:8}}>Review critical lab values and follow-ups below</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        <StatCard title="Total patients"     value={stats?.patients?.total||0}       icon={Icon.users}    iconBg="var(--blue-50)"   iconColor="var(--blue-600)"   trendLabel={`${stats?.patients?.new_this_month||0} new this month`}   trend="up"/>
        <StatCard title="Active cases"       value={stats?.patients?.active||0}      icon={Icon.check}    iconBg="var(--green-50)"  iconColor="var(--green-600)"  trendLabel={`${stats?.patients?.critical||0} critical`}               trend={stats?.patients?.critical>0?'down':'up'}/>
        <StatCard title="AI predictions"     value={stats?.predictions?.total||0}    icon={Icon.brain}    iconBg="var(--purple-50)" iconColor="var(--purple-600)" trendLabel={`${stats?.predictions?.this_month||0} this month`}         trend="up"/>
        <StatCard title="Lab reports"        value={stats?.lab_reports?.total||0}    icon={Icon.lab}      iconBg="var(--red-50)"    iconColor="var(--red-600)"    trendLabel={`${stats?.lab_reports?.abnormal||0} abnormal`}             trend={stats?.lab_reports?.abnormal>0?'down':'up'}/>
        <StatCard title="Total encounters"   value={stats?.encounters?.total||0}     icon={Icon.activity} iconBg="var(--blue-50)"   iconColor="var(--blue-600)"   trendLabel={`${stats?.encounters?.this_week||0} this week`}            trend="up"/>
        <StatCard title="Critical alerts"    value={stats?.lab_reports?.critical||0} icon={Icon.alert}    iconBg="var(--red-50)"    iconColor="var(--red-600)"    trendLabel="Needs immediate review"                                    trend={stats?.lab_reports?.critical>0?'down':'neutral'}/>
        <StatCard title="Discharge summaries"value={stats?.discharges?.total||0}     icon={Icon.doc}      iconBg="var(--green-50)"  iconColor="var(--green-600)"  trendLabel="Total generated"                                          trend="neutral"/>
        <StatCard title="AI queries"         value={stats?.ai_queries?.total||0}     icon={Icon.chat}     iconBg="var(--blue-50)"   iconColor="var(--blue-600)"   trendLabel="Medical assistant"                                        trend="up"/>
      </div>

      {/* Charts row */}
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:14}}>
        <Card>
          <SectionTitle icon={Icon.activity} title="Patient registrations" sub="Last 6 months"/>
          {trends.length>0 ? (
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={trends} margin={{top:4,right:4,left:-24,bottom:0}}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" vertical={false}/>
                <XAxis dataKey="month" tick={{fontSize:11,fill:'var(--gray-400)'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:'var(--gray-400)'}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="count" name="patients" stroke="var(--blue-600)" strokeWidth={2.5} fill="url(#blueGrad)" dot={false} activeDot={{r:4,fill:'var(--blue-600)'}}/>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{height:190,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,color:'var(--gray-300)'}}>
              <span style={{fontSize:32}}>📈</span>
              <span style={{fontSize:13,color:'var(--gray-400)'}}>Add patients to see trends</span>
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle icon={Icon.brain} title="Top diseases" sub="By predictions"/>
          {diseases?.top_diseases?.length>0 ? (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {diseases.top_diseases.slice(0,6).map((d,i)=>{
                const pct = Math.round((d.count/(diseases.top_diseases[0]?.count||1))*100);
                return (
                  <div key={i}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                      <span style={{fontSize:12,color:'var(--gray-700)',fontWeight:500}}>{d.disease}</span>
                      <span style={{fontSize:11,color:'var(--gray-400)',fontFamily:'monospace'}}>{d.count}</span>
                    </div>
                    <div style={{background:'var(--gray-100)',borderRadius:4,height:5,overflow:'hidden'}}>
                      <div style={{width:`${pct}%`,height:'100%',background:'var(--blue-500)',borderRadius:4,transition:'width 0.8s ease'}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:160,gap:8,color:'var(--gray-300)'}}>
              <span style={{fontSize:28}}>🤖</span>
              <span style={{fontSize:12,color:'var(--gray-400)'}}>No predictions yet</span>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom row */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <Card style={{padding:0,overflow:'hidden'}}>
          <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{color:'var(--blue-600)'}}>{Icon.users}</span>
              <span style={{fontSize:13,fontWeight:700,color:'var(--gray-900)'}}>Recent patients</span>
            </div>
          </div>
          {activity?.recent_patients?.length>0 ? (
            activity.recent_patients.map((p,i)=>(
              <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 18px',borderBottom:i<activity.recent_patients.length-1?'1px solid var(--gray-50)':'none',transition:'background 0.15s'}}
                onMouseEnter={e=>e.currentTarget.style.background='var(--gray-50)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{width:34,height:34,borderRadius:9,background:'var(--blue-50)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'var(--blue-700)',flexShrink:0}}>
                  {p.name?.[0]||'?'}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:'var(--gray-900)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</div>
                  <div style={{fontSize:11,color:'var(--gray-400)',fontFamily:'monospace'}}>{p.patient_id}</div>
                </div>
                <StatusBadge status={p.status}/>
              </div>
            ))
          ) : (
            <div style={{padding:'40px 20px',textAlign:'center',color:'var(--gray-400)'}}>
              <div style={{fontSize:28,marginBottom:8}}>👥</div>
              <div style={{fontSize:13,fontWeight:600}}>No patients yet</div>
              <div style={{fontSize:12,marginTop:3}}>Add your first patient to get started.</div>
            </div>
          )}
        </Card>

        <Card style={{padding:0,overflow:'hidden'}}>
          <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{color:'var(--blue-600)'}}>{Icon.alert}</span>
              <span style={{fontSize:13,fontWeight:700,color:'var(--gray-900)'}}>Alerts</span>
            </div>
            {notifs.length>0 && <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:20,background:'var(--red-50)',color:'var(--red-800)'}}>{notifs.length}</span>}
          </div>
          {notifs.length>0 ? (
            <div style={{maxHeight:260,overflowY:'auto'}}>
              {notifs.map((n,i)=>(
                <div key={i} style={{display:'flex',gap:12,padding:'12px 18px',borderBottom:i<notifs.length-1?'1px solid var(--gray-50)':'none',borderLeft:`3px solid ${n.priority==='high'?'var(--red-600)':'var(--amber-600)'}`}}>
                  <span style={{fontSize:16,flexShrink:0}}>{n.priority==='high'?'🔴':'🟡'}</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:'var(--gray-900)'}}>{n.message}</div>
                    <div style={{fontSize:11,color:'var(--gray-400)',marginTop:2}}>{n.patient} · {n.date}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{padding:'40px 20px',textAlign:'center'}}>
              <div style={{fontSize:28,marginBottom:8}}>✅</div>
              <div style={{fontSize:13,fontWeight:700,color:'var(--green-600)'}}>All clear</div>
              <div style={{fontSize:12,color:'var(--gray-400)',marginTop:4}}>No active alerts right now.</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}