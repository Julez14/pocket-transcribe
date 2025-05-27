import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorViewProps {
  message: string;
  onRetry: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6 max-w-md mx-auto">
      <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      
      <h2 className="text-xl font-semibold text-gray-800 text-center">Something went wrong</h2>
      
      <p className="text-gray-600 text-center">
        {message || 'There was an error processing your request. Please try again.'}
      </p>
      
      <button
        onClick={onRetry}
        className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorView;