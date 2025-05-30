import { createClient } from "@deepgram/sdk";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end();
  }

  try {
    console.log("Receiving audio data...");

    // Collect raw chunks from the request stream
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }

    const buffer = Buffer.concat(chunks);
    console.log("Audio buffer size:", buffer.length);

    if (buffer.length === 0) {
      return res.status(400).json({ error: "No audio data received" });
    }

    const mimeType = req.headers["content-type"] || "audio/webm";
    console.log("Processing audio with mime type:", mimeType);

    // Initialize Deepgram client
    const dg = createClient(process.env.DEEPGRAM_API_KEY);

    // Transcribe the audio
    const { result, error } = await dg.listen.prerecorded.transcribeFile(
      buffer,
      {
        model: "nova-3", // Using nova-3 as requested
        punctuate: true,
        smart_format: true,
        mimetype: mimeType,
      }
    );

    if (error) {
      console.error("Deepgram error:", error);
      return res
        .status(500)
        .json({ error: "Transcription failed: " + error.message });
    }

    if (!result.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
      console.error("No transcript in result:", result);
      return res
        .status(500)
        .json({ error: "No transcript generated from audio" });
    }

    const transcript = result.results.channels[0].alternatives[0].transcript;
    console.log("Transcription successful, length:", transcript.length);

    return res.status(200).json({ transcript });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({
      error: "Transcription failed: " + (err.message || "Unknown error"),
    });
  }
}
