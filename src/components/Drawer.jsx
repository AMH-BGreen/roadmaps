import { useState, useEffect, useCallback, useRef } from 'react';
import {
  PRODUCT_AREAS, CRITICALITY_OPTIONS, CRITICALITY_COLORS,
  STATUS_OPTIONS, CONFIDENCE_OPTIONS, BRAND,
} from '../constants.js';
import { formatDateDisplay, getInitiativeStartDate, getInitiativeEndDate } from '../utils/timeline.js';

const QUARTER_OPTIONS = [
  'Q1 2024','Q2 2024','Q3 2024','Q4 2024',
  'Q1 2025','Q2 2025','Q3 2025','Q4 2025',
  'Q1 2026','Q2 2026','Q3 2026','Q4 2026',
];

function Field({ label, children }) {
  return (
    <div className="drawer-field">
      <label className="drawer-field-label">{label}</label>
      <div className="drawer-field-value">{children}</div>
    </div>
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      className="drawer-input"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || ''}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      className="drawer-textarea"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || ''}
      rows={rows}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select className="drawer-select" value={value || ''} onChange={e => onChange(e.target.value)}>
      <option value="">— select —</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export default function Drawer({ initiative, allPMs, onUpdate, onDelete, onClose, onCreate }) {
  const [draft, setDraft] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving' | 'saved'
  const saveTimer = useRef(null);
  const isNew = initiative === 'new';

  useEffect(() => {
    if (isNew) {
      setDraft({
        id: null,
        name: '',
        area: PRODUCT_AREAS[0],
        pmOwner: '',
        criticality: 'Medium',
        confidence: 'TBD',
        startDate: '',
        endDate: '',
        quarterOnly: false,
        quarter: null,
        status: 'Discovery',
        description: '',
        okrLink: '',
        problemStatement: '',
        hypothesis: '',
        keyMetrics: '',
        dependencies: '',
        openRisks: '',
        notes: '',
      });
    } else if (initiative) {
      setDraft({ ...initiative });
    }
  }, [initiative, isNew]);

  const update = useCallback((field, value) => {
    setDraft(prev => {
      const next = { ...prev, [field]: value };
      if (!isNew) {
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          onUpdate(next.id, next);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(null), 2000);
        }, 300);
      }
      return next;
    });
  }, [isNew, onUpdate]);

  if (!draft) return null;

  const startDate = draft.quarterOnly ? null : draft.startDate;
  const endDate = draft.quarterOnly ? null : draft.endDate;

  const critColor = CRITICALITY_COLORS[draft.criticality] || '#9E9E9E';

  const handleCreate = () => {
    if (!draft.name.trim()) return;
    onCreate(draft);
  };

  return (
    <div className="drawer">
      {/* Drawer header */}
      <div className="drawer-header" style={{ borderTop: `4px solid ${critColor}` }}>
        <div className="drawer-header-top">
          <div>
            <div className="drawer-area-tag" style={{ color: BRAND.heritageBlue }}>{draft.area}</div>
            <div className="drawer-initiative-name">
              {isNew ? (
                <input
                  className="drawer-title-input"
                  value={draft.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="Initiative name…"
                  autoFocus
                />
              ) : (
                <input
                  className="drawer-title-input"
                  value={draft.name}
                  onChange={e => update('name', e.target.value)}
                />
              )}
            </div>
          </div>
          <div className="drawer-header-actions">
            {saveStatus === 'saved' && <span className="save-indicator">Saved</span>}
            <button className="drawer-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Status pills */}
        <div className="drawer-pills">
          <span
            className="pill pill-criticality"
            style={{ background: critColor }}
          >
            {draft.criticality}
          </span>
          <span className="pill pill-status">{draft.status}</span>
          <span className="pill pill-confidence">{draft.confidence}</span>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="drawer-body">

        {/* Core fields */}
        <div className="drawer-section">
          <div className="drawer-section-title">Details</div>

          <Field label="Product Area">
            <Select value={draft.area} onChange={v => update('area', v)} options={PRODUCT_AREAS} />
          </Field>

          <Field label="PM Owner">
            <TextInput value={draft.pmOwner} onChange={v => update('pmOwner', v)} placeholder="Name" />
          </Field>

          <Field label="Criticality">
            <Select value={draft.criticality} onChange={v => update('criticality', v)} options={CRITICALITY_OPTIONS} />
          </Field>

          <Field label="Status">
            <Select value={draft.status} onChange={v => update('status', v)} options={STATUS_OPTIONS} />
          </Field>

          <Field label="Confidence">
            <Select value={draft.confidence} onChange={v => update('confidence', v)} options={CONFIDENCE_OPTIONS} />
          </Field>

          <Field label="Date Type">
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  checked={!draft.quarterOnly}
                  onChange={() => update('quarterOnly', false)}
                />
                Exact dates
              </label>
              <label>
                <input
                  type="radio"
                  checked={!!draft.quarterOnly}
                  onChange={() => update('quarterOnly', true)}
                />
                Quarter-only
              </label>
            </div>
          </Field>

          {draft.quarterOnly ? (
            <Field label="Quarter">
              <Select value={draft.quarter} onChange={v => update('quarter', v)} options={QUARTER_OPTIONS} />
            </Field>
          ) : (
            <>
              <Field label="Start Date">
                <input
                  type="date"
                  className="drawer-input"
                  value={startDate || ''}
                  onChange={e => update('startDate', e.target.value)}
                />
              </Field>
              <Field label="End Date">
                <input
                  type="date"
                  className="drawer-input"
                  value={endDate || ''}
                  onChange={e => update('endDate', e.target.value)}
                />
              </Field>
            </>
          )}

          <Field label="OKR / Jira Link">
            <TextInput value={draft.okrLink} onChange={v => update('okrLink', v)} placeholder="URL or key" />
          </Field>
        </div>

        {/* One-liner description */}
        <div className="drawer-section">
          <div className="drawer-section-title">Summary</div>
          <Field label="One-line Description">
            <TextInput value={draft.description} onChange={v => update('description', v)} placeholder="Brief description shown on the bar" />
          </Field>
        </div>

        {/* Strategy */}
        <div className="drawer-section">
          <div className="drawer-section-title">Strategy</div>

          <Field label="Problem Statement">
            <TextArea value={draft.problemStatement} onChange={v => update('problemStatement', v)} placeholder="What problem does this solve?" rows={4} />
          </Field>

          <Field label="Hypothesis / Expected Outcome">
            <TextArea value={draft.hypothesis} onChange={v => update('hypothesis', v)} placeholder="What do we expect to happen?" rows={3} />
          </Field>

          <Field label="Key Metrics / Success Criteria">
            <TextArea value={draft.keyMetrics} onChange={v => update('keyMetrics', v)} placeholder="How will we measure success?" rows={3} />
          </Field>
        </div>

        {/* Execution */}
        <div className="drawer-section">
          <div className="drawer-section-title">Execution</div>

          <Field label="Dependencies">
            <TextArea value={draft.dependencies} onChange={v => update('dependencies', v)} placeholder="Teams, systems, or vendors this depends on" rows={2} />
          </Field>

          <Field label="Open Risks">
            <TextArea value={draft.openRisks} onChange={v => update('openRisks', v)} placeholder="Known risks or blockers" rows={2} />
          </Field>

          <Field label="Notes">
            <TextArea value={draft.notes} onChange={v => update('notes', v)} placeholder="Additional context" rows={2} />
          </Field>
        </div>

        {/* Actions */}
        <div className="drawer-actions">
          {isNew ? (
            <button className="btn btn-primary" onClick={handleCreate} disabled={!draft.name.trim()}>
              Add to Roadmap
            </button>
          ) : (
            <button className="btn btn-danger" onClick={() => { if (window.confirm('Delete this initiative?')) onDelete(draft.id); }}>
              Delete Initiative
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
