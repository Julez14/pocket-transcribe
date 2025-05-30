import axios from "axios";

const TRANSCRIPTION_SERVICE_URL = "/api/transcribe";

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    // For demo purposes - simulate transcription with a delay
    // if (process.env.NODE_ENV === "development") {
    //   console.log("Simulating transcription in development...");
    //   return new Promise((resolve) => {
    //     setTimeout(() => {
    //       const simulatedTranscript =
    //         "This is a simulated transcript of your recorded audio. In a production environment, this would be the actual transcribed text from your audio recording.";
    //       console.log("Simulated transcript:", simulatedTranscript);
    //       resolve(simulatedTranscript);
    //     }, 3000);
    //   });
    // }

    console.log("Converting audio blob to array buffer...");

    // Convert blob to array buffer
    const arrayBuffer = await audioBlob.arrayBuffer();

    console.log("Sending audio to transcription service...");

    // Send raw audio data with proper headers
    const response = await axios.post(TRANSCRIPTION_SERVICE_URL, arrayBuffer, {
      timeout: 300_000, // 5 min
      headers: {
        "Content-Type": audioBlob.type || "audio/webm",
        "Content-Length": arrayBuffer.byteLength.toString(),
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
