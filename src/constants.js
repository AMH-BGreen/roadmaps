export const PRODUCT_AREAS = ['4Rent', '4Services', '4Resident', '4Platform'];

export const CRITICALITY_OPTIONS = ['Critical', 'High', 'Medium', 'Low'];
export const STATUS_OPTIONS = ['Discovery', 'In Progress', 'On Hold', 'Complete', 'Cancelled'];
export const CONFIDENCE_OPTIONS = ['Confirmed', 'Estimated', 'TBD'];

export const CRITICALITY_COLORS = {
  Critical: '#DD1C23',
  High: '#004879',
  Medium: '#1967D2',
  Low: '#9E9E9E',
};

export const STATUS_COLORS = {
  Discovery: '#7B61FF',
  'In Progress': '#004879',
  'On Hold': '#F5A623',
  Complete: '#1E7D4A',
  Cancelled: '#9E9E9E',
};

export const BRAND = {
  heritageBlue: '#004879',
  heritageRed: '#DD1C23',
  skyBlue: '#1967D2',
  darkBlue: '#041624',
  bgGray: '#F5F5F5',
};

// Timeline geometry
export const LABEL_WIDTH = 220;
export const BAR_HEIGHT = 36;
export const BAR_GAP = 10;
export const LANE_HEIGHT = BAR_HEIGHT + BAR_GAP;
export const SWIMLANE_V_PAD = 14;
export const SWIMLANE_HEADER_HEIGHT = 44;
export const HEADER_HEIGHT = 84; // 3 rows × 28px

// Zoom levels: pixels per day
export const DAY_WIDTHS = {
  quarter: 4,
  month: 10,
  week: 22,
};

// Timeline date range
export const TIMELINE_START = new Date('2024-01-01');
export const TIMELINE_END = new Date('2026-12-31');
