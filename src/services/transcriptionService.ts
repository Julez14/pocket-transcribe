import axios from "axios";

// When deployed on Vercel this will hit /api/transcribe
const TRANSCRIPTION_SERVICE_URL = "/api/transcribe";

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    // For demo purposes - simulate transcription with a delay
    // In a real implementation, you would send the audio to your proxy endpoint

    if (process.env.NODE_ENV === "development") {
      // Simulate transcription in development
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(
            "This is a simulated transcript of your recorded audio. In a production environment, this would be the actual transcribed text from your audio recording."
          );
        }, 3000); // Simulate 3 second processing time
      });
    }

    // Create a FormData object to send the audio file
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    // Send the audio to the transcription service
    const response = await axios.post(TRANSCRIPTION_SERVICE_URL, formData, {
      timeout: 300_000, // 5 min
    });

    if (response.status !== 200) {
      throw new Error(`Transcription failed with status: ${response.status}`);
    }

    return response.data.transcript;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Failed to transcribe audio. Please try again.");
  }
}
