import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#F0F4FF', padding: 24,
        }}>
          <div style={{
            background: '#fff', border: '1px solid #E2E8F0',
            borderRadius: 16, padding: '40px', maxWidth: 480,
            textAlign: 'center', width: '100%',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 24, lineHeight: 1.6 }}>
              An unexpected error occurred. Please refresh the page or contact support if the problem persists.
            </p>
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 8, padding: '10px 14px', marginBottom: 20,
              fontSize: 11, color: '#991B1B', textAlign: 'left',
              fontFamily: 'monospace', wordBreak: 'break-all',
            }}>
              {this.state.error?.message || 'Unknown error'}
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#2563EB', color: '#fff', border: 'none',
                borderRadius: 9, padding: '10px 24px', fontSize: 14,
                fontWeight: 700, cursor: 'pointer',
              }}
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}