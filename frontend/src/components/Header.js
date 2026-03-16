import { useState } from 'react';

const C = {
  accent: '#F5A623',
  surface: 'rgba(15,28,46,0.75)',
  text: '#FFFFFF',
  textMuted: '#E8E8E8',
  danger: '#EF4444',
};

function Header({ agentStatus, isConnected, onStart, onStop, onToggleTheme, isDarkMode = true, onToggleVoice, isVoiceMode = false }) {
  const isRunning = agentStatus === 'running';

  const btn = (active, color) => ({
    padding: '0.35rem 0.85rem',
    borderRadius: 6,
    border: `1px solid ${active ? color : 'rgba(255,255,255,0.12)'}`,
    background: active ? `${color}22` : 'rgba(255,255,255,0.05)',
    color: active ? color : C.textMuted,
    fontWeight: 600, fontSize: '0.85rem',
    cursor: active ? 'pointer' : 'not-allowed',
    opacity: active ? 1 : 0.5,
  });

  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.75rem 1.25rem', flexShrink: 0,
      background: C.surface, backdropFilter: 'blur(14px)',
      borderBottom: `1px solid rgba(245,166,35,0.15)`,
    }}>
      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: C.text, marginRight: 'auto' }}>
        ✈ Universal Travel AI Agent
      </span>

      <button style={btn(!isRunning, C.accent)} disabled={isRunning} onClick={onStart}>Start Agent</button>
      <button style={btn(isRunning, C.danger)} disabled={!isRunning} onClick={onStop}>Stop Agent</button>
      <button style={{ ...btn(true, C.accent), opacity: 1 }} onClick={() => {}}>Settings</button>

      {onToggleTheme && (
        <button onClick={onToggleTheme} style={{ background: 'transparent', border: 'none', color: C.text, fontSize: '1.1rem', cursor: 'pointer' }}>
          {isDarkMode ? '🌙' : '☀️'}
        </button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: C.textMuted }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: isConnected ? C.accent : C.danger, display: 'inline-block' }} />
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
    </header>
  );
}

export default Header;
