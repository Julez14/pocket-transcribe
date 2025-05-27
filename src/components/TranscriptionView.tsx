import React, { useState, useRef } from 'react';
import { Download, Share2, Pencil, Save, Copy, RotateCcw } from 'lucide-react';
import { createDownloadableFile, revokeObjectURL } from '../utils/formatters';

interface TranscriptionViewProps {
  transcript: string;
  onUpdateTranscript: (newTranscript: string) => void;
  onStartOver: () => void;
}

const TranscriptionView: React.FC<TranscriptionViewProps> = ({
  transcript,
  onUpdateTranscript,
  onStartOver,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(transcript);
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDownload = () => {
    const filename = `transcript-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    const url = createDownloadableFile(isEditing ? editedText : transcript, filename);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    setTimeout(() => {
      revokeObjectURL(url);
    }, 100);
  };

  const handleShare = async () => {
    const text = isEditing ? editedText : transcript;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Meeting Transcript',
          text: text,
        });
      } else {
        // Fallback if Web Share API is not available
        handleCopyToClipboard();
      }
    } catch (error) {
      console.error('Error sharing transcript:', error);
    }
  };

  const handleCopyToClipboard = async () => {
    const text = isEditing ? editedText : transcript;
    
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleSave = () => {
    onUpdateTranscript(editedText);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Your Transcript</h2>
          <div className="flex space-x-2">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex items-center p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                aria-label="Save edits"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </button>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                aria-label="Edit transcript"
              >
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </button>
            )}
          </div>
        </div>
        
        <div className="p-4">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
              placeholder="Your transcript text..."
            />
          ) : (
            <div className="min-h-[200px] p-3 bg-gray-50 rounded-md text-gray-800 whitespace-pre-wrap">
              {transcript}
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap p-4 gap-2 border-t bg-gray-50">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {navigator.share ? 'Share' : 'Copy'}
          </button>
          
          <button
            onClick={handleCopyToClipboard}
            className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <Copy className="w-4 h-4" />
            {isCopied ? 'Copied!' : 'Copy Text'}
          </button>
        </div>
      </div>
      
      <button
        onClick={onStartOver}
        className="flex items-center justify-center gap-1 mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors mx-auto"
      >
        <RotateCcw className="w-4 h-4" />
        Record Another
      </button>
      
      <p className="text-xs text-gray-500 text-center mt-4">
        Your audio and transcript data are only stored in your browser's memory and will be deleted when you close or refresh this page.
      </p>
    </div>
  );
};

export default TranscriptionView;