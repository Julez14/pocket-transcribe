import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingViewProps {
  onCancel: () => void;
}

const ProcessingView: React.FC<ProcessingViewProps> = ({ onCancel }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6">
      <div className="flex items-center justify-center space-x-2">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-xl font-semibold text-gray-800">Transcribing...</span>
      </div>
      
      <p className="text-center text-gray-600 max-w-sm">
        Converting your audio to text. This may take a few minutes for longer recordings.
      </p>
      
      <button
        onClick={onCancel}
        className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        Cancel
      </button>
    </div>
  );
};

export default ProcessingView;