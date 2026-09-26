export function formatOperationalTime(seconds: number): string {
  if (seconds < 0) return 'T-00:00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hrs > 0) {
    return `T+${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `T+${pad(mins)}:${pad(secs)}`;
}

export function parseOperationalTimeToSeconds(formatted: string): number {
  const clean = formatted.replace('T+', '').replace('T-', '');
  const parts = clean.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}
