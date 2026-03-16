const C = { accent: '#F5A623', surface: 'rgba(15,28,46,0.75)', text: '#FFFFFF', textMuted: '#E8E8E8' };

const icon = (t) => ({ flight: '✈', bus: '🚌', train: '🚆' }[(t||'').toLowerCase()] || '');

const ResultCards = ({ results = [], onBook, onViewSeats }) => {
  const cheapest = results.length > 0 ? results.reduce((m, r, i, a) => r.price < a[m].price ? i : m, 0) : -1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>🎟 Travel Results</div>
      {results.length === 0 ? (
        <div style={{ color: C.textMuted, fontSize: 14 }}>No results yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 480, overflowY: 'auto' }}>
          {results.map((r, i) => (
            <div key={i} style={{
              background: C.surface, backdropFilter: 'blur(12px)', borderRadius: 10, padding: '14px 16px',
              border: i === cheapest ? '1px solid rgba(245,166,35,0.45)' : '1px solid rgba(255,255,255,0.08)',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, color: C.text, fontSize: 15 }}>{r.operator}</span>
                <span style={{ fontSize: 16 }}>{icon(r.travelType)}</span>
                {i === cheapest && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: C.accent, border: '1px solid rgba(245,166,35,0.4)', borderRadius: 4, padding: '1px 6px' }}>Cheapest</span>}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.accent }}>₹{r.price}</div>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 13, color: C.textMuted }}>🕐 {r.departure}</span>
                <span style={{ fontSize: 13, color: C.textMuted }}>⏱ {r.duration}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => onBook && onBook(r, i)} style={{ background: 'rgba(245,166,35,0.15)', color: C.accent, border: '1px solid rgba(245,166,35,0.35)', borderRadius: 6, padding: '7px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Book</button>
                <button onClick={() => onViewSeats && onViewSeats(r, i)} style={{ background: 'transparent', color: C.textMuted, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '7px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>View seats</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultCards;
