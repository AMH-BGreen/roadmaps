import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CRITICALITY_COLORS, STATUS_COLORS } from '../constants.js';
import { formatDateDisplay, getInitiativeStartDate, getInitiativeEndDate } from '../utils/timeline.js';

export default function Tooltip({ initiative, anchorRect }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!ref.current || !anchorRect) return;
    const tip = ref.current.getBoundingClientRect();
    const MARGIN = 8;

    let top = anchorRect.top - tip.height - MARGIN;
    if (top < MARGIN) top = anchorRect.bottom + MARGIN;

    let left = anchorRect.left + anchorRect.width / 2 - tip.width / 2;
    left = Math.max(MARGIN, Math.min(left, window.innerWidth - tip.width - MARGIN));

    setPos({ top, left });
  }, [anchorRect]);

  const startDate = getInitiativeStartDate(initiative);
  const endDate = getInitiativeEndDate(initiative);
  const dateRange = initiative.quarterOnly
    ? initiative.quarter
    : `${formatDateDisplay(startDate.toISOString().slice(0, 10))} – ${formatDateDisplay(endDate.toISOString().slice(0, 10))}`;

  return createPortal(
    <div
      ref={ref}
      className="tooltip"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="tooltip-title">{initiative.name}</div>
      <div className="tooltip-row">
        <span className="tooltip-label">PM</span>
        <span>{initiative.pmOwner || '—'}</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-label">Dates</span>
        <span>{dateRange}</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-label">Status</span>
        <span style={{ color: STATUS_COLORS[initiative.status] || '#333' }}>{initiative.status}</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-label">Priority</span>
        <span style={{ color: CRITICALITY_COLORS[initiative.criticality] || '#333' }}>{initiative.criticality}</span>
      </div>
      {initiative.description && (
        <div className="tooltip-desc">{initiative.description}</div>
      )}
    </div>,
    document.body
  );
}
