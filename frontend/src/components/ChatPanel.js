import React, { useRef, useEffect } from 'react';

const C = {
  accent: '#F5A623',
  surface: 'rgba(15,28,46,0.75)',
  text: '#FFFFFF',
  textMuted: '#E8E8E8',
  danger: '#EF4444',
};

const ChatPanel = ({ messages = [] }) => {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: 12, gap: 10, background: 'transparent' }}>
      {messages.length === 0 ? (
        <p style={{ color: C.textMuted, textAlign: 'center', marginTop: 40, fontSize: 14 }}>
          Start the agent and ask a question to begin.
        </p>
      ) : (
        messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <span style={{ fontSize: 11, color: C.textMuted, marginBottom: 3, paddingLeft: msg.role === 'user' ? 0 : 4, paddingRight: msg.role === 'user' ? 4 : 0 }}>
              {msg.role === 'user' ? 'You' : 'Agent'}
            </span>
            <div style={{
              maxWidth: '75%', padding: '8px 12px', borderRadius: 12,
              fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word',
              background: msg.role === 'user' ? 'rgba(245,166,35,0.18)' : C.surface,
              border: msg.role === 'user' ? '1px solid rgba(245,166,35,0.35)' : '1px solid rgba(255,255,255,0.08)',
              color: msg.isError ? C.danger : C.text,
              backdropFilter: 'blur(8px)',
            }}>
              {msg.text}
            </div>
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatPanel;
