import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#F0F4FF',
    }}>
      <div style={{ textAlign: 'center', padding: 24 }}>
        <div style={{
          fontSize: 80, fontWeight: 900, color: '#DBEAFE',
          letterSpacing: '-0.05em', lineHeight: 1,
        }}>404</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginTop: 8, marginBottom: 8 }}>
          Page not found
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" style={{
          background: '#2563EB', color: '#fff', textDecoration: 'none',
          borderRadius: 9, padding: '10px 24px', fontSize: 14, fontWeight: 700,
        }}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}