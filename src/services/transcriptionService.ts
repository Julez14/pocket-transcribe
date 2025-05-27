import axios from "axios";

// When deployed on Vercel this will hit /api/transcribe
const TRANSCRIPTION_SERVICE_URL = "/api/transcribe";

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    // For demo purposes - simulate transcription with a delay
    if (process.env.NODE_ENV === "development") {
      console.log("Simulating transcription in development..."); // Debug
      return new Promise((resolve) => {
        setTimeout(() => {
          const simulatedTranscript =
            "This is a simulated transcript of your recorded audio. In a production environment, this would be the actual transcribed text from your audio recording.";
          console.log("Simulated transcript:", simulatedTranscript); // Debug
          resolve(simulatedTranscript);
        }, 3000); // Simulate 3 second processing time
      });
    }

    console.log("Creating FormData for audio file..."); // Debug
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    console.log("Sending audio to transcription service..."); // Debug
    const response = await axios.post(TRANSCRIPTION_SERVICE_URL, formData, {
      timeout: 300_000, // 5 min
    });

    console.log("Received response from transcription service:", response.data); // Debug

    if (response.status !== 200) {
      throw new Error(`Transcription failed with status: ${response.status}`);
    }

    return response.data.transcript;
  } catch (error) {
    console.error("Error transcribing audio:", error); // Debug
    throw new Error("Failed to transcribe audio. Please try again.");
  }
}
