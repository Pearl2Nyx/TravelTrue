import React from 'react';

const C = {
  accent: '#F5A623',
  surface: 'rgba(15,28,46,0.75)',
  text: '#FFFFFF',
  textMuted: '#E8E8E8',
};

const pulseStyle = `
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .pulse-dot { animation: pulse 1.5s ease-in-out infinite; }
`;

const BrowserView = ({ screenshot, currentWebsite, currentTask, isConnected }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', height: '100%',
    borderRadius: 16, backdropFilter: 'blur(18px)',
    background: C.surface,
    border: '1px solid rgba(245,166,35,0.15)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
    overflow: 'hidden',
  }}>
    <style>{pulseStyle}</style>

    {/* Label */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(15,28,46,0.5)', borderBottom: '1px solid rgba(245,166,35,0.12)' }}>
      <span style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>🌐 Live Browser</span>
      <span className={isConnected ? 'pulse-dot' : ''} style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: isConnected ? C.accent : C.textMuted, display: 'inline-block', marginLeft: 4 }} />
    </div>

    {/* URL bar */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(245,166,35,0.06)' }}>
      {['#ef4444','#f59e0b','#22c55e'].map((c, i) => (
        <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c, display: 'inline-block' }} />
      ))}
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: 4, padding: '4px 10px', fontSize: 12, color: C.textMuted, marginLeft: 6, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        {currentWebsite ? `https://www.${currentWebsite.toLowerCase().replace(/\s+/g,'')}.com` : 'about:blank'}
      </div>
    </div>

    {/* Content */}
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {screenshot ? (
        <img src={`data:image/png;base64,${screenshot}`} alt="Browser screenshot" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, color: C.textMuted }}>
          <span style={{ fontSize: 48 }}>🌐</span>
          <span style={{ fontSize: 14 }}>Waiting for agent to start...</span>
        </div>
      )}
    </div>

    {/* Footer */}
    {currentTask && (
      <div style={{ padding: '6px 14px', background: 'rgba(15,28,46,0.5)', borderTop: '1px solid rgba(245,166,35,0.12)', fontSize: 12, color: C.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: C.accent }}>▶</span>
        <span>{currentTask}</span>
      </div>
    )}
  </div>
);

export default BrowserView;
