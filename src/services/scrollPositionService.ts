const STORAGE_KEY = 'pdf-reader-scroll-positions';
const MAX_STORED_DOCUMENTS = 50;

interface ScrollPosition {
  page: number;
  scrollY: number;
  zoom: number;
  timestamp: number;
}

interface StoredPositions {
  [filePath: string]: ScrollPosition;
}

function getStoredPositions(): StoredPositions {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setStoredPositions(positions: StoredPositions): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    console.warn('Failed to save scroll positions to localStorage');
  }
}

function pruneOldEntries(positions: StoredPositions): StoredPositions {
  const entries = Object.entries(positions);
  if (entries.length <= MAX_STORED_DOCUMENTS) {
    return positions;
  }

  entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
  const pruned = entries.slice(0, MAX_STORED_DOCUMENTS);
  return Object.fromEntries(pruned);
}

export function saveScrollPosition(
  filePath: string,
  page: number,
  scrollY: number,
  zoom: number
): void {
  const positions = getStoredPositions();

  positions[filePath] = {
    page,
    scrollY,
    zoom,
    timestamp: Date.now(),
  };

  const pruned = pruneOldEntries(positions);
  setStoredPositions(pruned);
}

export function getScrollPosition(filePath: string): ScrollPosition | null {
  const positions = getStoredPositions();
  return positions[filePath] || null;
}

export function clearScrollPosition(filePath: string): void {
  const positions = getStoredPositions();
  delete positions[filePath];
  setStoredPositions(positions);
}

export function clearAllScrollPositions(): void {
  localStorage.removeItem(STORAGE_KEY);
}
