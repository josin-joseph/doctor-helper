import { useState, useEffect } from 'react';
import { patientAPI } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import FormField, { inputSx } from '../components/common/FormField';

const EMPTY = {
  first_name:'',last_name:'',date_of_birth:'',gender:'male',blood_group:'',
  phone:'',email:'',address:'',city:'',state:'',
  emergency_contact_name:'',emergency_contact_phone:'',
  known_allergies:'',chronic_conditions:'',status:'active',
};

const StatusBadge = ({s}) => {
  const m = {active:{bg:'var(--green-50)',c:'var(--green-800)'},critical:{bg:'var(--red-50)',c:'var(--red-800)'},discharged:{bg:'var(--blue-50)',c:'var(--blue-800)'},deceased:{bg:'var(--gray-100)',c:'var(--gray-500)'}};
  const v = m[s]||m.discharged;
  return <span style={{fontSize:10,fontWeight:700,padding:'3px 9px',borderRadius:20,letterSpacing:'0.04em',textTransform:'uppercase',background:v.bg,color:v.c}}>{s}</span>;
};

export default function PatientsPage() {
  const [patients,setPatients] = useState([]);
  const [loading,setLoading]   = useState(true);
  const [search,setSearch]     = useState('');
  const [statusFilter,setStatusFilter] = useState('');
  const [showModal,setShowModal]       = useState(false);
  const [form,setForm]                 = useState(EMPTY);
  const [editing,setEditing]           = useState(null);
  const [saving,setSaving]             = useState(false);
  const [error,setError]               = useState('');
  const [stats,setStats]               = useState(null);

  const fetchPatients = async(q='',s='') => {
    setLoading(true);
    try { const r = await patientAPI.getAll({search:q,status:s}); setPatients(r.data.results||r.data); } catch{}
    setLoading(false);
  };

  useEffect(()=>{ fetchPatients(); patientAPI.getStats().then(r=>setStats(r.data)).catch(()=>{}); },[]);

  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setError(''); setShowModal(true); };
  const openEdit = p  => { setEditing(p.id); setForm({first_name:p.first_name,last_name:p.last_name,date_of_birth:p.date_of_birth,gender:p.gender,blood_group:p.blood_group||'',phone:p.phone,email:p.email||'',address:p.address||'',city:p.city||'',state:p.state||'',emergency_contact_name:p.emergency_contact_name||'',emergency_contact_phone:p.emergency_contact_phone||'',known_allergies:p.known_allergies||'',chronic_conditions:p.chronic_conditions||'',status:p.status}); setError(''); setShowModal(true); };

  const handleDelete = async id => {
    if(!window.confirm('Delete this patient record? This cannot be undone.')) return;
    await patientAPI.delete(id);
    fetchPatients(search,statusFilter);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true); setError('');
    try { editing ? await patientAPI.update(editing,form) : await patientAPI.create(form); setShowModal(false); fetchPatients(search,statusFilter); patientAPI.getStats().then(r=>setStats(r.data)).catch(()=>{}); }
    catch(err){ setError(JSON.stringify(err.response?.data||'Error saving')); }
    setSaving(false);
  };

  const thStyle = {padding:'10px 14px',fontSize:10,fontWeight:700,color:'var(--gray-400)',letterSpacing:'0.07em',textTransform:'uppercase',textAlign:'left',borderBottom:'1px solid var(--border)',background:'var(--gray-50)',whiteSpace:'nowrap'};
  const tdStyle = {padding:'12px 14px',fontSize:13,color:'var(--gray-700)',borderBottom:'1px solid var(--gray-50)',verticalAlign:'middle'};

  return (
    <div>
      <PageHeader title="Patients" badge={`${stats?.total||0} total`} subtitle="Manage patient records and demographics"
        action={<Button onClick={openAdd} variant="primary" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}>Add patient</Button>}/>

      {/* Quick stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
        {[
          {label:'Total',value:stats?.total||0,color:'var(--blue-600)',bg:'var(--blue-50)'},
          {label:'Active',value:stats?.active||0,color:'var(--green-600)',bg:'var(--green-50)'},
          {label:'Critical',value:stats?.critical||0,color:'var(--red-600)',bg:'var(--red-50)'},
          {label:'Discharged',value:stats?.discharged||0,color:'var(--gray-500)',bg:'var(--gray-100)'},
        ].map(s=>(
          <div key={s.label} style={{background:'#fff',border:'1px solid var(--border)',borderRadius:12,padding:'12px 16px',display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:36,height:36,borderRadius:9,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:900,color:s.color}}>{s.value}</div>
            <span style={{fontSize:12,fontWeight:600,color:'var(--gray-500)'}}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Search and filter */}
      <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:12,padding:'12px 16px',marginBottom:14,display:'flex',gap:10,alignItems:'center'}}>
        <div style={{flex:1,position:'relative'}}>
          <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--gray-300)'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input value={search} onChange={e=>{setSearch(e.target.value);fetchPatients(e.target.value,statusFilter);}} placeholder="Search by name, patient ID, or phone..."
            style={{...inputSx,paddingLeft:32,background:'var(--gray-50)'}}
            onFocus={e=>{e.target.style.borderColor='var(--blue-600)';e.target.style.background='#fff';}}
            onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.background='var(--gray-50)';}}/>
        </div>
        <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);fetchPatients(search,e.target.value);}}
          style={{...inputSx,width:140,background:'var(--gray-50)'}}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="critical">Critical</option>
          <option value="discharged">Discharged</option>
          <option value="deceased">Deceased</option>
        </select>
      </div>

      {/* Table */}
      <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,overflow:'hidden'}}>
        {loading ? <div style={{padding:40}}><Spinner/></div> : patients.length===0 ? (
          <div style={{padding:'60px 20px',textAlign:'center',color:'var(--gray-400)'}}>
            <div style={{fontSize:36,marginBottom:12}}>👥</div>
            <div style={{fontSize:16,fontWeight:700,color:'var(--gray-700)',marginBottom:6}}>No patients found</div>
            <div style={{fontSize:13,marginBottom:16}}>Add your first patient to get started.</div>
            <Button onClick={openAdd} variant="primary">Add patient</Button>
          </div>
        ) : (
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr>
                  {['Patient ID','Name','Age','Gender','Blood group','Phone','Status','Actions'].map(h=>(
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.map(p=>(
                  <tr key={p.id} style={{transition:'background 0.1s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--gray-50)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={tdStyle}><span style={{fontFamily:'monospace',fontSize:11,color:'var(--blue-600)',fontWeight:600}}>{p.patient_id}</span></td>
                    <td style={tdStyle}>
                      <div style={{display:'flex',alignItems:'center',gap:9}}>
                        <div style={{width:30,height:30,borderRadius:8,background:'var(--blue-50)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'var(--blue-700)',flexShrink:0}}>{p.full_name?.[0]||'?'}</div>
                        <span style={{fontWeight:600,color:'var(--gray-900)'}}>{p.full_name}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>{p.age} yrs</td>
                    <td style={tdStyle} className="capitalize">{p.gender}</td>
                    <td style={tdStyle}>{p.blood_group||'—'}</td>
                    <td style={tdStyle}>{p.phone}</td>
                    <td style={tdStyle}><StatusBadge s={p.status}/></td>
                    <td style={tdStyle}>
                      <div style={{display:'flex',gap:6}}>
                        <button onClick={()=>openEdit(p)} style={{fontSize:11,fontWeight:600,color:'var(--blue-600)',background:'var(--blue-50)',border:'none',borderRadius:6,padding:'4px 10px',cursor:'pointer',transition:'all 0.15s'}}
                          onMouseEnter={e=>e.currentTarget.style.background='var(--blue-100)'}
                          onMouseLeave={e=>e.currentTarget.style.background='var(--blue-50)'}>Edit</button>
                        <button onClick={()=>handleDelete(p.id)} style={{fontSize:11,fontWeight:600,color:'var(--red-800)',background:'var(--red-50)',border:'none',borderRadius:6,padding:'4px 10px',cursor:'pointer',transition:'all 0.15s'}}
                          onMouseEnter={e=>e.currentTarget.style.background='#FECACA'}
                          onMouseLeave={e=>e.currentTarget.style.background='var(--red-50)'}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={()=>setShowModal(false)} title={editing?'Edit patient':'Add new patient'} width={640}>
        {error && <div style={{background:'var(--red-50)',border:'1px solid #FECACA',borderRadius:9,padding:'10px 14px',marginBottom:16,fontSize:13,color:'var(--red-800)'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
            <FormField label="First name" required><input value={form.first_name} onChange={e=>f('first_name',e.target.value)} style={inputSx} required onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></FormField>
            <FormField label="Last name" required><input value={form.last_name} onChange={e=>f('last_name',e.target.value)} style={inputSx} required onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></FormField>
            <FormField label="Date of birth" required><input type="date" value={form.date_of_birth} onChange={e=>f('date_of_birth',e.target.value)} style={inputSx} required onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></FormField>
            <FormField label="Phone" required><input value={form.phone} onChange={e=>f('phone',e.target.value)} style={inputSx} required onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></FormField>
            <FormField label="Gender">
              <select value={form.gender} onChange={e=>f('gender',e.target.value)} style={inputSx}>
                <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
              </select>
            </FormField>
            <FormField label="Blood group">
              <select value={form.blood_group} onChange={e=>f('blood_group',e.target.value)} style={inputSx}>
                <option value="">Select</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg=><option key={bg} value={bg}>{bg}</option>)}
              </select>
            </FormField>
            <FormField label="Email"><input type="email" value={form.email} onChange={e=>f('email',e.target.value)} style={inputSx} onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></FormField>
            <FormField label="City"><input value={form.city} onChange={e=>f('city',e.target.value)} style={inputSx} onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></FormField>
            <FormField label="Status">
              <select value={form.status} onChange={e=>f('status',e.target.value)} style={inputSx}>
                <option value="active">Active</option><option value="discharged">Discharged</option><option value="critical">Critical</option><option value="deceased">Deceased</option>
              </select>
            </FormField>
          </div>
          <div style={{display:'grid',gap:12,marginBottom:16}}>
            <FormField label="Known allergies"><textarea value={form.known_allergies} onChange={e=>f('known_allergies',e.target.value)} rows={2} style={{...inputSx,resize:'vertical'}} onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></FormField>
            <FormField label="Chronic conditions"><textarea value={form.chronic_conditions} onChange={e=>f('chronic_conditions',e.target.value)} rows={2} style={{...inputSx,resize:'vertical'}} onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></FormField>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:10,paddingTop:4,borderTop:'1px solid var(--border)'}}>
            <Button type="button" variant="outline" onClick={()=>setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>{editing?'Update patient':'Add patient'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}