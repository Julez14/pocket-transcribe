import { useState, useCallback } from "react";
import { TranscriptionState } from "../types/audio";
import { transcribeAudio } from "../services/transcriptionService";

export function useTranscription() {
  const [state, setState] = useState<TranscriptionState>({
    isTranscribing: false,
    transcript: "",
    error: null,
  });

  const startTranscription = useCallback(async (audioBlob: Blob) => {
    if (!audioBlob) {
      console.error("No audio recording found."); // Debug
      setState({
        isTranscribing: false,
        transcript: "",
        error: "No audio recording found",
      });
      return;
    }

    console.log("Starting transcription..."); // Debug
    setState({
      isTranscribing: true,
      transcript: "",
      error: null,
    });

    try {
      const transcript = await transcribeAudio(audioBlob);
      console.log("Transcription received:", transcript); // Debug

      setState({
        isTranscribing: false,
        transcript,
        error: null,
      });

      return transcript;
    } catch (error) {
      console.error("Transcription error:", error); // Debug

      setState({
        isTranscribing: false,
        transcript: "",
        error:
          error instanceof Error ? error.message : "Failed to transcribe audio",
      });

      return null;
    }
  }, []);

  const updateTranscript = useCallback((newTranscript: string) => {
    console.log("Updating transcript to:", newTranscript); // Debug
    setState((prevState) => ({
      ...prevState,
      transcript: newTranscript,
    }));
  }, []);

  const resetTranscription = useCallback(() => {
    console.log("Resetting transcription state."); // Debug
    setState({
      isTranscribing: false,
      transcript: "",
      error: null,
    });
  }, []);

  return {
    state,
    startTranscription,
    updateTranscript,
    resetTranscription,
  };
}
