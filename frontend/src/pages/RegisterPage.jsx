import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import FormField, { inputSx } from '../components/common/FormField';

export default function RegisterPage() {
  const [form,setForm] = useState({username:'',email:'',first_name:'',last_name:'',password:'',password2:'',role:'doctor',phone:''});
  const [error,setError]     = useState('');
  const [loading,setLoading] = useState(false);
  const { login }            = useAuth();
  const navigate             = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await authAPI.register(form);
      await login({username:form.username,password:form.password});
      navigate('/');
    } catch(err){ setError(JSON.stringify(err.response?.data||'Registration failed.')); }
    setLoading(false);
  };

  return (
    <div style={{minHeight:'100vh',background:'#F0F4FF',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:18,boxShadow:'0 20px 60px rgba(0,0,0,0.1)',width:'100%',maxWidth:500,padding:'36px 40px'}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{width:48,height:48,borderRadius:13,background:'var(--blue-600)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:900,color:'#fff',margin:'0 auto 12px'}}>D</div>
          <h1 style={{fontSize:22,fontWeight:900,color:'var(--gray-900)',letterSpacing:'-0.02em'}}>Create account</h1>
          <p style={{fontSize:13,color:'var(--gray-400)',marginTop:4}}>Register as a doctor on Doctor Helper</p>
        </div>

        {error && <div style={{background:'var(--red-50)',border:'1px solid #FECACA',borderRadius:10,padding:'10px 14px',marginBottom:16,fontSize:13,color:'var(--red-800)'}}>{error}</div>}

        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <FormField label="First name" required><input value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})} style={inputSx} required onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></FormField>
            <FormField label="Last name" required><input value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})} style={inputSx} required onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></FormField>
          </div>
          {[{label:'Username',key:'username',type:'text'},{label:'Email',key:'email',type:'email'},{label:'Phone',key:'phone',type:'text'},{label:'Password',key:'password',type:'password'},{label:'Confirm password',key:'password2',type:'password'}].map(({label,key,type})=>(
            <FormField key={key} label={label} required>
              <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} style={inputSx} required
                onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
            </FormField>
          ))}
          <button type="submit" disabled={loading} style={{background:loading?'var(--gray-300)':'var(--blue-600)',color:'#fff',border:'none',borderRadius:10,padding:'12px',fontSize:14,fontWeight:800,cursor:loading?'not-allowed':'pointer',transition:'all 0.15s',display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:4}}>
            {loading?<><span style={{width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block'}}/>Creating...</>:'Create account →'}
          </button>
        </form>
        <p style={{textAlign:'center',fontSize:13,color:'var(--gray-400)',marginTop:20}}>
          Already have an account? <Link to="/login" style={{color:'var(--blue-600)',fontWeight:700,textDecoration:'none'}}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}