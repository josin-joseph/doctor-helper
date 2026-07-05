export default function Modal({ open, onClose, title, children, width=580 }) {
  if (!open) return null;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.5)',backdropFilter:'blur(3px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="fade-up" style={{background:'#fff',borderRadius:18,width:'100%',maxWidth:width,maxHeight:'90vh',overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'0 24px 64px rgba(0,0,0,0.15)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 24px',borderBottom:'1px solid var(--border)',flexShrink:0}}>
          <h2 style={{fontSize:16,fontWeight:800,color:'var(--gray-900)',letterSpacing:'-0.01em'}}>{title}</h2>
          <button onClick={onClose} style={{background:'var(--gray-50)',border:'1px solid var(--border)',borderRadius:7,width:30,height:30,cursor:'pointer',fontSize:14,color:'var(--gray-400)',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--red-50)';e.currentTarget.style.color='var(--red-600)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='var(--gray-50)';e.currentTarget.style.color='var(--gray-400)';}}>✕</button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'20px 24px'}}>{children}</div>
      </div>
    </div>
  );
}