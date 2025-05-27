export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  hasRecording: boolean;
}

export interface TranscriptionState {
  isTranscribing: boolean;
  transcript: string;
  error: string | null;
}

export interface RecordingSegment {
  blob: Blob;
  startTime: number;
  endTime: number;
}