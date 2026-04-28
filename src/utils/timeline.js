import { TIMELINE_START, TIMELINE_END, DAY_WIDTHS } from '../constants.js';

export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const QUARTER_MONTHS = { Q1: [0, 2], Q2: [3, 5], Q3: [6, 8], Q4: [9, 11] };

export function getInitiativeStartDate(initiative) {
  if (initiative.startDate) return new Date(initiative.startDate);
  if (initiative.quarter) {
    const [q, year] = initiative.quarter.split(' ');
    const startMonth = QUARTER_MONTHS[q][0];
    return new Date(parseInt(year), startMonth, 1);
  }
  return new Date(TIMELINE_START);
}

export function getInitiativeEndDate(initiative) {
  if (initiative.endDate) return new Date(initiative.endDate);
  if (initiative.quarter) {
    const [q, year] = initiative.quarter.split(' ');
    const endMonth = QUARTER_MONTHS[q][1];
    // Last day of end month
    return new Date(parseInt(year), endMonth + 1, 0);
  }
  return new Date(TIMELINE_END);
}

export function dateToPx(date, dayWidth) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffMs = d - TIMELINE_START;
  const diffDays = diffMs / 86400000;
  return diffDays * dayWidth;
}

export function pxToDate(px, dayWidth) {
  const days = px / dayWidth;
  return new Date(TIMELINE_START.getTime() + days * 86400000);
}

export function snapDate(date, zoomLevel) {
  const d = new Date(date);
  if (zoomLevel === 'quarter') {
    // Snap to nearest month start
    if (d.getDate() <= 15) {
      d.setDate(1);
    } else {
      if (d.getMonth() === 11) {
        d.setFullYear(d.getFullYear() + 1, 0, 1);
      } else {
        d.setMonth(d.getMonth() + 1, 1);
      }
    }
  } else if (zoomLevel === 'month') {
    // Snap to nearest Monday
    const dow = d.getDay(); // 0=Sun
    const daysBack = dow === 0 ? 6 : dow - 1;
    const daysFwd = 7 - daysBack;
    if (daysBack <= daysFwd) {
      d.setDate(d.getDate() - daysBack);
    } else {
      d.setDate(d.getDate() + daysFwd);
    }
  }
  // week view: day precision, no snap
  return d;
}

export function getTotalWidth(dayWidth) {
  const days = (TIMELINE_END - TIMELINE_START) / 86400000;
  return days * dayWidth;
}

// Build header segments for the timeline
export function buildHeaders() {
  const years = [];
  const quarters = [];
  const months = [];

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  for (let year = 2024; year <= 2026; year++) {
    years.push({
      label: String(year),
      start: new Date(year, 0, 1),
      end: new Date(year + 1, 0, 1),
    });

    for (let q = 0; q < 4; q++) {
      quarters.push({
        label: `Q${q + 1}`,
        fullLabel: `Q${q + 1} ${year}`,
        start: new Date(year, q * 3, 1),
        end: new Date(year, q * 3 + 3, 1),
      });
    }

    for (let m = 0; m < 12; m++) {
      months.push({
        label: MONTH_NAMES[m],
        start: new Date(year, m, 1),
        end: new Date(year, m + 1, 1),
      });
    }
  }

  return { years, quarters, months };
}

// Assign bars to horizontal lanes so none overlap within a swimlane
export function assignLanes(initiatives) {
  if (!initiatives.length) return [];
  const sorted = [...initiatives].sort(
    (a, b) => getInitiativeStartDate(a) - getInitiativeStartDate(b)
  );
  const laneEnds = []; // end date of last bar assigned to each lane

  return sorted.map(initiative => {
    const start = getInitiativeStartDate(initiative);
    const end = getInitiativeEndDate(initiative);
    let laneIndex = laneEnds.findIndex(laneEnd => laneEnd <= start);
    if (laneIndex === -1) {
      laneIndex = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[laneIndex] = end;
    }
    return { ...initiative, _lane: laneIndex };
  });
}

export function swimlaneContentHeight(initiatives) {
  if (!initiatives.length) return 60;
  const maxLane = Math.max(...initiatives.map(i => i._lane ?? 0));
  return 14 + (maxLane + 1) * (36 + 10) - 10 + 14; // SWIMLANE_V_PAD + lanes * LANE_HEIGHT + SWIMLANE_V_PAD
}

// Phase 2 stubs — Jira integration placeholders
// eslint-disable-next-line no-unused-vars
export async function fetchJiraInitiatives(_projectKey) {
  // TODO Phase 2: Pull initiatives from Jira API by label or project key
  // GET /rest/api/3/search?jql=project={_projectKey}+AND+issuetype=Epic
  throw new Error('Jira integration not yet implemented');
}

// eslint-disable-next-line no-unused-vars
export async function pushInitiativeToJira(_initiative) {
  // TODO Phase 2: Create or update a Jira epic from roadmap initiative data
  // POST/PUT /rest/api/3/issue with mapped fields
  throw new Error('Jira integration not yet implemented');
}

// eslint-disable-next-line no-unused-vars
export async function linkEpicsToInitiative(_initiativeId, _epicKeys) {
  // TODO Phase 2: Attach Jira epics to a roadmap initiative record
  // POST /rest/api/3/issueLink for each epic key
  throw new Error('Jira integration not yet implemented');
}
