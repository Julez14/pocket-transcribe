import { useState, useRef, useCallback, useEffect } from "react";
import { AudioRecorderState, RecordingSegment } from "../types/audio";

// Maximum recording time in milliseconds (60 minutes)
const MAX_RECORDING_TIME = 60 * 60 * 1000;
// Segment duration in milliseconds (10 seconds)
const SEGMENT_DURATION = 10 * 1000;

export function useAudioRecorder() {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    recordingTime: 0,
    hasRecording: false,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const segmentsRef = useRef<RecordingSegment[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const segmentStartTimeRef = useRef<number>(0);
  const currentSegmentDurationRef = useRef<number>(0);
  const stopPromiseResolveRef = useRef<(() => void) | null>(null);

  // Clean up function to stop recording and release resources
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    mediaRecorderRef.current = null;
  }, []);

  // Update timer during recording
  const updateTimer = useCallback(() => {
    if (!state.isRecording || state.isPaused) return;

    const currentTime = Date.now();
    const elapsedTime =
      currentTime - startTimeRef.current - pausedTimeRef.current;

    setState((prevState) => ({
      ...prevState,
      recordingTime: elapsedTime,
    }));

    // Update current segment duration
    currentSegmentDurationRef.current =
      currentTime - segmentStartTimeRef.current;

    // Check if we need to start a new segment
    if (
      currentSegmentDurationRef.current >= SEGMENT_DURATION &&
      mediaRecorderRef.current
    ) {
      mediaRecorderRef.current.stop();
    }

    // Warn user when approaching maximum recording time
    if (elapsedTime >= MAX_RECORDING_TIME * 0.9) {
      console.warn("Approaching maximum recording time limit");
    }
  }, [state.isRecording, state.isPaused]);

  // Start the recording process
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      chunksRef.current = [];
      segmentsRef.current = [];
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      segmentStartTimeRef.current = Date.now();
      currentSegmentDurationRef.current = 0;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          const currentTime = Date.now();
          const segment: RecordingSegment = {
            blob: new Blob(chunksRef.current, { type: "audio/webm" }),
            startTime: segmentStartTimeRef.current - startTimeRef.current,
            endTime: currentTime - startTimeRef.current,
          };
          segmentsRef.current.push(segment);
          chunksRef.current = [];

          // Check if we're stopping the recording completely
          if (stopPromiseResolveRef.current) {
            cleanup();
            setState((prevState) => ({
              ...prevState,
              isRecording: false,
              isPaused: false,
              hasRecording: true,
            }));
            stopPromiseResolveRef.current();
            stopPromiseResolveRef.current = null;
            return;
          }

          // Only start a new segment if we're still actively recording
          if (
            state.isRecording &&
            !state.isPaused &&
            mediaRecorderRef.current
          ) {
            segmentStartTimeRef.current = currentTime;
            mediaRecorderRef.current.start();
          }
        }
      };

      mediaRecorder.start();

      setState({
        isRecording: true,
        isPaused: false,
        recordingTime: 0,
        hasRecording: false,
      });

      timerRef.current = window.setInterval(updateTimer, 100);
    } catch (error) {
      console.error("Error starting recording:", error);
      setState((prevState) => ({
        ...prevState,
        error:
          "Failed to start recording. Please check microphone permissions.",
      }));
    }
  }, [updateTimer, state.isRecording, state.isPaused]);

  // Pause the recording
  const pauseRecording = useCallback(() => {
    if (!state.isRecording || state.isPaused) return;

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }

    setState((prevState) => ({
      ...prevState,
      isPaused: true,
    }));

    pausedTimeRef.current -= Date.now();
  }, [state.isRecording, state.isPaused]);

  // Resume the recording
  const resumeRecording = useCallback(() => {
    if (!state.isRecording || !state.isPaused) return;

    pausedTimeRef.current += Date.now();
    segmentStartTimeRef.current = Date.now();

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.start();
    }

    setState((prevState) => ({
      ...prevState,
      isPaused: false,
    }));
  }, [state.isRecording, state.isPaused]);

  // Stop the recording and finalize - now returns a Promise
  const stopRecording = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (!state.isRecording) {
        resolve();
        return;
      }

      // Store the resolve function to be called when recording is fully stopped
      stopPromiseResolveRef.current = resolve;

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.requestData(); // Request any remaining data
        mediaRecorderRef.current.stop();
      } else {
        // If not currently recording, resolve immediately
        cleanup();
        setState((prevState) => ({
          ...prevState,
          isRecording: false,
          isPaused: false,
          hasRecording: true,
        }));
        stopPromiseResolveRef.current = null;
        resolve();
      }
    });
  }, [state.isRecording, cleanup]);

  // Get the final combined audio blob
  const getAudioBlob = useCallback((): Blob | null => {
    if (segmentsRef.current.length === 0) return null;

    // Combine all segment blobs
    const blobs = segmentsRef.current.map((segment) => segment.blob);
    return new Blob(blobs, { type: "audio/webm" });
  }, []);

  // Reset the recorder state
  const resetRecorder = useCallback(() => {
    cleanup();
    chunksRef.current = [];
    segmentsRef.current = [];
    stopPromiseResolveRef.current = null;

    setState({
      isRecording: false,
      isPaused: false,
      recordingTime: 0,
      hasRecording: false,
    });
  }, [cleanup]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    state,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    getAudioBlob,
    resetRecorder,
  };
}
