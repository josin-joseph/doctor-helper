import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [form, setForm]       = useState({ username:'', password:'' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setError('');
    try { await login(form); navigate('/'); }
    catch(err){ setError(err.response?.data?.non_field_errors?.[0]||'Invalid credentials.'); }
    setLoading(false);
  };

  const features = [
    { icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, text:'AI disease prediction across 754 conditions with 83.7% accuracy' },
    { icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>, text:'Automated lab report analysis with clinical significance' },
    { icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, text:'Llama 3 AI assistant with 773-disease knowledge base' },
    { icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, text:'One-click professional discharge summaries with PDF export' },
  ];

  return (
    <div style={{minHeight:'100vh',background:'#F0F4FF',display:'flex',overflow:'hidden'}}>

      {/* Left — hero */}
      <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',padding:'60px 64px',position:'relative'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 60% 40%, rgba(37,99,235,0.06) 0%, transparent 60%)',pointerEvents:'none'}}/>

        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:40}}>
          <div style={{width:44,height:44,borderRadius:12,background:'var(--blue-600)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:900,color:'#fff'}}>D</div>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:'var(--gray-900)',letterSpacing:'-0.02em'}}>Doctor Helper</div>
            <div style={{fontSize:10,color:'var(--blue-600)',letterSpacing:'0.1em',textTransform:'uppercase',fontWeight:700}}>Clinical Decision Support</div>
          </div>
        </div>

        <h1 style={{fontSize:42,fontWeight:900,color:'var(--gray-900)',lineHeight:1.1,letterSpacing:'-0.03em',marginBottom:16}}>
          Clinical decisions,<br/>
          <span style={{color:'var(--blue-600)'}}>powered by AI.</span>
        </h1>
        <p style={{fontSize:15,color:'var(--gray-400)',lineHeight:1.7,maxWidth:380,marginBottom:40}}>
          An intelligent EMR and CDSS built for modern clinical practice. Predict, analyze, and document with confidence.
        </p>

        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {features.map((f,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:34,height:34,borderRadius:9,background:'var(--blue-50)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--blue-600)',flexShrink:0}}>{f.icon}</div>
              <span style={{fontSize:13,color:'var(--gray-500)',lineHeight:1.4}}>{f.text}</span>
            </div>
          ))}
        </div>

        <div style={{marginTop:48,display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:'var(--green-600)'}} className="pulse-dot"/>
          <span style={{fontSize:11,color:'var(--gray-400)'}}>All AI services operational · Llama 3 · FAISS · XGBoost</span>
        </div>
      </div>

      {/* Right — form */}
      <div style={{width:460,background:'#fff',borderLeft:'1px solid var(--border)',display:'flex',flexDirection:'column',justifyContent:'center',padding:'60px 48px'}}>
        <h2 style={{fontSize:26,fontWeight:900,color:'var(--gray-900)',letterSpacing:'-0.02em',marginBottom:6}}>Sign in</h2>
        <p style={{fontSize:13,color:'var(--gray-400)',marginBottom:28}}>Access your clinical workspace</p>

        {error && (
          <div style={{background:'var(--red-50)',border:'1px solid #FECACA',borderRadius:10,padding:'10px 14px',marginBottom:18,fontSize:13,color:'var(--red-800)',display:'flex',alignItems:'center',gap:8}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
          {[{label:'Username',key:'username',type:'text',ph:'Enter your username'},{label:'Password',key:'password',type:'password',ph:'Enter your password'}].map(({label,key,type,ph})=>(
            <div key={key}>
              <label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--gray-400)',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:6}}>{label}</label>
              <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={ph} required
                style={{width:'100%',border:'1.5px solid var(--border)',borderRadius:10,padding:'10px 14px',fontSize:14,color:'var(--gray-900)',outline:'none',background:'var(--gray-50)',transition:'all 0.15s'}}
                onFocus={e=>{e.target.style.borderColor='var(--blue-600)';e.target.style.background='#fff';e.target.style.boxShadow='0 0 0 3px rgba(37,99,235,0.08)';}}
                onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.background='var(--gray-50)';e.target.style.boxShadow='none';}}/>
            </div>
          ))}

          <button type="submit" disabled={loading} style={{
            background: loading?'var(--gray-300)':'var(--blue-600)',color:'#fff',border:'none',borderRadius:10,
            padding:'12px',fontSize:14,fontWeight:800,cursor:loading?'not-allowed':'pointer',
            marginTop:4,letterSpacing:'-0.01em',transition:'all 0.15s',
            display:'flex',alignItems:'center',justifyContent:'center',gap:8,
          }}>
            {loading ? <><span style={{width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block'}}/> Signing in...</> : 'Sign in →'}
          </button>
        </form>

        <p style={{textAlign:'center',fontSize:13,color:'var(--gray-400)',marginTop:24}}>
          No account? <Link to="/register" style={{color:'var(--blue-600)',fontWeight:700,textDecoration:'none'}}>Create one</Link>
        </p>

        <div style={{marginTop:44,paddingTop:20,borderTop:'1px solid var(--border)'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[['754','Diseases covered'],['377','Symptoms tracked'],['83.7%','Model accuracy'],['773','AI knowledge docs']].map(([v,l])=>(
              <div key={l} style={{background:'var(--blue-50)',borderRadius:10,padding:'10px 12px'}}>
                <div style={{fontSize:18,fontWeight:900,color:'var(--blue-700)',letterSpacing:'-0.02em'}}>{v}</div>
                <div style={{fontSize:10,color:'var(--blue-600)',fontWeight:600,marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}