import React, { useState, useRef } from 'react';

const C = {
  accent: '#F5A623',
  surface: 'rgba(15,28,46,0.75)',
  text: '#FFFFFF',
  textMuted: '#E8E8E8',
};

const QUICK_ACTIONS = ['Book cheapest', 'Filter under ₹4000', 'Show fastest'];
const SpeechRecognitionAPI = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

const TravelInput = ({ onSend, disabled = false }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const handleSend = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t); setText('');
  };

  const handleVoice = () => {
    if (!SpeechRecognitionAPI) return;
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onresult = (e) => setText(e.results[0][0].transcript);
    }
    recognitionRef.current.start();
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8, padding: 12,
      background: C.surface, backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(245,166,35,0.15)',
    }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 8,
            border: '1px solid rgba(245,166,35,0.3)',
            background: 'rgba(0,0,0,0.4)', color: C.text,
            fontSize: 14, outline: 'none',
          }}
          type="text" placeholder="Ask the agent..."
          value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={disabled}
        />
        {SpeechRecognitionAPI && (
          <button onClick={handleVoice} disabled={disabled} title="🎤 Speak to Agent" style={{
            padding: '8px 10px', borderRadius: 8, border: 'none',
            background: isListening ? 'rgba(239,68,68,0.2)' : 'rgba(245,166,35,0.12)',
            color: C.text, cursor: 'pointer', fontSize: 16,
          }}>🎤</button>
        )}
        <button onClick={handleSend} disabled={disabled} style={{
          padding: '8px 16px', borderRadius: 8,
          border: '1px solid rgba(245,166,35,0.4)',
          background: 'rgba(245,166,35,0.15)', color: C.accent,
          fontWeight: 600, cursor: 'pointer', fontSize: 14,
        }}>Send</button>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {QUICK_ACTIONS.map(label => (
          <button key={label} onClick={() => !disabled && onSend(label)} disabled={disabled} style={{
            padding: '5px 10px', borderRadius: 6,
            border: '1px solid rgba(245,166,35,0.25)',
            background: 'transparent', color: C.accent,
            fontSize: 12, cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>
    </div>
  );
};

export default TravelInput;
