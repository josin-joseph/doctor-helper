import { useState, useEffect, useRef } from 'react';
import { ragAPI, patientAPI } from '../services/api';
import { inputSx } from '../components/common/FormField';

const SUGGESTIONS = [
  'What are the symptoms of dengue fever?',
  'How to manage Type 2 diabetes?',
  'Treatment for community acquired pneumonia?',
  'Signs of acute myocardial infarction?',
  'Interpretation of elevated creatinine?',
  'When to start anticoagulation in AFib?',
];

export default function AssistantPage() {
  const [messages,setMessages]   = useState([{role:'assistant',content:'Hello, Doctor. I am your AI Medical Assistant powered by Llama 3 and a knowledge base of 773 diseases. Ask me any clinical question and I will provide evidence-based guidance.'}]);
  const [input,setInput]         = useState('');
  const [loading,setLoading]     = useState(false);
  const [patients,setPatients]   = useState([]);
  const [pid,setPid]             = useState('');
  const bottomRef                = useRef(null);

  useEffect(()=>{ patientAPI.getAll().then(r=>setPatients(r.data.results||r.data)); },[]);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); },[messages]);

  const send = async () => {
    if(!input.trim()||loading) return;
    const q = input.trim(); setInput('');
    setMessages(p=>[...p,{role:'user',content:q}]);
    setLoading(true);
    try {
      const r = await ragAPI.ask({question:q,patient_id:pid||undefined});
      setMessages(p=>[...p,{role:'assistant',content:r.data.answer,sources:r.data.sources}]);
    } catch {
      setMessages(p=>[...p,{role:'assistant',content:'Sorry, I could not process your request. Please make sure Ollama is running.'}]);
    }
    setLoading(false);
  };

  const handleKey = e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();} };

  return (
    <div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 94px)',gap:12}}>

      {/* Header bar */}
      <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:'var(--gray-900)'}}>AI Medical Assistant</div>
          <div style={{fontSize:11,color:'var(--gray-400)',marginTop:1}}>Llama 3 · FAISS RAG · 773 disease knowledge base</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <select value={pid} onChange={e=>setPid(e.target.value)} style={{...inputSx,width:220,fontSize:12}}>
            <option value="">No patient context</option>
            {patients.map(p=><option key={p.id} value={p.id}>{p.full_name} ({p.patient_id})</option>)}
          </select>
          <div style={{display:'flex',alignItems:'center',gap:6,padding:'4px 10px',background:'var(--green-50)',border:'1px solid #A7F3D0',borderRadius:20}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'var(--green-600)'}} className="pulse-dot"/>
            <span style={{fontSize:10,fontWeight:700,color:'var(--green-800)'}}>ONLINE</span>
          </div>
        </div>
      </div>

      {/* Chat window */}
      <div style={{flex:1,background:'#fff',border:'1px solid var(--border)',borderRadius:14,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:14}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
            {m.role==='assistant' && (
              <div style={{width:30,height:30,borderRadius:8,background:'var(--blue-50)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,color:'var(--blue-700)',flexShrink:0,marginRight:8,marginTop:2}}>AI</div>
            )}
            <div style={{maxWidth:'72%',display:'flex',flexDirection:'column',gap:6}}>
              <div style={{
                padding:'12px 16px', borderRadius:m.role==='user'?'14px 14px 4px 14px':'14px 14px 14px 4px',
                background:m.role==='user'?'var(--blue-600)':'var(--gray-50)',
                color:m.role==='user'?'#fff':'var(--gray-800)',
                fontSize:13, lineHeight:1.6,
                border:m.role==='assistant'?'1px solid var(--border)':'none',
              }}>
                {m.role==='assistant'&&<div style={{fontSize:10,fontWeight:700,color:'var(--blue-600)',letterSpacing:'0.06em',marginBottom:6}}>MEDICAL AI</div>}
                <div style={{whiteSpace:'pre-wrap'}}>{m.content}</div>
              </div>
              {m.sources?.length>0 && (
                <div style={{display:'flex',flexWrap:'wrap',gap:4,paddingLeft:4}}>
                  <span style={{fontSize:10,color:'var(--gray-400)',marginRight:4,fontWeight:600}}>Sources:</span>
                  {m.sources.map((s,j)=>(
                    <span key={j} style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:20,background:'var(--blue-50)',color:'var(--blue-700)'}}>
                      {s.title} · {Math.round(s.relevance*100)}%
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:30,height:30,borderRadius:8,background:'var(--blue-50)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,color:'var(--blue-700)',flexShrink:0}}>AI</div>
            <div style={{background:'var(--gray-50)',border:'1px solid var(--border)',borderRadius:'14px 14px 14px 4px',padding:'12px 16px',display:'flex',alignItems:'center',gap:6}}>
              {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:'50%',background:'var(--blue-400)',animation:'pulse-dot 1.4s ease-in-out infinite',animationDelay:`${i*0.2}s`}}/>)}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Suggestions */}
      {messages.length===1 && (
        <div style={{display:'flex',flexWrap:'wrap',gap:8,flexShrink:0}}>
          {SUGGESTIONS.map((s,i)=>(
            <button key={i} onClick={()=>setInput(s)} style={{fontSize:12,padding:'7px 14px',borderRadius:20,border:'1px solid var(--border)',background:'#fff',color:'var(--gray-600)',cursor:'pointer',transition:'all 0.15s',fontWeight:500}}
              onMouseEnter={e=>{e.currentTarget.style.background='var(--blue-50)';e.currentTarget.style.borderColor='var(--blue-200)';e.currentTarget.style.color='var(--blue-700)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--gray-600)';}}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{display:'flex',gap:10,flexShrink:0}}>
        <div style={{flex:1,position:'relative'}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey} rows={2}
            placeholder="Ask a clinical question… (Enter to send, Shift+Enter for new line)"
            style={{...inputSx,resize:'none',paddingRight:50,lineHeight:1.5,background:'var(--gray-50)'}}
            onFocus={e=>{e.target.style.borderColor='var(--blue-600)';e.target.style.background='#fff';}}
            onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.background='var(--gray-50)';}}>
          </textarea>
        </div>
        <button onClick={send} disabled={loading||!input.trim()} style={{width:52,borderRadius:12,background:loading||!input.trim()?'var(--gray-200)':'var(--blue-600)',border:'none',cursor:loading||!input.trim()?'not-allowed':'pointer',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}
          onMouseEnter={e=>{if(!loading&&input.trim())e.currentTarget.style.background='var(--blue-700)';}}
          onMouseLeave={e=>{if(!loading&&input.trim())e.currentTarget.style.background='var(--blue-600)';}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
}