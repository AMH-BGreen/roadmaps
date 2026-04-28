import { useRef, useState, useCallback } from 'react';
import {
  dateToPx, pxToDate, getInitiativeStartDate, getInitiativeEndDate,
  snapDate, formatDate, getTotalWidth,
} from '../utils/timeline.js';
import { CRITICALITY_COLORS, BAR_HEIGHT, SWIMLANE_V_PAD, LANE_HEIGHT, TIMELINE_START, TIMELINE_END } from '../constants.js';
import Tooltip from './Tooltip.jsx';

export default function InitiativeBar({ initiative, dayWidth, zoomLevel, isFiltered, isSelected, onSelect, onUpdate }) {
  const barRef = useRef(null);
  const dragRef = useRef(null);
  const tooltipTimerRef = useRef(null);
  const [tooltipAnchor, setTooltipAnchor] = useState(null);

  const startDate = getInitiativeStartDate(initiative);
  const endDate = getInitiativeEndDate(initiative);
  const left = dateToPx(startDate, dayWidth);
  const right = dateToPx(endDate, dayWidth);
  const width = Math.max(right - left, dayWidth);
  const top = SWIMLANE_V_PAD + (initiative._lane || 0) * LANE_HEIGHT;

  const critColor = CRITICALITY_COLORS[initiative.criticality] || '#9E9E9E';
  const isQuarterOnly = initiative.quarterOnly && !initiative.startDate;

  const startDrag = useCallback((e, type) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    // Clear tooltip immediately on drag start
    clearTimeout(tooltipTimerRef.current);
    setTooltipAnchor(null);

    const startX = e.clientX;
    const origLeft = left;
    const origWidth = width;
    const totalW = getTotalWidth(dayWidth);

    dragRef.current = { type, startX, origLeft, origWidth, curLeft: origLeft, curRight: origLeft + origWidth };

    const onMove = (e) => {
      if (!dragRef.current || !barRef.current) return;
      const dx = e.clientX - startX;
      let nl = origLeft;
      let nw = origWidth;

      if (type === 'move') {
        nl = origLeft + dx;
        nw = origWidth;
      } else if (type === 'resize-left') {
        nl = origLeft + dx;
        nw = origWidth - dx;
        if (nw < dayWidth) { nw = dayWidth; nl = origLeft + origWidth - dayWidth; }
      } else if (type === 'resize-right') {
        nw = Math.max(origWidth + dx, dayWidth);
      }

      // Clamp to timeline bounds
      nl = Math.max(0, nl);
      if (type === 'move' && nl + nw > totalW) nl = totalW - nw;
      if (type === 'resize-right' && nl + nw > totalW) nw = totalW - nl;

      barRef.current.style.left = `${nl}px`;
      barRef.current.style.width = `${nw}px`;
      dragRef.current.curLeft = nl;
      dragRef.current.curRight = nl + nw;
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);

      if (!dragRef.current) return;
      const { curLeft, curRight } = dragRef.current;
      dragRef.current = null;

      let newStart = snapDate(pxToDate(curLeft, dayWidth), zoomLevel);
      let newEnd = snapDate(pxToDate(curRight, dayWidth), zoomLevel);

      // Preserve exact duration on move
      if (type === 'move') {
        const durationMs = (endDate - startDate);
        newEnd = new Date(newStart.getTime() + durationMs);
      }

      if (newEnd <= newStart) newEnd = new Date(newStart.getTime() + 86400000);
      if (newStart < TIMELINE_START) newStart = new Date(TIMELINE_START);
      if (newEnd > TIMELINE_END) newEnd = new Date(TIMELINE_END);

      onUpdate(initiative.id, {
        startDate: formatDate(newStart),
        endDate: formatDate(newEnd),
        quarterOnly: false,
        quarter: null,
      });
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [initiative, dayWidth, zoomLevel, onUpdate, left, width, startDate, endDate]);

  const handleMouseEnter = () => {
    tooltipTimerRef.current = setTimeout(() => {
      if (barRef.current) setTooltipAnchor(barRef.current.getBoundingClientRect());
    }, 300);
  };

  const handleMouseLeave = () => {
    clearTimeout(tooltipTimerRef.current);
    setTooltipAnchor(null);
  };

  const handleClick = (e) => {
    if (dragRef.current) return;
    onSelect(initiative.id);
    e.stopPropagation();
  };

  return (
    <>
      <div
        ref={barRef}
        className={`initiative-bar${isFiltered ? ' is-filtered' : ''}${isSelected ? ' is-selected' : ''}`}
        style={{
          left: `${left}px`,
          width: `${width}px`,
          top: `${top}px`,
          height: `${BAR_HEIGHT}px`,
          borderLeft: `4px solid ${critColor}`,
          outline: isQuarterOnly ? `1.5px dashed ${critColor}` : (isSelected ? `2px solid ${critColor}` : 'none'),
          outlineOffset: isSelected ? '2px' : '-1px',
          background: isQuarterOnly ? 'rgba(255,255,255,0.85)' : 'white',
        }}
        onMouseDown={(e) => startDrag(e, 'move')}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title=""
      >
        {/* Left resize handle */}
        <div
          className="bar-handle bar-handle-left"
          onMouseDown={(e) => { e.stopPropagation(); startDrag(e, 'resize-left'); }}
        />

        <div className="bar-inner">
          <div className="bar-name">{initiative.name}</div>
          {width > 100 && (
            <div className="bar-desc">{initiative.description}</div>
          )}
        </div>

        {/* Criticality badge for wider bars */}
        {width > 140 && (
          <div
            className="bar-badge"
            style={{ background: critColor }}
          >
            {initiative.criticality}
          </div>
        )}

        {/* Right resize handle */}
        <div
          className="bar-handle bar-handle-right"
          onMouseDown={(e) => { e.stopPropagation(); startDrag(e, 'resize-right'); }}
        />
      </div>

      {tooltipAnchor && (
        <Tooltip initiative={initiative} anchorRect={tooltipAnchor} />
      )}
    </>
  );
}
