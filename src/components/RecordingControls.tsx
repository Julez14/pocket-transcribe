import React from 'react';
import { Mic, Pause, Play, Square, Loader2 } from 'lucide-react';
import { formatTime } from '../utils/formatters';

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  onStartRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onStopRecording: () => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  isPaused,
  recordingTime,
  onStartRecording,
  onPauseRecording,
  onResumeRecording,
  onStopRecording,
}) => {
  return (
    <div className="flex flex-col items-center space-y-6">
      {isRecording && (
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">
            {formatTime(recordingTime)}
          </div>
          <div className="flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isPaused ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`}></div>
            <span className="text-sm font-medium">
              {isPaused ? 'Recording Paused' : 'Recording in Progress'}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center space-x-4">
        {!isRecording ? (
          <button
            onClick={onStartRecording}
            className="flex items-center justify-center w-16 h-16 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            aria-label="Start Recording"
          >
            <Mic className="w-6 h-6" />
          </button>
        ) : (
          <>
            {isPaused ? (
              <button
                onClick={onResumeRecording}
                className="flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                aria-label="Resume Recording"
              >
                <Play className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={onPauseRecording}
                className="flex items-center justify-center w-14 h-14 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
                aria-label="Pause Recording"
              >
                <Pause className="w-6 h-6" />
              </button>
            )}

            <button
              onClick={onStopRecording}
              className="flex items-center justify-center w-14 h-14 bg-gray-700 text-white rounded-full hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              aria-label="Stop Recording"
            >
              <Square className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {!isRecording && (
        <p className="text-sm text-gray-500 max-w-xs text-center">
          Tap the microphone button to start recording your meeting. All data remains on your device.
        </p>
      )}
    </div>
  );
};

export default RecordingControls;