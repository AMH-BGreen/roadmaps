import { useState, useRef, useEffect } from 'react';
import {
  PRODUCT_AREAS, CRITICALITY_OPTIONS, STATUS_OPTIONS,
  CONFIDENCE_OPTIONS, BRAND,
} from '../constants.js';
import { SAMPLE_INITIATIVES } from '../data/sampleData.js';

function MultiSelect({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (opt) => {
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);
  };

  return (
    <div ref={ref} className="multiselect" style={{ position: 'relative' }}>
      <button
        className={`multiselect-trigger${selected.length ? ' has-selection' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        {selected.length ? `${label}: ${selected.length}` : label}
        <span className="multiselect-caret">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="multiselect-dropdown">
          {options.map(opt => (
            <label key={opt} className="multiselect-option">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function ZoomButton({ label, active, onClick }) {
  return (
    <button
      className={`zoom-btn${active ? ' active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default function TopNav({
  filters, onFilterChange,
  zoomLevel, onZoomChange,
  allPMs,
  onNewInitiative,
  onExport, onImport, onResetData,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef(null);
  const importRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (settingsRef.current && !settingsRef.current.contains(e.target)) setSettingsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        onImport(data);
      } catch {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const hasFilters = filters.areas.length || filters.criticality.length ||
    filters.status.length || filters.pmOwner || filters.confidence.length;

  return (
    <nav className="top-nav">
      {/* Brand */}
      <div className="nav-brand">
        <div className="nav-logo" style={{ background: BRAND.heritageRed }} />
        <span className="nav-title">AMH Product Roadmap</span>
      </div>

      {/* Filters */}
      <div className="nav-filters">
        <MultiSelect
          label="Area"
          options={PRODUCT_AREAS}
          selected={filters.areas}
          onChange={v => onFilterChange({ ...filters, areas: v })}
        />
        <MultiSelect
          label="Criticality"
          options={CRITICALITY_OPTIONS}
          selected={filters.criticality}
          onChange={v => onFilterChange({ ...filters, criticality: v })}
        />
        <MultiSelect
          label="Status"
          options={STATUS_OPTIONS}
          selected={filters.status}
          onChange={v => onFilterChange({ ...filters, status: v })}
        />
        <MultiSelect
          label="Confidence"
          options={CONFIDENCE_OPTIONS}
          selected={filters.confidence}
          onChange={v => onFilterChange({ ...filters, confidence: v })}
        />

        {/* PM Owner */}
        <select
          className="nav-select"
          value={filters.pmOwner}
          onChange={e => onFilterChange({ ...filters, pmOwner: e.target.value })}
        >
          <option value="">PM Owner</option>
          {allPMs.map(pm => <option key={pm} value={pm}>{pm}</option>)}
        </select>

        {hasFilters && (
          <button
            className="clear-filters-btn"
            onClick={() => onFilterChange({ areas: [], criticality: [], status: [], pmOwner: '', confidence: [] })}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Right controls */}
      <div className="nav-right">
        {/* Zoom */}
        <div className="zoom-group">
          <ZoomButton label="Qtr" active={zoomLevel === 'quarter'} onClick={() => onZoomChange('quarter')} />
          <ZoomButton label="Month" active={zoomLevel === 'month'} onClick={() => onZoomChange('month')} />
          <ZoomButton label="6-Week" active={zoomLevel === 'week'} onClick={() => onZoomChange('week')} />
        </div>

        <button className="btn btn-primary btn-sm" onClick={onNewInitiative}>
          + New Initiative
        </button>

        {/* Settings menu */}
        <div ref={settingsRef} style={{ position: 'relative' }}>
          <button className="icon-btn" onClick={() => setSettingsOpen(o => !o)} title="Settings">
            ⚙
          </button>
          {settingsOpen && (
            <div className="settings-dropdown">
              <button className="settings-item" onClick={() => { onExport(); setSettingsOpen(false); }}>
                Export JSON
              </button>
              <button className="settings-item" onClick={() => { importRef.current?.click(); setSettingsOpen(false); }}>
                Import JSON
              </button>
              <div className="settings-divider" />
              <button className="settings-item settings-danger" onClick={() => { if (window.confirm('Reset to sample data?')) { onResetData(); setSettingsOpen(false); } }}>
                Reset to Sample Data
              </button>
            </div>
          )}
          <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportFile} />
        </div>
      </div>
    </nav>
  );
}
