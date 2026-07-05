export default function StatCard({ title, value, icon, trendLabel, trend, iconBg='var(--blue-50)', iconColor='var(--blue-600)' }) {
  const trendColor = trend==='up' ? 'var(--green-600)' : trend==='down' ? 'var(--red-600)' : 'var(--gray-400)';
  const trendArrow = trend==='up' ? '↑' : trend==='down' ? '↓' : '→';
  return (
    <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'16px 18px',display:'flex',flexDirection:'column',gap:10,transition:'box-shadow 0.2s,transform 0.2s',cursor:'default'}}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 20px rgba(37,99,235,0.08)';e.currentTarget.style.transform='translateY(-1px)';}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none';}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:'var(--gray-400)',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:6}}>{title}</div>
          <div style={{fontSize:30,fontWeight:800,color:'var(--gray-900)',letterSpacing:'-0.03em',lineHeight:1}}>{value}</div>
        </div>
        <div style={{width:38,height:38,borderRadius:10,background:iconBg,display:'flex',alignItems:'center',justifyContent:'center',color:iconColor,flexShrink:0}}>{icon}</div>
      </div>
      {trendLabel && (
        <div style={{fontSize:11,color:trendColor,display:'flex',alignItems:'center',gap:4,paddingTop:8,borderTop:'1px solid var(--gray-100)'}}>
          <span style={{fontWeight:700}}>{trendArrow}</span>
          <span style={{fontWeight:600}}>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}