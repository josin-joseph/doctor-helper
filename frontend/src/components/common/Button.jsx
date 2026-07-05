export default function Button({ children, onClick, type='button', variant='primary', size='md', disabled, loading, icon }) {
  const sizes = { sm:{fontSize:11,padding:'5px 12px'}, md:{fontSize:13,padding:'8px 16px'}, lg:{fontSize:14,padding:'10px 22px'} };
  const variants = {
    primary:  {background:'var(--blue-600)',color:'#fff',border:'none'},
    outline:  {background:'#fff',color:'var(--gray-700)',border:'1px solid var(--border)'},
    danger:   {background:'var(--red-50)',color:'var(--red-800)',border:'1px solid #FECACA'},
    success:  {background:'var(--green-50)',color:'var(--green-800)',border:'1px solid #A7F3D0'},
    ghost:    {background:'transparent',color:'var(--gray-500)',border:'none'},
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled||loading}
      style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,borderRadius:9,fontWeight:700,cursor:disabled?'not-allowed':'pointer',transition:'all 0.15s',opacity:disabled?0.5:1,...sizes[size],...variants[variant]}}
      onMouseEnter={e=>{if(!disabled&&!loading){e.currentTarget.style.filter='brightness(0.95)';e.currentTarget.style.transform='translateY(-1px)';}}}
      onMouseLeave={e=>{e.currentTarget.style.filter='';e.currentTarget.style.transform='';}}>
      {loading ? <span style={{width:14,height:14,border:'2px solid rgba(255,255,255,0.4)',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block'}}/> : icon||null}
      {children}
    </button>
  );
}