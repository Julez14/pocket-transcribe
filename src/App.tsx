import React, { useState, useEffect } from "react";
import { Mic, Headphones, ClipboardCheck } from "lucide-react";
import { useAudioRecorder } from "./hooks/useAudioRecorder";
import { useTranscription } from "./hooks/useTranscription";
import PermissionPrompt from "./components/PermissionPrompt";
import RecordingControls from "./components/RecordingControls";
import ProcessingView from "./components/ProcessingView";
import TranscriptionView from "./components/TranscriptionView";
import ErrorView from "./components/ErrorView";

// Application states
type AppState =
  | "landing"
  | "permission"
  | "recording"
  | "processing"
  | "result"
  | "error";

function App() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    state: recorderState,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    getAudioBlob,
    resetRecorder,
  } = useAudioRecorder();

  const {
    state: transcriptionState,
    startTranscription,
    updateTranscript,
    resetTranscription,
  } = useTranscription();

  // Check if user has already granted microphone permission
  useEffect(() => {
    if (appState === "landing") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => {
          // Permission already granted
        })
        .catch(() => {
          // Permission not yet granted or denied
        });
    }
  }, [appState]);

  const handleRequestPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionDenied(false);
      setAppState("recording");
      startRecording();
    } catch (error) {
      console.error("Microphone permission denied:", error);
      setPermissionDenied(true);
    }
  };

  const handleStartRecording = () => {
    setAppState("permission");
  };

  const handleStopRecording = async () => {
    console.log("Stopping recording...");
    setAppState("processing");
    console.log("App sate set to processing");

    try {
      // Wait for recording to be fully stopped and processed
      console.log("Calling stopRecording...");
      await stopRecording();
      console.log("Recording stopped successfully");

      const audioBlob = getAudioBlob();
      if (!audioBlob) {
        setError("No recording found. Please try again.");
        setAppState("error");
        return;
      }

      console.log("Audio recording ready for transcription:", audioBlob);
      await startTranscription(audioBlob);
      setAppState("result");
    } catch (error) {
      setError("Failed to transcribe audio. Please try again.");
      setAppState("error");
    }
  };

  const handleStartOver = () => {
    resetRecorder();
    resetTranscription();
    setAppState("landing");
  };

  const handleError = () => {
    resetRecorder();
    resetTranscription();
    setError(null);
    setAppState("landing");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-50 flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex items-center">
          <div className="flex items-center text-blue-600">
            <Mic className="w-6 h-6 mr-2" />
            <h1 className="text-xl font-bold">Pocket Transcribe</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          {appState === "landing" && (
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mic className="w-10 h-10 text-blue-600" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Pocket Transcribe
              </h1>
              <p className="text-gray-600 mb-6">
                Record and transcribe your meetings instantly. No sign-up
                required.
              </p>

              <div className="flex flex-col space-y-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-3">
                    <Mic className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-800">Record</h3>
                    <p className="text-sm text-gray-600">
                      Capture high-quality audio from your meetings
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-3">
                    <Headphones className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-800">Transcribe</h3>
                    <p className="text-sm text-gray-600">
                      Convert speech to text in minutes
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-3">
                    <ClipboardCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-800">Download</h3>
                    <p className="text-sm text-gray-600">
                      Save or share your transcript instantly
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartRecording}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Start Recording
              </button>

              <p className="mt-4 text-xs text-gray-500">
                Your privacy matters. All data stays on your device.
              </p>
            </div>
          )}

          {appState === "permission" && (
            <PermissionPrompt
              onRequestPermission={handleRequestPermission}
              permissionDenied={permissionDenied}
            />
          )}

          {appState === "recording" && (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <RecordingControls
                isRecording={recorderState.isRecording}
                isPaused={recorderState.isPaused}
                recordingTime={recorderState.recordingTime}
                onStartRecording={startRecording}
                onPauseRecording={pauseRecording}
                onResumeRecording={resumeRecording}
                onStopRecording={handleStopRecording}
              />
            </div>
          )}

          {appState === "processing" && (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <ProcessingView onCancel={handleStartOver} />
            </div>
          )}

          {appState === "result" && (
            <TranscriptionView
              transcript={transcriptionState.transcript}
              onUpdateTranscript={updateTranscript}
              onStartOver={handleStartOver}
            />
          )}

          {appState === "error" && (
            <ErrorView
              message={error || "Something went wrong. Please try again."}
              onRetry={handleError}
            />
          )}
        </div>
      </main>

      <footer className="bg-white p-4 text-center text-gray-500 text-xs">
        <p>
          &copy; {new Date().getFullYear()} Julian Laxman. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
