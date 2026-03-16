const C = {
  accent: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#E8E8E8',
};

const TRANSPORT_MODES = [
  { mode: 'flights', label: 'Flights', icon: '✈' },
  { mode: 'trains', label: 'Trains', icon: '🚆' },
  { mode: 'buses', label: 'Buses', icon: '🚌' },
  { mode: 'all', label: 'All Modes', icon: '🌍' },
];

const QUICK_FILTERS = [
  { id: 'budget', label: 'Budget' },
  { id: 'departure_time', label: 'Departure time' },
  { id: 'fastest_route', label: 'Fastest route' },
  { id: 'cheapest_route', label: 'Cheapest route' },
];

const sectionLabel = {
  fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#F5A623', marginBottom: 8,
};

const divider = { height: 1, background: 'rgba(245,166,35,0.2)', marginBottom: 8 };

const Sidebar = ({ selectedMode = 'all', onModeChange, selectedFilters = [], onFilterChange }) => {
  const toggle = (id) => {
    const updated = selectedFilters.includes(id)
      ? selectedFilters.filter(f => f !== id)
      : [...selectedFilters, id];
    if (onFilterChange) onFilterChange(updated);
  };

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', padding: '20px 0', gap: 28, height: '100%', boxSizing: 'border-box' }}>
      <div style={{ padding: '0 16px' }}>
        <div style={sectionLabel}>Transport Options</div>
        <div style={divider} />
        {TRANSPORT_MODES.map(({ mode, label, icon }) => {
          const active = selectedMode === mode;
          return (
            <div key={mode} onClick={() => onModeChange && onModeChange(mode)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 6, cursor: 'pointer',
              background: active ? 'rgba(245,166,35,0.12)' : 'transparent',
              borderLeft: active ? `3px solid ${C.accent}` : '3px solid transparent',
              color: active ? C.text : C.textMuted,
              fontSize: 14, fontWeight: active ? 600 : 400, userSelect: 'none',
              marginBottom: 2,
            }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              <span>{label}</span>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={sectionLabel}>Filters</div>
        <div style={divider} />
        {QUICK_FILTERS.map(({ id, label }) => {
          const active = selectedFilters.includes(id);
          return (
            <div key={id} onClick={() => toggle(id)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
              background: active ? 'rgba(245,166,35,0.12)' : 'transparent',
              color: active ? C.text : C.textMuted,
              fontSize: 13, fontWeight: active ? 600 : 400,
              border: `1px solid ${active ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.08)'}`,
              userSelect: 'none', marginBottom: 6,
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                border: `2px solid ${active ? C.accent : C.textMuted}`,
                background: active ? C.accent : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {active && <div style={{ width: 6, height: 6, background: '#0A0A0A', borderRadius: 1 }} />}
              </div>
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
