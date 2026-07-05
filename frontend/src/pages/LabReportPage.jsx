import { useState, useEffect } from 'react';
import { labAPI, patientAPI } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import FormField, { inputSx } from '../components/common/FormField';

const PARAMS = [
  {name:'hemoglobin',unit:'g/dL',min:12,max:17.5},
  {name:'wbc',unit:'10³/µL',min:4,max:11},
  {name:'platelets',unit:'10³/µL',min:150,max:400},
  {name:'rbc',unit:'10⁶/µL',min:4.2,max:5.9},
  {name:'fasting_glucose',unit:'mg/dL',min:70,max:100},
  {name:'hba1c',unit:'%',min:4,max:5.7},
  {name:'creatinine',unit:'mg/dL',min:0.6,max:1.2},
  {name:'urea',unit:'mg/dL',min:7,max:20},
  {name:'sgpt',unit:'U/L',min:7,max:56},
  {name:'sgot',unit:'U/L',min:10,max:40},
  {name:'total_bilirubin',unit:'mg/dL',min:0.2,max:1.2},
  {name:'total_cholesterol',unit:'mg/dL',min:0,max:200},
  {name:'ldl',unit:'mg/dL',min:0,max:100},
  {name:'hdl',unit:'mg/dL',min:40,max:60},
  {name:'tsh',unit:'mIU/L',min:0.4,max:4},
  {name:'sodium',unit:'mEq/L',min:136,max:145},
];

const statusStyle = s => ({
  normal:        {bg:'var(--green-50)',  color:'var(--green-800)',  label:'Normal'},
  low:           {bg:'var(--amber-50)',  color:'var(--amber-800)',  label:'Low ↓'},
  high:          {bg:'var(--red-50)',    color:'var(--red-800)',    label:'High ↑'},
  critical_low:  {bg:'#FEF2F2',         color:'#7F1D1D',           label:'Critical Low ⚠'},
  critical_high: {bg:'#FEF2F2',         color:'#7F1D1D',           label:'Critical High ⚠'},
}[s]||{bg:'var(--gray-100)',color:'var(--gray-500)',label:s});

export default function LabReportPage() {
  const [reports,setReports]   = useState([]);
  const [patients,setPatients] = useState([]);
  const [loading,setLoading]   = useState(true);
  const [showModal,setShowModal] = useState(false);
  const [expanded,setExpanded]   = useState(null);
  const [saving,setSaving]       = useState(false);
  const [form,setForm] = useState({patient_id:'',report_type:'cbc',report_date:new Date().toISOString().split('T')[0],notes:''});
  const [params,setParams] = useState(PARAMS.map(p=>({...p,value:''})));

  useEffect(()=>{ fetchReports(); patientAPI.getAll().then(r=>setPatients(r.data.results||r.data)); },[]);

  const fetchReports = async () => {
    setLoading(true);
    try { const r = await labAPI.getAll(); setReports(r.data); } catch{}
    setLoading(false);
  };

  const updateParam = (i,v) => setParams(p=>p.map((x,idx)=>idx===i?{...x,value:v}:x));

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const valid = params.filter(p=>p.value!=='');
      await labAPI.create({...form,parameters:valid.map(p=>({parameter_name:p.name,value:parseFloat(p.value),unit:p.unit,normal_min:p.min,normal_max:p.max}))});
      setShowModal(false); fetchReports();
    } catch(err){ alert(JSON.stringify(err.response?.data)); }
    setSaving(false);
  };

  return (
    <div>
      <PageHeader title="Lab Report Analyzer" subtitle="AI-powered analysis with clinical significance detection"
        action={<Button variant="primary" onClick={()=>setShowModal(true)} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}>New report</Button>}/>

      {loading ? <Spinner label="Loading reports..."/> : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {reports.length===0 ? (
            <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'60px',textAlign:'center',color:'var(--gray-400)'}}>
              <div style={{fontSize:36,marginBottom:12}}>🧪</div>
              <div style={{fontSize:16,fontWeight:700,color:'var(--gray-500)',marginBottom:6}}>No lab reports yet</div>
              <div style={{fontSize:13,marginBottom:16}}>Add a lab report to start AI-powered analysis.</div>
              <Button variant="primary" onClick={()=>setShowModal(true)}>Add first report</Button>
            </div>
          ) : reports.map(r=>{
            const isOpen = expanded===r.id;
            const abnormals = r.parameters?.filter(p=>p.status!=='normal')||[];
            const hasCritical = r.parameters?.some(p=>p.status==='critical_high'||p.status==='critical_low');
            return (
              <div key={r.id} style={{background:'#fff',border:`1px solid ${hasCritical?'#FECACA':'var(--border)'}`,borderRadius:14,overflow:'hidden',transition:'box-shadow 0.2s'}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.06)'}
                onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
                <div style={{padding:'14px 18px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between'}} onClick={()=>setExpanded(isOpen?null:r.id)}>
                  <div style={{display:'flex',alignItems:'center',gap:14}}>
                    <div style={{width:40,height:40,borderRadius:10,background:hasCritical?'var(--red-50)':'var(--blue-50)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>
                      {hasCritical?'⚠':'🧪'}
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:'var(--gray-900)'}}>{r.patient_name}</div>
                      <div style={{fontSize:12,color:'var(--gray-400)',marginTop:1}}>{r.report_type.toUpperCase()} · {r.report_date}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    {hasCritical && <span style={{fontSize:10,fontWeight:700,padding:'3px 9px',borderRadius:20,background:'var(--red-50)',color:'var(--red-800)'}}>Critical</span>}
                    {r.abnormal_count>0 && <span style={{fontSize:10,fontWeight:700,padding:'3px 9px',borderRadius:20,background:'var(--amber-50)',color:'var(--amber-800)'}}>{r.abnormal_count} abnormal</span>}
                    <span style={{fontSize:10,fontWeight:700,padding:'3px 9px',borderRadius:20,background:'var(--green-50)',color:'var(--green-800)'}}>{r.status}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2" style={{transform:isOpen?'rotate(180deg)':'rotate(0deg)',transition:'transform 0.2s'}}><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>

                {isOpen && (
                  <div style={{padding:'0 18px 18px',borderTop:'1px solid var(--gray-50)'}}>
                    {/* Parameters grid */}
                    {r.parameters?.length>0 && (
                      <div style={{marginTop:14}}>
                        <div style={{fontSize:11,fontWeight:700,color:'var(--gray-400)',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:10}}>Parameters</div>
                        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                          {r.parameters.map(p=>{
                            const s = statusStyle(p.status);
                            return (
                              <div key={p.id} style={{background:s.bg,borderRadius:10,padding:'10px 12px',border:'1px solid var(--border)'}}>
                                <div style={{fontSize:10,fontWeight:700,color:s.color,textTransform:'capitalize',marginBottom:4}}>{p.parameter_name.replace(/_/g,' ')}</div>
                                <div style={{fontSize:18,fontWeight:900,color:s.color,letterSpacing:'-0.02em'}}>{p.value}</div>
                                <div style={{fontSize:9,color:s.color,opacity:.8,marginTop:2}}>{p.unit}</div>
                                <div style={{fontSize:9,color:'var(--gray-400)',marginTop:4}}>Ref: {p.normal_min}–{p.normal_max}</div>
                                <div style={{fontSize:9,fontWeight:700,marginTop:3,color:s.color}}>{s.label}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {/* AI interpretation */}
                    {r.ai_interpretation && (
                      <div style={{marginTop:14}}>
                        <div style={{fontSize:11,fontWeight:700,color:'var(--gray-400)',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:8}}>AI interpretation</div>
                        <div style={{background:'var(--blue-50)',border:'1px solid var(--blue-200)',borderRadius:10,padding:'14px 16px'}}>
                          <pre style={{fontSize:12,color:'var(--blue-800)',whiteSpace:'pre-wrap',fontFamily:'inherit',lineHeight:1.7}}>{r.ai_interpretation}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={()=>setShowModal(false)} title="New lab report" width={700}>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
            <FormField label="Patient" required>
              <select value={form.patient_id} onChange={e=>setForm({...form,patient_id:e.target.value})} style={inputSx} required>
                <option value="">Select patient</option>
                {patients.map(p=><option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </FormField>
            <FormField label="Report type">
              <select value={form.report_type} onChange={e=>setForm({...form,report_type:e.target.value})} style={inputSx}>
                {['cbc','lft','kft','lipid','thyroid','glucose','urine','electrolytes','cardiac','other'].map(t=><option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </FormField>
            <FormField label="Report date" required>
              <input type="date" value={form.report_date} onChange={e=>setForm({...form,report_date:e.target.value})} style={inputSx} required
                onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
            </FormField>
          </div>

          <div>
            <div style={{fontSize:11,fontWeight:700,color:'var(--gray-400)',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:10}}>Enter values (leave blank if not tested)</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
              {params.map((p,i)=>(
                <div key={p.name}>
                  <div style={{fontSize:10,fontWeight:600,color:'var(--gray-500)',marginBottom:4,textTransform:'capitalize'}}>{p.name.replace(/_/g,' ')} <span style={{color:'var(--gray-300)'}}>({p.unit})</span></div>
                  <input type="number" step="any" value={p.value} placeholder="—"
                    onChange={e=>updateParam(i,e.target.value)}
                    style={{...inputSx,fontSize:13}} onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:'flex',justifyContent:'flex-end',gap:10,paddingTop:8,borderTop:'1px solid var(--border)'}}>
            <Button type="button" variant="outline" onClick={()=>setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>Analyze report</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}