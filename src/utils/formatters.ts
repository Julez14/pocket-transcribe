// Format milliseconds as MM:SS or HH:MM:SS
export function formatTime(ms: number): string {
  if (isNaN(ms)) return '00:00';
  
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Create a downloadable file from text
export function createDownloadableFile(text: string, filename: string): string {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  return url;
}

// Revoke a previously created URL to prevent memory leaks
export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url);
}