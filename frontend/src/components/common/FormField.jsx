export const inputSx = {
  width:'100%', border:'1.5px solid var(--border)', borderRadius:9,
  padding:'9px 12px', fontSize:13, color:'var(--gray-900)',
  outline:'none', background:'#fff', transition:'border-color 0.15s',
};

export const labelSx = {
  display:'block', fontSize:11, fontWeight:700,
  color:'var(--gray-400)', letterSpacing:'0.07em',
  textTransform:'uppercase', marginBottom:5,
};

export default function FormField({ label, required, children }) {
  return (
    <div>
      <label style={labelSx}>{label}{required && <span style={{color:'var(--red-600)',marginLeft:2}}>*</span>}</label>
      {children}
    </div>
  );
}