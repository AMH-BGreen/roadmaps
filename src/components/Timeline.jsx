import { useMemo, useRef, useEffect } from 'react';
import { PRODUCT_AREAS, DAY_WIDTHS, LABEL_WIDTH, HEADER_HEIGHT } from '../constants.js';
import { getTotalWidth, dateToPx } from '../utils/timeline.js';
import TimelineHeader from './TimelineHeader.jsx';
import Swimlane from './Swimlane.jsx';

export default function Timeline({
  initiatives, dayWidth, zoomLevel, filters,
  collapsedAreas, onToggleCollapse,
  selectedId, onSelect, onUpdate,
}) {
  const scrollRef = useRef(null);
  const totalWidth = getTotalWidth(dayWidth);

  // Scroll to today on mount
  useEffect(() => {
    if (!scrollRef.current) return;
    const todayX = dateToPx(new Date(), dayWidth);
    const viewportW = scrollRef.current.clientWidth - LABEL_WIDTH;
    const scrollTo = Math.max(0, todayX - viewportW / 3);
    scrollRef.current.scrollLeft = scrollTo;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byArea = useMemo(() => {
    const map = {};
    PRODUCT_AREAS.forEach(a => { map[a] = []; });
    initiatives.forEach(i => { if (map[i.area]) map[i.area].push(i); });
    return map;
  }, [initiatives]);

  return (
    <div
      ref={scrollRef}
      className="timeline-scroll"
      onClick={() => onSelect(null)}
    >
      {/* This inner div sets the total scrollable width */}
      <div style={{ minWidth: LABEL_WIDTH + totalWidth, display: 'flex', flexDirection: 'column' }}>
        {/* Sticky header */}
        <TimelineHeader dayWidth={dayWidth} zoomLevel={zoomLevel} />

        {/* Swimlanes */}
        {PRODUCT_AREAS.map(area => (
          <Swimlane
            key={area}
            area={area}
            initiatives={byArea[area]}
            dayWidth={dayWidth}
            zoomLevel={zoomLevel}
            filters={filters}
            isCollapsed={!!collapsedAreas[area]}
            onToggleCollapse={() => onToggleCollapse(area)}
            selectedId={selectedId}
            onSelect={onSelect}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}
