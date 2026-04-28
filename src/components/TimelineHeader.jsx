import { useMemo } from 'react';
import { buildHeaders, dateToPx, getTotalWidth } from '../utils/timeline.js';
import { LABEL_WIDTH, HEADER_HEIGHT, BRAND } from '../constants.js';

const ROW_H = 28;

function HeaderSegment({ label, start, end, dayWidth, row, borderRight = true, bold = false }) {
  const left = dateToPx(start, dayWidth);
  const right = dateToPx(end, dayWidth);
  const width = right - left;
  if (width < 2) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left,
        width,
        top: row * ROW_H,
        height: ROW_H,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 6,
        fontSize: bold ? 11 : 10,
        fontWeight: bold ? 700 : 500,
        color: bold ? '#fff' : 'rgba(255,255,255,0.75)',
        borderRight: borderRight ? '1px solid rgba(255,255,255,0.12)' : 'none',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        letterSpacing: bold ? '0.04em' : '0.02em',
        textTransform: bold ? 'uppercase' : 'none',
      }}
    >
      {width > 20 ? label : ''}
    </div>
  );
}

export default function TimelineHeader({ dayWidth, zoomLevel }) {
  const { years, quarters, months } = useMemo(() => buildHeaders(), []);
  const totalWidth = getTotalWidth(dayWidth);

  // Today indicator
  const todayX = dateToPx(new Date(), dayWidth);
  const showToday = todayX >= 0 && todayX <= totalWidth;

  return (
    <div
      className="timeline-header"
      style={{ height: HEADER_HEIGHT }}
    >
      {/* Corner cell */}
      <div
        className="header-corner"
        style={{ width: LABEL_WIDTH, background: BRAND.darkBlue, borderRight: '1px solid rgba(255,255,255,0.15)' }}
      >
        <span style={{ color: 'white', fontWeight: 700, fontSize: 13, paddingLeft: 16 }}>Product Area</span>
      </div>

      {/* Date grid */}
      <div
        className="header-dates"
        style={{ width: totalWidth, position: 'relative' }}
      >
        {/* Row 0: Years */}
        {years.map((seg, i) => (
          <HeaderSegment key={i} {...seg} dayWidth={dayWidth} row={0} bold />
        ))}

        {/* Row 1: Quarters */}
        {quarters.map((seg, i) => (
          <HeaderSegment key={i} label={seg.label} start={seg.start} end={seg.end} dayWidth={dayWidth} row={1} />
        ))}

        {/* Row 2: Months (hidden in quarter view) */}
        {zoomLevel !== 'quarter' && months.map((seg, i) => (
          <HeaderSegment key={i} {...seg} dayWidth={dayWidth} row={2} />
        ))}

        {/* Today line */}
        {showToday && (
          <div
            style={{
              position: 'absolute',
              left: todayX,
              top: 0,
              width: 2,
              height: HEADER_HEIGHT,
              background: '#DD1C23',
              opacity: 0.8,
              zIndex: 5,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
}
