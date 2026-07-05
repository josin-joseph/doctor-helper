export default function Spinner({ size='md', label }) {
  const s = {sm:18,md:36,lg:52}[size];
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,padding:32}}>
      <div style={{width:s,height:s,border:`3px solid var(--blue-100)`,borderTop:`3px solid var(--blue-600)`,borderRadius:'50%',animation:'spin 0.7s linear infinite'}}/>
      {label && <span style={{fontSize:12,color:'var(--gray-400)',fontWeight:500}}>{label}</span>}
    </div>
  );
}
