import { useState } from 'react';

const C = {
  accent: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#E8E8E8',
};

const SuggestionsPanel = ({ suggestions = [], onAccept, onDismiss }) => {
  const [dismissed, setDismissed] = useState([]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.accent, marginBottom: 10 }}>
        💡 AI Suggestions
      </div>
      <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {suggestions.filter((_, i) => !dismissed.includes(i)).length === 0 ? (
          <div style={{ color: C.textMuted, fontSize: 13 }}>No suggestions yet. The agent will suggest actions as it observes your screen.</div>
        ) : (
          suggestions.map((text, i) => {
            if (dismissed.includes(i)) return null;
            return (
              <div key={i} style={{
                background: 'rgba(245,166,35,0.06)',
                borderLeft: `3px solid ${C.accent}`,
                borderRadius: 6, padding: '8px 12px',
                border: '1px solid rgba(245,166,35,0.2)',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                <div style={{ color: C.text, fontSize: 13, lineHeight: 1.5 }}>💡 {text}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => onAccept && onAccept(i, 'suggestion')} style={{
                    background: 'rgba(245,166,35,0.15)', color: C.accent,
                    border: '1px solid rgba(245,166,35,0.35)', borderRadius: 4,
                    padding: '3px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 500,
                  }}>✓ Accept</button>
                  <button onClick={() => { setDismissed(p => [...p, i]); onDismiss && onDismiss(i, 'suggestion'); }} style={{
                    background: 'transparent', color: C.textMuted,
                    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4,
                    padding: '3px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 500,
                  }}>✕ Dismiss</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SuggestionsPanel;
