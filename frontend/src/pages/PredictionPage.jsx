import { useState, useEffect } from 'react';
import { patientAPI, predictionAPI } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import Spinner from '../components/common/Spinner';
import FormField, { inputSx } from '../components/common/FormField';
import Button from '../components/common/Button';

const SYMPTOMS = ['fever','cough','fatigue','headache','chest_pain','shortness_of_breath','nausea','vomiting','diarrhea','sore_throat','body_ache','loss_of_appetite','sweating','chills'];

const SymptomChip = ({ label, active, onClick }) => (
  <button type="button" onClick={onClick} style={{padding:'7px 14px',borderRadius:8,fontSize:12,fontWeight:600,border:`1.5px solid ${active?'var(--blue-500)':'var(--border)'}`,cursor:'pointer',transition:'all 0.15s',background:active?'var(--blue-600)':'#fff',color:active?'#fff':'var(--gray-500)',textTransform:'capitalize'}}>
    {label.replace(/_/g,' ')}
  </button>
);

export default function PredictionPage() {
  const [patients,setPatients]   = useState([]);
  const [pid,setPid]             = useState('');
  const [symptoms,setSymptoms]   = useState({});
  const [vitals,setVitals]       = useState({age:40,blood_pressure:120,heart_rate:72,temperature:98.6,oxygen_saturation:98,blood_glucose:100});
  const [result,setResult]       = useState(null);
  const [loading,setLoading]     = useState(false);
  const [history,setHistory]     = useState([]);

  useEffect(()=>{ patientAPI.getAll().then(r=>setPatients(r.data.results||r.data)); },[]);

  const toggleSymptom = s => setSymptoms(p=>({...p,[s]:!p[s]}));
  const activeCount   = Object.values(symptoms).filter(Boolean).length;

  const handlePatient = async e => {
    const id = e.target.value; setPid(id); setResult(null);
    if(id){
      const p = patients.find(p=>p.id===parseInt(id));
      if(p) setVitals(v=>({...v,age:p.age||40}));
      const r = await predictionAPI.getHistory(id);
      setHistory(r.data.results||r.data);
    }
  };

  const handlePredict = async () => {
    if(!pid) return alert('Please select a patient first.');
    setLoading(true);
    try {
      const r = await predictionAPI.predict(pid,{...vitals,...symptoms});
      setResult(r.data);
      const h = await predictionAPI.getHistory(pid);
      setHistory(h.data.results||h.data);
    } catch(err){ alert('Prediction failed: '+(err.response?.data?.error||'Unknown error')); }
    setLoading(false);
  };

  const conf = result?.prediction?.confidence_score||0;
  const confPct = Math.round(conf*100);
  const confColor = confPct>=80?'var(--green-600)':confPct>=60?'var(--amber-600)':'var(--red-600)';
  const confBg    = confPct>=80?'var(--green-50)':confPct>=60?'var(--amber-50)':'var(--red-50)';

  return (
    <div>
      <PageHeader title="AI Disease Prediction" subtitle="XGBoost model trained on 246,926 records · 754 diseases · 83.7% accuracy"/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:16}}>

        {/* Left — inputs */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {/* Patient */}
          <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'18px 20px'}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--gray-900)',marginBottom:12}}>Select patient</div>
            <select value={pid} onChange={handlePatient} style={inputSx}>
              <option value="">— Select a patient —</option>
              {patients.map(p=><option key={p.id} value={p.id}>{p.full_name} ({p.patient_id})</option>)}
            </select>
          </div>

          {/* Symptoms */}
          <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'18px 20px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--gray-900)'}}>Symptoms</div>
              {activeCount>0 && <span style={{fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:20,background:'var(--blue-50)',color:'var(--blue-700)'}}>{activeCount} selected</span>}
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {SYMPTOMS.map(s=><SymptomChip key={s} label={s} active={!!symptoms[s]} onClick={()=>toggleSymptom(s)}/>)}
            </div>
          </div>

          {/* Clinical parameters */}
          <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'18px 20px'}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--gray-900)',marginBottom:14}}>Clinical parameters</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
              {[{label:'Age (years)',key:'age'},{label:'Blood pressure (mmHg)',key:'blood_pressure'},{label:'Heart rate (bpm)',key:'heart_rate'},{label:'Temperature (°F)',key:'temperature'},{label:'SpO2 (%)',key:'oxygen_saturation'},{label:'Blood glucose (mg/dL)',key:'blood_glucose'}].map(({label,key})=>(
                <FormField key={key} label={label}>
                  <input type="number" step="any" value={vitals[key]}
                    onChange={e=>setVitals({...vitals,[key]:parseFloat(e.target.value)||0})}
                    style={inputSx} onFocus={e=>e.target.style.borderColor='var(--blue-600)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                </FormField>
              ))}
            </div>
          </div>

          <button onClick={handlePredict} disabled={loading||!pid} style={{
            background:loading||!pid?'var(--gray-300)':'var(--blue-600)',color:'#fff',border:'none',borderRadius:12,
            padding:'14px',fontSize:15,fontWeight:800,cursor:loading||!pid?'not-allowed':'pointer',
            transition:'all 0.15s',display:'flex',alignItems:'center',justifyContent:'center',gap:10,
            letterSpacing:'-0.01em',
          }}>
            {loading ? <><span style={{width:18,height:18,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block'}}/> Analyzing symptoms...</> : '🤖 Predict disease'}
          </button>
        </div>

        {/* Right — results */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {result ? (
            <>
              {/* Main result */}
              <div style={{background:'#fff',border:`2px solid ${confColor}`,borderRadius:14,padding:'20px',textAlign:'center'}}>
                <div style={{fontSize:11,fontWeight:700,color:'var(--gray-400)',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:12}}>Primary diagnosis</div>
                <div style={{fontSize:24,fontWeight:900,color:'var(--gray-900)',letterSpacing:'-0.02em',lineHeight:1.2,marginBottom:16}}>
                  {result.prediction?.predicted_disease}
                </div>
                <div style={{marginBottom:8}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                    <span style={{fontSize:11,color:'var(--gray-400)',fontWeight:600}}>Confidence</span>
                    <span style={{fontSize:13,fontWeight:800,color:confColor}}>{confPct}%</span>
                  </div>
                  <div style={{background:'var(--gray-100)',borderRadius:6,height:8,overflow:'hidden'}}>
                    <div style={{width:`${confPct}%`,height:'100%',background:confColor,borderRadius:6,transition:'width 1s ease'}}/>
                  </div>
                </div>
                <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:20,background:confBg,marginTop:8}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:confColor}}/>
                  <span style={{fontSize:11,fontWeight:700,color:confColor}}>{confPct>=80?'High confidence':confPct>=60?'Moderate confidence':'Low confidence'}</span>
                </div>
              </div>

              {/* Top contributing factors */}
              {result.top_features?.length>0 && (
                <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'16px 18px'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'var(--gray-700)',marginBottom:12}}>Key contributing factors</div>
                  <div style={{display:'flex',flexDirection:'column',gap:9}}>
                    {result.top_features.slice(0,6).map((f,i)=>{
                      const impact = Math.abs(f.impact||f[1]||0);
                      const positive = (f.impact||f[1]||0)>0;
                      return (
                        <div key={i}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                            <span style={{fontSize:11,color:'var(--gray-700)',fontWeight:500,textTransform:'capitalize'}}>{(f.symptom||f[0]||'').replace(/_/g,' ')}</span>
                            <span style={{fontSize:10,fontWeight:700,color:positive?'var(--red-600)':'var(--blue-600)'}}>{positive?'+':''}{(f.impact||f[1]||0).toFixed(3)}</span>
                          </div>
                          <div style={{background:'var(--gray-100)',borderRadius:4,height:4,overflow:'hidden'}}>
                            <div style={{width:`${Math.min(100,impact*200)}%`,height:'100%',background:positive?'var(--red-500)':'var(--blue-500)',borderRadius:4}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top 5 possibilities */}
              {result.all_probabilities && (
                <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'16px 18px'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'var(--gray-700)',marginBottom:12}}>Top 5 differential diagnoses</div>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {Object.entries(result.all_probabilities).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([disease,prob],i)=>(
                      <div key={i} style={{display:'flex',alignItems:'center',gap:10}}>
                        <span style={{fontSize:11,fontWeight:800,color:'var(--gray-300)',width:18,textAlign:'right',flexShrink:0}}>#{i+1}</span>
                        <span style={{fontSize:12,color:'var(--gray-700)',flex:1,fontWeight:i===0?700:400}}>{disease}</span>
                        <span style={{fontSize:11,fontWeight:700,color:'var(--blue-600)',fontFamily:'monospace',flexShrink:0}}>{Math.round(prob*1000)/10}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'48px 24px',textAlign:'center',color:'var(--gray-400)',flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10}}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <div style={{fontSize:15,fontWeight:700,color:'var(--gray-500)'}}>No prediction yet</div>
              <div style={{fontSize:12,maxWidth:200,lineHeight:1.5}}>Select a patient, choose symptoms, and click predict.</div>
            </div>
          )}

          {/* History */}
          {history.length>0 && (
            <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,overflow:'hidden'}}>
              <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',fontSize:12,fontWeight:700,color:'var(--gray-700)'}}>Prediction history</div>
              <div style={{maxHeight:200,overflowY:'auto'}}>
                {history.slice(0,8).map(h=>(
                  <div key={h.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:'1px solid var(--gray-50)'}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:'var(--gray-800)'}}>{h.predicted_disease}</div>
                      <div style={{fontSize:10,color:'var(--gray-400)',marginTop:1}}>{new Date(h.created_at).toLocaleDateString('en-IN')}</div>
                    </div>
                    <span style={{fontSize:12,fontWeight:800,color:'var(--blue-600)',fontFamily:'monospace'}}>{Math.round(h.confidence_score*100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}