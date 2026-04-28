import { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { SAMPLE_INITIATIVES } from './data/sampleData.js';
import { DAY_WIDTHS } from './constants.js';
import TopNav from './components/TopNav.jsx';
import Timeline from './components/Timeline.jsx';
import Drawer from './components/Drawer.jsx';

const EMPTY_FILTERS = { areas: [], criticality: [], status: [], pmOwner: '', confidence: [] };

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function App() {
  const [initiatives, setInitiatives] = useLocalStorage('amh-roadmap-v1', SAMPLE_INITIATIVES);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [zoomLevel, setZoomLevel] = useState('month');
  const [selectedId, setSelectedId] = useState(null); // id | 'new' | null
  const [collapsedAreas, setCollapsedAreas] = useState({});

  const dayWidth = DAY_WIDTHS[zoomLevel];

  // Derive the full list of PM owners for the filter dropdown
  const allPMs = useMemo(() => {
    const set = new Set(initiatives.map(i => i.pmOwner).filter(Boolean));
    return [...set].sort();
  }, [initiatives]);

  const updateInitiative = useCallback((id, patch) => {
    setInitiatives(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  }, [setInitiatives]);

  const deleteInitiative = useCallback((id) => {
    setInitiatives(prev => prev.filter(i => i.id !== id));
    setSelectedId(null);
  }, [setInitiatives]);

  const createInitiative = useCallback((draft) => {
    const newInit = { ...draft, id: makeId() };
    setInitiatives(prev => [...prev, newInit]);
    setSelectedId(newInit.id);
  }, [setInitiatives]);

  const toggleCollapse = useCallback((area) => {
    setCollapsedAreas(prev => ({ ...prev, [area]: !prev[area] }));
  }, []);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(initiatives, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amh-roadmap-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (data) => {
    if (!Array.isArray(data)) { alert('Expected an array of initiatives.'); return; }
    setInitiatives(data);
    setSelectedId(null);
  };

  const selectedInitiative = selectedId === 'new'
    ? 'new'
    : initiatives.find(i => i.id === selectedId) || null;

  const showDrawer = !!selectedInitiative;

  return (
    <div className="app">
      <TopNav
        filters={filters}
        onFilterChange={setFilters}
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        allPMs={allPMs}
        onNewInitiative={() => setSelectedId('new')}
        onExport={handleExport}
        onImport={handleImport}
        onResetData={() => { setInitiatives(SAMPLE_INITIATIVES); setSelectedId(null); }}
      />

      <div className="main-area">
        <Timeline
          initiatives={initiatives}
          dayWidth={dayWidth}
          zoomLevel={zoomLevel}
          filters={filters}
          collapsedAreas={collapsedAreas}
          onToggleCollapse={toggleCollapse}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onUpdate={updateInitiative}
        />

        {showDrawer && (
          <Drawer
            initiative={selectedInitiative}
            allPMs={allPMs}
            onUpdate={updateInitiative}
            onDelete={deleteInitiative}
            onCreate={createInitiative}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  );
}
