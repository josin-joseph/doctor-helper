import { useState, useEffect } from 'react';
import { authAPI, doctorAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import FormField, { inputSx } from '../components/common/FormField';

const Tab = ({label,active,onClick}) => (
  <button onClick={onClick} style={{padding:'8px 18px',borderRadius:8,fontSize:13,fontWeight:active?700:500,border:'none',cursor:'pointer',background:active?'#fff':'transparent',color:active?'var(--blue-700)':'var(--gray-400)',boxShadow:active?'0 1px 4px rgba(0,0,0,0.08)':'none',transition:'all 0.15s'}}>
    {label}
  </button>
);

export default function ProfilePage() {
  const { user } = useAuth();
  const [tab,setTab]             = useState('account');
  const [userForm,setUserForm]   = useState({first_name:'',last_name:'',email:'',phone:''});
  const [docForm,setDocForm]     = useState({specialization:'general',qualification:'',license_number:'',experience_years:0,hospital_name:'',hospital_address:'',bio:''});
  const [pwForm,setPwForm]       = useState({old_password:'',new_password:''});
  const [hasDocProfile,setHasDocProfile] = useState(false);
  const [saving,setSaving]       = useState(false);
  const [msg,setMsg]             = useState('');
  const [isError,setIsError]     = useState(false);

  useEffect(()=>{
    authAPI.getProfile().then(r=>setUserForm({first_name:r.data.first_name||'',last_name:r.data.last_name||'',email:r.data.email||'',phone:r.data.phone||''}));
    doctorAPI.getProfile().then(r=>{ setHasDocProfile(true); setDocForm({specialization:r.data.specialization||'general',qualification:r.data.qualification||'',license_number:r.data.license_number||'',experience_years:r.data.experience_years||0,hospital_name:r.data.hospital_name||'',hospital_address:r.data.hospital_address||'',bio:r.data.bio||''}); }).catch(()=>{});
  },[]);

  const showMsg = (text,error=false) => { setMsg(text); setIsError(error); setTimeout(()=>setMsg(''),4000); };

  const saveUser = async e => {
    e.preventDefault(); setSaving(true);
    try { await authAPI.updateProfile(userForm); showMsg('Account updated successfully.'); } catch{ showMsg('Error updating account.', true); }
    setSaving(false);
  };

  const saveDoctor = async e => {
    e.preventDefault(); setSaving(true);
    try { hasDocProfile ? await doctorAPI.updateProfile(docForm) : await doctorAPI.createProfile(docForm); setHasDocProfile(true); showMsg('Doctor profile saved successfully.'); } catch{ showMsg('Error saving doctor profile.', true); }
    setSaving(false);
  };

  const changePassword = async e => {
    e.preventDefault(); setSaving(true);
    try { await authAPI.changePassword(pwForm); showMsg('Password changed successfully.'); setPwForm({old_password:'',new_password:''}); } catch(err){ showMsg(err.response?.data?.error||'Error changing password.', true); }
    setSaving(false);
  };

  const initials = `${user?.first_name?.[0]||''}${user?.last_name?.[0]||''}`.toUpperCase()||'DR';

  return (
    <div style={{maxWidth:680,margin:'0 auto'}}>
      <PageHeader title="Profile" subtitle="Manage your account and clinical information"/>

      {/* Profile card */}
      <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'20px',marginBottom:16,display:'flex',alignItems:'center',gap:16}}>
        <div style={{width:60,height:60,borderRadius:16,background:'linear-gradient(135deg,var(--blue-600),var(--blue-200))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:900,color:'#fff',flexShrink:0}}>{initials}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:900,color:'var(--gray-900)',letterSpacing:'-0.02em'}}>Dr. {user?.first_name} {user?.last_name}</div>
          <div style={{fontSize:13,color:'var(--gray-400)',marginTop:2}}>{user?.email}</div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginTop:6}}>
            <span style={{fontSize:10,fontWeight:700,padding:'2px 9px',borderRadius:20,background:'var(--blue-50)',color:'var(--blue-700)',textTransform:'capitalize'}}>{user?.role}</span>
            <span style={{fontSize:10,fontWeight:700,padding:'2px 9px',borderRadius:20,background:'var(--green-50)',color:'var(--green-800)'}}>Verified</span>
          </div>
        </div>
      </div>

      {/* Alert */}
      {msg && (
        <div style={{background:isError?'var(--red-50)':'var(--green-50)',border:`1px solid ${isError?'#FECACA':'#A7F3D0'}`,borderRadius:10,padding:'10px 14px',marginBottom:14,fontSize:13,color:isError?'var(--red-800)':'var(--green-800)',fontWeight:600}}>
          {isError?'⚠ ':'✓ '}{msg}
        </div>
      )}

      {/* Tabs */}
      <div style={{background:'var(--gray-100)',borderRadius:10,padding:4,display:'flex',gap:2,width:'fit-content',marginBottom:14}}>
        <Tab label="Account"     active={tab==='account'}   onClick={()=>setTab('account')}/>
        <Tab label="Doctor info" active={tab==='doctor'}    onClick={()=>setTab('doctor')}/>
        <Tab label="Password"    active={tab==='password'}  onClick={()=>setTab('password')}/>
      </div>

      {tab==='account' && (
        <form onSubmit={saveUser} style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'20px',display:'flex',flexDirection:'column',gap:14}}>
          <div style={{fontSize:14,fontWeight:700,color:'var(--gray-900)',marginBottom:4}}>Account information</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <FormField label="First name"><input value={userForm.first_name} onChange={e=>setUserForm({...userForm,first_name:e.target.value})} style={inputSx} onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></FormField>
            <FormField label="Last name"><input value={userForm.last_name} onChange={e=>setUserForm({...userForm,last_name:e.target.value})} style={inputSx} onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></FormField>
            <FormField label="Email"><input type="email" value={userForm.email} onChange={e=>setUserForm({...userForm,email:e.target.value})} style={inputSx} onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></FormField>
            <FormField label="Phone"><input value={userForm.phone} onChange={e=>setUserForm({...userForm,phone:e.target.value})} style={inputSx} onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></FormField>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',paddingTop:4,borderTop:'1px solid var(--border)'}}>
            <Button type="submit" variant="primary" loading={saving}>Save changes</Button>
          </div>
        </form>
      )}

      {tab==='doctor' && (
        <form onSubmit={saveDoctor} style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'20px',display:'flex',flexDirection:'column',gap:14}}>
          <div style={{fontSize:14,fontWeight:700,color:'var(--gray-900)',marginBottom:4}}>Clinical information</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <FormField label="Specialization">
              <select value={docForm.specialization} onChange={e=>setDocForm({...docForm,specialization:e.target.value})} style={inputSx}>
                {['general','cardiology','neurology','orthopedics','pediatrics','gynecology','dermatology','psychiatry','radiology','surgery','oncology','other'].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </FormField>
            <FormField label="Qualification"><input value={docForm.qualification} onChange={e=>setDocForm({...docForm,qualification:e.target.value})} style={inputSx} onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></FormField>
            <FormField label="License number"><input value={docForm.license_number} onChange={e=>setDocForm({...docForm,license_number:e.target.value})} style={inputSx} onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></FormField>
            <FormField label="Experience (years)"><input type="number" value={docForm.experience_years} onChange={e=>setDocForm({...docForm,experience_years:e.target.value})} style={inputSx} onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></FormField>
            <div style={{gridColumn:'1/-1'}}>
              <FormField label="Hospital name"><input value={docForm.hospital_name} onChange={e=>setDocForm({...docForm,hospital_name:e.target.value})} style={inputSx} onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></FormField>
            </div>
            <div style={{gridColumn:'1/-1'}}>
              <FormField label="Hospital address"><textarea rows={2} value={docForm.hospital_address} onChange={e=>setDocForm({...docForm,hospital_address:e.target.value})} style={{...inputSx,resize:'vertical'}} onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></FormField>
            </div>
            <div style={{gridColumn:'1/-1'}}>
              <FormField label="Bio"><textarea rows={3} value={docForm.bio} onChange={e=>setDocForm({...docForm,bio:e.target.value})} style={{...inputSx,resize:'vertical'}} onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></FormField>
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',paddingTop:4,borderTop:'1px solid var(--border)'}}>
            <Button type="submit" variant="primary" loading={saving}>{hasDocProfile?'Update profile':'Create profile'}</Button>
          </div>
        </form>
      )}

      {tab==='password' && (
        <form onSubmit={changePassword} style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'20px',display:'flex',flexDirection:'column',gap:14}}>
          <div style={{fontSize:14,fontWeight:700,color:'var(--gray-900)',marginBottom:4}}>Change password</div>
          <FormField label="Current password">
            <input type="password" value={pwForm.old_password} onChange={e=>setPwForm({...pwForm,old_password:e.target.value})} style={inputSx} required onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
          </FormField>
          <FormField label="New password">
            <input type="password" value={pwForm.new_password} onChange={e=>setPwForm({...pwForm,new_password:e.target.value})} style={inputSx} required onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
          </FormField>
          <div style={{display:'flex',justifyContent:'flex-end',paddingTop:4,borderTop:'1px solid var(--border)'}}>
            <Button type="submit" variant="primary" loading={saving}>Change password</Button>
          </div>
        </form>
      )}
    </div>
  );
}