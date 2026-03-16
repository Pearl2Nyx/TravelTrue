import { useState } from 'react';

const C = { accent: '#F5A623', surface: 'rgba(15,28,46,0.75)', text: '#FFFFFF', textMuted: '#E8E8E8', occupied: '#EF4444' };

const SeatMap = ({ seats = [], onSelectSeat, recommendedSeatId }) => {
  const [selected, setSelected] = useState(null);

  const click = (seat) => {
    if (seat.isOccupied) return;
    setSelected(seat.id);
    onSelectSeat && onSelectSeat(seat);
  };

  const seatStyle = (seat) => {
    const base = { width: 36, height: 36, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, cursor: seat.isOccupied ? 'not-allowed' : 'pointer', border: '1px solid rgba(255,255,255,0.1)', userSelect: 'none' };
    if (seat.isOccupied) return { ...base, background: 'rgba(239,68,68,0.25)', color: C.occupied };
    if (seat.id === selected) return { ...base, background: 'rgba(245,166,35,0.3)', color: C.accent, border: '1px solid rgba(245,166,35,0.5)' };
    if (seat.id === recommendedSeatId) return { ...base, background: 'rgba(245,166,35,0.15)', color: C.accent, border: '1px solid rgba(245,166,35,0.35)' };
    return { ...base, background: C.surface, color: C.text };
  };

  const rec = recommendedSeatId ? seats.flat().find(s => s.id === recommendedSeatId) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>🎟 Seat Map</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 32 }}>
        {['A','B','C','','D','E','F'].map((col, i) => (
          <div key={i} style={{ width: 36, textAlign: 'center', fontSize: 12, fontWeight: 600, color: col ? C.textMuted : 'transparent' }}>{col || '·'}</div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {seats.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 24, textAlign: 'right', fontSize: 12, color: C.textMuted, flexShrink: 0 }}>{row[0]?.row ?? ri + 1}</div>
            {row.slice(0,3).map(s => <Cell key={s.id} seat={s} style={seatStyle(s)} isRec={s.id === recommendedSeatId} onClick={() => click(s)} />)}
            <div style={{ width: 36 }} />
            {row.slice(3,6).map(s => <Cell key={s.id} seat={s} style={seatStyle(s)} isRec={s.id === recommendedSeatId} onClick={() => click(s)} />)}
          </div>
        ))}
      </div>

      {rec && (
        <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(245,166,35,0.08)', borderRadius: 8, border: '1px solid rgba(245,166,35,0.3)', fontSize: 13, color: C.text }}>
          <span style={{ color: C.accent, fontWeight: 700 }}>✦ AI Pick: </span>
          Seat {rec.id} recommended{(rec.isWindow || rec.hasLegroom) && ' — '}{rec.isWindow && 'Window seat'}{rec.isWindow && rec.hasLegroom && ' · '}{rec.hasLegroom && 'Extra legroom'}
        </div>
      )}

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {[
          { color: C.surface, label: 'Available', border: '1px solid rgba(255,255,255,0.15)' },
          { color: 'rgba(239,68,68,0.25)', label: 'Occupied' },
          { color: 'rgba(245,166,35,0.15)', label: 'AI Pick' },
          { color: 'rgba(245,166,35,0.3)', label: 'Selected' },
        ].map(({ color, label, border }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: color, border: border || 'none' }} />
            <span style={{ fontSize: 11, color: C.textMuted }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Cell = ({ seat, style, isRec, onClick }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
    <div style={style} onClick={onClick} title={seat.id}>{seat.isOccupied ? 'X' : seat.col}</div>
    <div style={{ display: 'flex', gap: 2 }}>
      {isRec && <span style={{ fontSize: 9, color: '#F5A623', fontWeight: 700 }}>AI</span>}
      {seat.isWindow && <span style={{ fontSize: 10 }}>🪟</span>}
      {seat.hasLegroom && <span style={{ fontSize: 10 }}>↕</span>}
    </div>
  </div>
);

export default SeatMap;
