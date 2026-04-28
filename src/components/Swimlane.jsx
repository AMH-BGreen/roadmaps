import { useMemo } from 'react';
import { assignLanes, swimlaneContentHeight, getTotalWidth, buildHeaders, dateToPx } from '../utils/timeline.js';
import { BRAND, SWIMLANE_HEADER_HEIGHT, HEADER_HEIGHT, TIMELINE_START } from '../constants.js';
import InitiativeBar from './InitiativeBar.jsx';

export default function Swimlane({
  area, initiatives, dayWidth, zoomLevel, filters,
  isCollapsed, onToggleCollapse,
  selectedId, onSelect, onUpdate,
}) {
  const laned = useMemo(() => assignLanes(initiatives), [initiatives]);
  const contentHeight = useMemo(() => swimlaneContentHeight(laned), [laned]);
  const totalWidth = getTotalWidth(dayWidth);

  // Grid lines (month or quarter boundaries)
  const { quarters, months } = useMemo(() => buildHeaders(), []);

  const isFiltered = (init) => {
    const { areas, criticality, status, pmOwner, confidence } = filters;
    if (areas.length && !areas.includes(init.area)) return true;
    if (criticality.length && !criticality.includes(init.criticality)) return true;
    if (status.length && !status.includes(init.status)) return true;
    if (pmOwner && init.pmOwner !== pmOwner) return true;
    if (confidence.length && !confidence.includes(init.confidence)) return true;
    return false;
  };

  const gridLines = zoomLevel === 'quarter' ? quarters : months;

  return (
    <div className="swimlane">
      {/* Row: label + content */}
      <div className="swimlane-row" style={{ height: isCollapsed ? SWIMLANE_HEADER_HEIGHT : SWIMLANE_HEADER_HEIGHT + contentHeight }}>
        {/* Sticky label */}
        <div
          className="swimlane-label"
          style={{ background: BRAND.darkBlue }}
        >
          <button
            className="swimlane-toggle"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            <span className="swimlane-toggle-icon">{isCollapsed ? '▶' : '▼'}</span>
          </button>
          <span className="swimlane-name">{area}</span>
          <span className="swimlane-count">{initiatives.length}</span>
        </div>

        {/* Timeline content */}
        <div
          className="swimlane-content"
          style={{ width: totalWidth, position: 'relative', overflow: 'hidden' }}
        >
          {/* Swimlane header strip (area color band) */}
          <div
            className="swimlane-header-strip"
            style={{ height: SWIMLANE_HEADER_HEIGHT, background: '#e8edf2', borderBottom: '1px solid #d0d8e0' }}
          />

          {/* Content area with bars */}
          {!isCollapsed && (
            <div style={{ position: 'relative', height: contentHeight }}>
              {/* Vertical grid lines */}
              {gridLines.map((seg, i) => {
                const x = dateToPx(seg.start, dayWidth) - dateToPx(TIMELINE_START, dayWidth);
                return (
                  <div
                    key={i}
                    className="grid-line"
                    style={{ left: x, height: contentHeight }}
                  />
                );
              })}

              {/* Initiative bars */}
              {laned.map(init => (
                <InitiativeBar
                  key={init.id}
                  initiative={init}
                  dayWidth={dayWidth}
                  zoomLevel={zoomLevel}
                  isFiltered={isFiltered(init)}
                  isSelected={init.id === selectedId}
                  onSelect={onSelect}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
