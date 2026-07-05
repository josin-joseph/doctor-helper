import { useState, useEffect } from 'react';
import { patientAPI, emrAPI } from '../services/api';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import FormField, { inputSx } from '../components/common/FormField';

const VitalBox = ({ label, value, unit, color='var(--blue-600)', bg='var(--blue-50)' }) => (
  <div style={{background:bg,borderRadius:10,padding:'10px 12px',textAlign:'center',border:'1px solid var(--border)'}}>
    <div style={{fontSize:20,fontWeight:900,color,letterSpacing:'-0.02em',lineHeight:1}}>{value||'—'}</div>
    <div style={{fontSize:9,color:'var(--gray-400)',textTransform:'uppercase',letterSpacing:'0.07em',marginTop:3}}>{label}</div>
    <div style={{fontSize:9,color:'var(--gray-400)',marginTop:1}}>{unit}</div>
  </div>
);

const Tab = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{padding:'7px 14px',borderRadius:8,fontSize:12,fontWeight:active?700:500,border:'none',cursor:'pointer',transition:'all 0.15s',background:active?'#fff':' transparent',color:active?'var(--blue-700)':'var(--gray-400)',boxShadow:active?'0 1px 4px rgba(0,0,0,0.08)':'none'}}>
    {label}
  </button>
);

export default function EMRPage() {
  const [patients,setPatients]       = useState([]);
  const [selected,setSelected]       = useState(null);
  const [timeline,setTimeline]       = useState(null);
  const [activeTab,setActiveTab]     = useState('encounters');
  const [loading,setLoading]         = useState(false);
  const [showEnc,setShowEnc]         = useState(false);
  const [showVital,setShowVital]     = useState(false);
  const [saving,setSaving]           = useState(false);
  const [search,setSearch]           = useState('');

  const [encForm,setEncForm] = useState({chief_complaints:'',diagnosis:'',treatment_plan:'',clinical_notes:'',encounter_type:'outpatient',follow_up_date:'',follow_up_instructions:''});
  const [vitalForm,setVitalForm] = useState({blood_pressure_systolic:'',blood_pressure_diastolic:'',heart_rate:'',temperature:'',oxygen_saturation:'',weight:'',height:'',blood_glucose:'',notes:''});

  useEffect(()=>{ patientAPI.getAll().then(r=>setPatients(r.data.results||r.data)); },[]);

  const selectPatient = async p => {
    setSelected(p); setLoading(true);
    try { const r = await patientAPI.getTimeline(p.id); setTimeline(r.data); } catch{}
    setLoading(false);
  };

  const submitEncounter = async e => {
    e.preventDefault(); setSaving(true);
    try { await emrAPI.addEncounter(selected.id,encForm); setShowEnc(false); selectPatient(selected); setEncForm({chief_complaints:'',diagnosis:'',treatment_plan:'',clinical_notes:'',encounter_type:'outpatient',follow_up_date:'',follow_up_instructions:''}); } catch{}
    setSaving(false);
  };

  const submitVitals = async e => {
    e.preventDefault(); setSaving(true);
    try { await emrAPI.addVitals(selected.id,vitalForm); setShowVital(false); selectPatient(selected); setVitalForm({blood_pressure_systolic:'',blood_pressure_diastolic:'',heart_rate:'',temperature:'',oxygen_saturation:'',weight:'',height:'',blood_glucose:'',notes:''}); } catch{}
    setSaving(false);
  };

  const filtered = patients.filter(p=>p.full_name?.toLowerCase().includes(search.toLowerCase())||p.patient_id?.includes(search));

  return (
    <div style={{display:'flex',gap:16,height:'calc(100vh - 94px)'}}>

      {/* Patient list */}
      <div style={{width:240,flexShrink:0,display:'flex',flexDirection:'column',gap:10}}>
        <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:12,padding:'10px'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patients..."
            style={{...inputSx,background:'var(--gray-50)',fontSize:12}}
            onFocus={e=>{e.target.style.borderColor='var(--blue-600)';e.target.style.background='#fff';}}
            onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.background='var(--gray-50)';}}/>
        </div>
        <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:12,flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'12px 14px',borderBottom:'1px solid var(--border)',fontSize:11,fontWeight:700,color:'var(--gray-400)',letterSpacing:'0.07em',textTransform:'uppercase'}}>
            Select Patient
          </div>
          <div style={{flex:1,overflowY:'auto'}}>
            {filtered.length===0 ? (
              <div style={{padding:'20px',textAlign:'center',color:'var(--gray-400)',fontSize:12}}>No patients found</div>
            ) : filtered.map(p=>(
              <button key={p.id} onClick={()=>selectPatient(p)} style={{width:'100%',textAlign:'left',padding:'11px 14px',border:'none',borderBottom:'1px solid var(--gray-50)',cursor:'pointer',transition:'all 0.15s',background:selected?.id===p.id?'var(--blue-50)':'transparent',borderLeft:selected?.id===p.id?'3px solid var(--blue-600)':'3px solid transparent'}}>
                <div style={{fontSize:12,fontWeight:600,color:selected?.id===p.id?'var(--blue-700)':'var(--gray-900)'}}>{p.full_name}</div>
                <div style={{fontSize:10,color:'var(--gray-400)',marginTop:2}}>{p.patient_id} · {p.age}y · {p.gender}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* EMR content */}
      <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:12}}>
        {!selected ? (
          <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,color:'var(--gray-400)'}}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            <div style={{fontSize:15,fontWeight:700,color:'var(--gray-500)'}}>Select a patient</div>
            <div style={{fontSize:13}}>Choose a patient from the list to view their EMR</div>
          </div>
        ) : loading ? <Spinner label="Loading records..."/> : (
          <>
            {/* Patient banner */}
            <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:44,height:44,borderRadius:12,background:'var(--blue-50)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:900,color:'var(--blue-700)'}}>
                  {selected.full_name?.[0]}
                </div>
                <div>
                  <div style={{fontSize:16,fontWeight:800,color:'var(--gray-900)'}}>{selected.full_name}</div>
                  <div style={{fontSize:12,color:'var(--gray-400)',marginTop:1}}>
                    {selected.patient_id} · {selected.age} yrs · {selected.gender} · {selected.blood_group||'Blood group N/A'}
                  </div>
                </div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <Button size="sm" variant="success" onClick={()=>setShowVital(true)}
                  icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}>
                  Add vitals
                </Button>
                <Button size="sm" variant="primary" onClick={()=>setShowEnc(true)}
                  icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}>
                  New encounter
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{background:'var(--gray-100)',borderRadius:10,padding:4,display:'flex',gap:2,width:'fit-content'}}>
              {['encounters','vitals','allergies'].map(t=>(
                <Tab key={t} label={t.charAt(0).toUpperCase()+t.slice(1)} active={activeTab===t} onClick={()=>setActiveTab(t)}/>
              ))}
            </div>

            {/* Tab content */}
            <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:10}}>
              {activeTab==='encounters' && (
                timeline?.encounters?.length===0 ? (
                  <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'40px',textAlign:'center',color:'var(--gray-400)'}}>
                    <div style={{fontSize:28,marginBottom:8}}>📋</div>
                    <div style={{fontSize:14,fontWeight:600,color:'var(--gray-500)'}}>No encounters yet</div>
                    <div style={{fontSize:12,marginTop:4}}>Click "New encounter" to add the first one.</div>
                  </div>
                ) : timeline?.encounters?.map(enc=>(
                  <div key={enc.id} style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'16px 18px'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontSize:10,fontWeight:700,padding:'3px 9px',borderRadius:6,background:'var(--blue-50)',color:'var(--blue-700)',textTransform:'capitalize',letterSpacing:'0.03em'}}>{enc.encounter_type.replace('_',' ')}</span>
                        <span style={{fontSize:11,color:'var(--gray-400)'}}>{new Date(enc.encounter_date).toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
                      </div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                      {[{label:'Chief complaints',val:enc.chief_complaints},{label:'Diagnosis',val:enc.diagnosis}].map(({label,val})=>(
                        <div key={label}>
                          <div style={{fontSize:10,fontWeight:700,color:'var(--gray-400)',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:4}}>{label}</div>
                          <div style={{fontSize:13,color:'var(--gray-700)',lineHeight:1.5}}>{val}</div>
                        </div>
                      ))}
                      {enc.treatment_plan && (
                        <div style={{gridColumn:'1/-1'}}>
                          <div style={{fontSize:10,fontWeight:700,color:'var(--gray-400)',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:4}}>Treatment plan</div>
                          <div style={{fontSize:13,color:'var(--gray-700)',lineHeight:1.5}}>{enc.treatment_plan}</div>
                        </div>
                      )}
                      {enc.clinical_notes && (
                        <div style={{gridColumn:'1/-1'}}>
                          <div style={{fontSize:10,fontWeight:700,color:'var(--gray-400)',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:4}}>Clinical notes</div>
                          <div style={{fontSize:13,color:'var(--gray-700)',lineHeight:1.5,background:'var(--gray-50)',borderRadius:8,padding:'10px 12px'}}>{enc.clinical_notes}</div>
                        </div>
                      )}
                      {enc.follow_up_date && (
                        <div>
                          <div style={{fontSize:10,fontWeight:700,color:'var(--amber-600)',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:4}}>Follow-up</div>
                          <div style={{fontSize:13,color:'var(--amber-600)',fontWeight:600}}>{enc.follow_up_date}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {activeTab==='vitals' && (
                timeline?.vitals?.length===0 ? (
                  <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'40px',textAlign:'center',color:'var(--gray-400)'}}>
                    <div style={{fontSize:28,marginBottom:8}}>💓</div>
                    <div style={{fontSize:14,fontWeight:600,color:'var(--gray-500)'}}>No vitals recorded</div>
                    <div style={{fontSize:12,marginTop:4}}>Click "Add vitals" to record the first set.</div>
                  </div>
                ) : timeline?.vitals?.map(v=>(
                  <div key={v.id} style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'16px 18px'}}>
                    <div style={{fontSize:11,color:'var(--gray-400)',marginBottom:12}}>{new Date(v.recorded_at).toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                      <VitalBox label="Blood pressure" value={v.blood_pressure_systolic?`${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}`:null} unit="mmHg" color="var(--blue-600)" bg="var(--blue-50)"/>
                      <VitalBox label="Heart rate" value={v.heart_rate} unit="bpm" color="var(--red-600)" bg="var(--red-50)"/>
                      <VitalBox label="Temperature" value={v.temperature} unit="°F" color="var(--amber-600)" bg="var(--amber-50)"/>
                      <VitalBox label="SpO2" value={v.oxygen_saturation} unit="%" color={v.oxygen_saturation&&v.oxygen_saturation<94?'var(--red-600)':'var(--green-600)'} bg={v.oxygen_saturation&&v.oxygen_saturation<94?'var(--red-50)':'var(--green-50)'}/>
                      <VitalBox label="Weight" value={v.weight} unit="kg" color="var(--purple-600)" bg="var(--purple-50)"/>
                      <VitalBox label="Height" value={v.height} unit="cm" color="var(--purple-600)" bg="var(--purple-50)"/>
                      <VitalBox label="BMI" value={v.bmi} unit="" color="var(--gray-500)" bg="var(--gray-100)"/>
                      <VitalBox label="Blood glucose" value={v.blood_glucose} unit="mg/dL" color="var(--amber-600)" bg="var(--amber-50)"/>
                    </div>
                  </div>
                ))
              )}

              {activeTab==='allergies' && (
                <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'18px'}}>
                  {timeline?.patient?.known_allergies ? (
                    <>
                      <div style={{fontSize:11,fontWeight:700,color:'var(--gray-400)',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:10}}>Known allergies</div>
                      <div style={{background:'var(--red-50)',border:'1px solid #FECACA',borderRadius:10,padding:'14px 16px',fontSize:13,color:'var(--red-800)',lineHeight:1.6,display:'flex',gap:10}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0,marginTop:1}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        {timeline.patient.known_allergies}
                      </div>
                    </>
                  ) : (
                    <div style={{textAlign:'center',color:'var(--gray-400)',padding:'30px'}}>
                      <div style={{fontSize:24,marginBottom:8}}>✅</div>
                      <div style={{fontSize:14,fontWeight:600,color:'var(--green-600)'}}>No known allergies</div>
                    </div>
                  )}
                  {timeline?.patient?.chronic_conditions && (
                    <div style={{marginTop:16}}>
                      <div style={{fontSize:11,fontWeight:700,color:'var(--gray-400)',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:10}}>Chronic conditions</div>
                      <div style={{background:'var(--amber-50)',border:'1px solid #FDE68A',borderRadius:10,padding:'14px 16px',fontSize:13,color:'var(--amber-800)',lineHeight:1.6}}>
                        {timeline.patient.chronic_conditions}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Encounter Modal */}
      <Modal open={showEnc} onClose={()=>setShowEnc(false)} title="New encounter" width={560}>
        <form onSubmit={submitEncounter} style={{display:'flex',flexDirection:'column',gap:14}}>
          <FormField label="Encounter type">
            <select value={encForm.encounter_type} onChange={e=>setEncForm({...encForm,encounter_type:e.target.value})} style={inputSx}>
              {['outpatient','inpatient','emergency','follow_up','teleconsult'].map(t=><option key={t} value={t}>{t.replace('_',' ')}</option>)}
            </select>
          </FormField>
          {[{label:'Chief complaints',key:'chief_complaints',req:true},{label:'Diagnosis',key:'diagnosis',req:true},{label:'Treatment plan',key:'treatment_plan'},{label:'Clinical notes',key:'clinical_notes'},{label:'Follow-up instructions',key:'follow_up_instructions'}].map(({label,key,req})=>(
            <FormField key={key} label={label} required={req}>
              <textarea value={encForm[key]} onChange={e=>setEncForm({...encForm,[key]:e.target.value})} rows={2} required={req}
                style={{...inputSx,resize:'vertical'}} onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
            </FormField>
          ))}
          <FormField label="Follow-up date">
            <input type="date" value={encForm.follow_up_date} onChange={e=>setEncForm({...encForm,follow_up_date:e.target.value})} style={inputSx}
              onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
          </FormField>
          <div style={{display:'flex',justifyContent:'flex-end',gap:10,paddingTop:8,borderTop:'1px solid var(--border)'}}>
            <Button type="button" variant="outline" onClick={()=>setShowEnc(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>Save encounter</Button>
          </div>
        </form>
      </Modal>

      {/* Vitals Modal */}
      <Modal open={showVital} onClose={()=>setShowVital(false)} title="Record vitals" width={520}>
        <form onSubmit={submitVitals} style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {[{label:'BP Systolic (mmHg)',key:'blood_pressure_systolic'},{label:'BP Diastolic (mmHg)',key:'blood_pressure_diastolic'},{label:'Heart rate (bpm)',key:'heart_rate'},{label:'Temperature (°F)',key:'temperature'},{label:'SpO2 (%)',key:'oxygen_saturation'},{label:'Weight (kg)',key:'weight'},{label:'Height (cm)',key:'height'},{label:'Blood glucose (mg/dL)',key:'blood_glucose'}].map(({label,key})=>(
              <FormField key={key} label={label}>
                <input type="number" step="any" value={vitalForm[key]} onChange={e=>setVitalForm({...vitalForm,[key]:e.target.value})}
                  style={inputSx} onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
              </FormField>
            ))}
          </div>
          <FormField label="Notes">
            <textarea value={vitalForm.notes} onChange={e=>setVitalForm({...vitalForm,notes:e.target.value})} rows={2}
              style={{...inputSx,resize:'vertical'}} onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
          </FormField>
          <div style={{display:'flex',justifyContent:'flex-end',gap:10,paddingTop:8,borderTop:'1px solid var(--border)'}}>
            <Button type="button" variant="outline" onClick={()=>setShowVital(false)}>Cancel</Button>
            <Button type="submit" variant="success" loading={saving}>Save vitals</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}