import { useState, useEffect } from 'react';
import { dischargeAPI, patientAPI } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import FormField, { inputSx } from '../components/common/FormField';

const conditionStyle = c => ({
  stable:      {bg:'var(--green-50)',color:'var(--green-800)'},
  improved:    {bg:'var(--blue-50)', color:'var(--blue-800)'},
  critical:    {bg:'var(--red-50)',  color:'var(--red-800)'},
  deceased:    {bg:'var(--gray-100)',color:'var(--gray-500)'},
  transferred: {bg:'var(--amber-50)',color:'var(--amber-800)'},
}[c]||{bg:'var(--gray-100)',color:'var(--gray-500)'});

export default function DischargePage() {
  const [summaries,setSummaries] = useState([]);
  const [patients,setPatients]   = useState([]);
  const [loading,setLoading]     = useState(true);
  const [showModal,setShowModal] = useState(false);
  const [saving,setSaving]       = useState(false);
  const [downloading,setDownloading] = useState(null);
  const [expanded,setExpanded]   = useState(null);

  const EMPTY = {patient:'',admission_date:'',discharge_date:'',ward:'',bed_number:'',chief_complaints:'',diagnosis:'',hospital_course:'',treatment_given:'',procedures_performed:'',investigations:'',discharge_medications:'',condition_at_discharge:'stable',follow_up_instructions:'',diet_instructions:'',activity_restrictions:'',medical_history:''};
  const [form,setForm] = useState(EMPTY);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  useEffect(()=>{ fetchSummaries(); patientAPI.getAll().then(r=>setPatients(r.data.results||r.data)); },[]);

  const fetchSummaries = async () => {
    setLoading(true);
    try { const r = await dischargeAPI.getAll(); setSummaries(r.data); } catch{}
    setLoading(false);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try { await dischargeAPI.create(form); setShowModal(false); setForm(EMPTY); fetchSummaries(); }
    catch(err){ alert(JSON.stringify(err.response?.data)); }
    setSaving(false);
  };

  const handlePDF = async id => {
    setDownloading(id);
    try {
      const r = await dischargeAPI.generatePDF(id);
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a'); a.href=url; a.download=`discharge_${id}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch{}
    setDownloading(null);
  };

  return (
    <div>
      <PageHeader title="Discharge Summaries" subtitle="AI-generated professional discharge documents with PDF export"
        action={<Button variant="primary" onClick={()=>setShowModal(true)} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}>New summary</Button>}/>

      {loading ? <Spinner label="Loading summaries..."/> : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {summaries.length===0 ? (
            <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'60px',textAlign:'center',color:'var(--gray-400)'}}>
              <div style={{fontSize:36,marginBottom:12}}>📄</div>
              <div style={{fontSize:16,fontWeight:700,color:'var(--gray-500)',marginBottom:6}}>No discharge summaries</div>
              <div style={{fontSize:13,marginBottom:16}}>Generate your first AI-powered discharge summary.</div>
              <Button variant="primary" onClick={()=>setShowModal(true)}>Create summary</Button>
            </div>
          ) : summaries.map(s=>{
            const isOpen = expanded===s.id;
            const cs = conditionStyle(s.condition_at_discharge);
            return (
              <div key={s.id} style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,overflow:'hidden',transition:'box-shadow 0.2s'}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.06)'}
                onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
                <div style={{padding:'16px 18px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',alignItems:'center',gap:14,cursor:'pointer',flex:1}} onClick={()=>setExpanded(isOpen?null:s.id)}>
                    <div style={{width:42,height:42,borderRadius:11,background:'var(--blue-50)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>📄</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:'var(--gray-900)'}}>{s.patient_name}</div>
                      <div style={{fontSize:12,color:'var(--gray-400)',marginTop:1}}>
                        {s.admission_date} → {s.discharge_date} · {s.stay_duration} days stay
                      </div>
                      <div style={{fontSize:12,color:'var(--gray-600)',marginTop:3,maxWidth:400,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                        {s.diagnosis}
                      </div>
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                    <span style={{fontSize:10,fontWeight:700,padding:'3px 9px',borderRadius:20,textTransform:'capitalize',...cs}}>{s.condition_at_discharge}</span>
                    <Button size="sm" variant="outline" loading={downloading===s.id} onClick={()=>handlePDF(s.id)}
                      icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}>
                      PDF
                    </Button>
                  </div>
                </div>
                {isOpen && (
                  <div style={{padding:'0 18px 18px',borderTop:'1px solid var(--gray-50)'}}>
                    {s.ai_narrative && (
                      <div style={{marginTop:14,background:'var(--blue-50)',border:'1px solid var(--blue-200)',borderRadius:10,padding:'14px 16px'}}>
                        <div style={{fontSize:10,fontWeight:700,color:'var(--blue-600)',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:8}}>AI-generated hospital course</div>
                        <p style={{fontSize:13,color:'var(--blue-800)',lineHeight:1.7}}>{s.ai_narrative}</p>
                      </div>
                    )}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginTop:14}}>
                      {[{label:'Chief complaints',val:s.chief_complaints},{label:'Discharge medications',val:s.discharge_medications},{label:'Follow-up instructions',val:s.follow_up_instructions},{label:'Diet instructions',val:s.diet_instructions}].filter(x=>x.val).map(({label,val})=>(
                        <div key={label}>
                          <div style={{fontSize:10,fontWeight:700,color:'var(--gray-400)',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:6}}>{label}</div>
                          <div style={{fontSize:13,color:'var(--gray-700)',lineHeight:1.5}}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={()=>setShowModal(false)} title="New discharge summary" width={720}>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div style={{gridColumn:'1/-1'}}>
              <FormField label="Patient" required>
                <select value={form.patient} onChange={e=>f('patient',e.target.value)} style={inputSx} required>
                  <option value="">Select patient</option>
                  {patients.map(p=><option key={p.id} value={p.id}>{p.full_name} ({p.patient_id})</option>)}
                </select>
              </FormField>
            </div>
            {[{label:'Admission date',key:'admission_date',type:'date'},{label:'Discharge date',key:'discharge_date',type:'date'},{label:'Ward',key:'ward',type:'text'},{label:'Bed number',key:'bed_number',type:'text'}].map(({label,key,type})=>(
              <FormField key={key} label={label}>
                <input type={type} value={form[key]} onChange={e=>f(key,e.target.value)} style={inputSx}
                  onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
              </FormField>
            ))}
            <FormField label="Condition at discharge">
              <select value={form.condition_at_discharge} onChange={e=>f('condition_at_discharge',e.target.value)} style={inputSx}>
                {['stable','improved','critical','deceased','transferred'].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
          </div>
          {[{label:'Chief complaints',key:'chief_complaints',req:true},{label:'Diagnosis',key:'diagnosis',req:true},{label:'Hospital course',key:'hospital_course',req:true},{label:'Treatment given',key:'treatment_given'},{label:'Procedures performed',key:'procedures_performed'},{label:'Investigations',key:'investigations'},{label:'Discharge medications',key:'discharge_medications'},{label:'Follow-up instructions',key:'follow_up_instructions'},{label:'Diet instructions',key:'diet_instructions'}].map(({label,key,req})=>(
            <FormField key={key} label={label} required={req}>
              <textarea rows={2} value={form[key]} onChange={e=>f(key,e.target.value)} required={req}
                style={{...inputSx,resize:'vertical'}} onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
            </FormField>
          ))}
          <div style={{display:'flex',justifyContent:'flex-end',gap:10,paddingTop:8,borderTop:'1px solid var(--border)'}}>
            <Button type="button" variant="outline" onClick={()=>setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>Generate summary</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}