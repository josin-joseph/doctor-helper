export default function PageHeader({ title, subtitle, action, badge }) {
  return (
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
      <div>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
          <h1 style={{fontSize:20,fontWeight:800,color:'var(--gray-900)',letterSpacing:'-0.02em'}}>{title}</h1>
          {badge && <span style={{fontSize:11,fontWeight:700,padding:'2px 9px',background:'var(--blue-50)',color:'var(--blue-700)',borderRadius:20,letterSpacing:'0.03em'}}>{badge}</span>}
        </div>
        {subtitle && <p style={{fontSize:13,color:'var(--gray-400)'}}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}