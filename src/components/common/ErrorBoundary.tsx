import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          style={{ 
            minHeight: '50vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '32px 16px',
            backgroundColor: 'var(--bg-page, #f8fafc)'
          }}
        >
          <div 
            style={{ 
              maxWidth: '460px', 
              width: '100%', 
              backgroundColor: '#ffffff', 
              borderRadius: '16px', 
              padding: '32px 24px', 
              textAlign: 'center',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div 
              style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%', 
                backgroundColor: '#fee2e2', 
                color: '#dc2626', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              {this.props.fallbackTitle || 'Unable to Load Content'}
            </h2>

            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '24px' }}>
              {this.props.fallbackMessage || 'An unexpected rendering issue occurred. Please refresh or return to all subscriptions.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '11px 20px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                <RefreshCw size={15} />
                <span>Try Again</span>
              </button>

              <Link
                to="/items"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '11px 20px',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                  textDecoration: 'none'
                }}
              >
                <ArrowLeft size={15} />
                <span>Browse All Subscriptions</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
