import React from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface PermissionPromptProps {
  onRequestPermission: () => void;
  permissionDenied: boolean;
}

const PermissionPrompt: React.FC<PermissionPromptProps> = ({ 
  onRequestPermission, 
  permissionDenied 
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto text-center">
      {permissionDenied ? (
        <>
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <MicOff className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Microphone Access Denied</h2>
          <p className="text-gray-600">
            Pocket Transcribe needs microphone access to record audio. Please update your browser settings to allow microphone access.
          </p>
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              You can update permissions by clicking the camera/microphone icon in your browser's address bar and selecting "Allow".
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
            <Mic className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Microphone Access Required</h2>
          <p className="text-gray-600">
            Pocket Transcribe needs permission to use your microphone to record audio for transcription.
          </p>
          <p className="text-sm text-gray-500">
            Your privacy is important to us. All audio and transcripts remain on your device and are never stored on any server.
          </p>
          <button
            onClick={onRequestPermission}
            className="mt-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Allow Microphone Access
          </button>
        </>
      )}
    </div>
  );
};

export default PermissionPrompt;