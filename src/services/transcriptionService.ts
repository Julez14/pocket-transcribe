import axios from "axios";

const TRANSCRIPTION_SERVICE_URL = "/api/transcribe";

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    // For demo purposes - simulate transcription with a delay
    if (process.env.NODE_ENV === "development") {
      console.log("Simulating transcription in development...");
      return new Promise((resolve) => {
        setTimeout(() => {
          const simulatedTranscript =
            "This is a simulated transcript of your recorded audio. In a production environment, this would be the actual transcribed text from your audio recording.";
          console.log("Simulated transcript:", simulatedTranscript);
          resolve(simulatedTranscript);
        }, 3000);
      });
    }

    console.log("Converting audio blob to array buffer...");

    // Convert blob to array buffer
    const arrayBuffer = await audioBlob.arrayBuffer();

    // Convert to Uint8Array (ArrayBufferView) instead of raw ArrayBuffer
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log("Sending audio to transcription service...");

    // Send audio data with proper headers (removed Content-Length)
    const response = await axios.post(TRANSCRIPTION_SERVICE_URL, uint8Array, {
      timeout: 300_000, // 5 min
      headers: {
        "Content-Type": audioBlob.type || "audio/webm",
        // Removed Content-Length - browser handles this automatically
      },
    });

    console.log("Received response from transcription service:", response.data);

    if (response.status !== 200) {
      throw new Error(`Transcription failed with status: ${response.status}`);
    }

    return response.data.transcript;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Failed to transcribe audio. Please try again.");
  }
}
