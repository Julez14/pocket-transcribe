import { useState, useCallback } from 'react';
import { TranscriptionState } from '../types/audio';
import { transcribeAudio } from '../services/transcriptionService';

export function useTranscription() {
  const [state, setState] = useState<TranscriptionState>({
    isTranscribing: false,
    transcript: '',
    error: null,
  });

  const startTranscription = useCallback(async (audioBlob: Blob) => {
    if (!audioBlob) {
      setState({
        isTranscribing: false,
        transcript: '',
        error: 'No audio recording found',
      });
      return;
    }

    setState({
      isTranscribing: true,
      transcript: '',
      error: null,
    });

    try {
      const transcript = await transcribeAudio(audioBlob);
      
      setState({
        isTranscribing: false,
        transcript,
        error: null,
      });
      
      return transcript;
    } catch (error) {
      console.error('Transcription error:', error);
      
      setState({
        isTranscribing: false,
        transcript: '',
        error: error instanceof Error ? error.message : 'Failed to transcribe audio',
      });
      
      return null;
    }
  }, []);

  const updateTranscript = useCallback((newTranscript: string) => {
    setState(prevState => ({
      ...prevState,
      transcript: newTranscript,
    }));
  }, []);

  const resetTranscription = useCallback(() => {
    setState({
      isTranscribing: false,
      transcript: '',
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