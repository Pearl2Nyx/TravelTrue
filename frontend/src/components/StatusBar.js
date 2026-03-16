import React from 'react';

const C = { accent: '#F5A623', text: '#FFFFFF', textMuted: '#E8E8E8', danger: '#EF4444' };

const Dot = ({ color }) => <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: color, marginRight: 5 }} />;
const Divider = () => <span style={{ color: C.textMuted, margin: '0 10px' }}>|</span>;

const StatusBar = ({ agentStatus, currentWebsite, currentTask, aiConfidence, isConnected }) => {
  const confidence = aiConfidence !== null && aiConfidence !== undefined && aiConfidence !== ''
    ? (typeof aiConfidence === 'number' ? `${Math.round(aiConfidence * 100)}%` : String(aiConfidence))
    : null;

  const dotColor = agentStatus === 'running' ? C.accent : agentStatus === 'stopped' ? C.danger : '#EAB308';

  const items = [
    { key: 'status', render: () => <><Dot color={dotColor} /><span>Agent: {agentStatus}</span></> },
    currentWebsite && { key: 'site', render: () => <span>Website: {currentWebsite}</span> },
    currentTask && { key: 'task', render: () => <span>Task: {currentTask}</span> },
    confidence && { key: 'conf', render: () => <span>AI Confidence: {confidence}</span> },
    { key: 'conn', render: () => <><Dot color={isConnected ? C.accent : C.danger} /><span>{isConnected ? 'Connected' : 'Disconnected'}</span></> },
  ].filter(Boolean);

  return (
    <div style={{
      width: '100%', background: 'rgba(15,28,46,0.75)', backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(245,166,35,0.15)',
      display: 'flex', alignItems: 'center', padding: '4px 16px',
      fontSize: '0.75rem', color: C.textMuted, boxSizing: 'border-box', flexShrink: 0,
    }}>
      {items.map((item, idx) => (
        <React.Fragment key={item.key}>
          {idx > 0 && <Divider />}
          <span style={{ display: 'flex', alignItems: 'center' }}>{item.render()}</span>
        </React.Fragment>
      ))}
    </div>
  );
};

export default StatusBar;
