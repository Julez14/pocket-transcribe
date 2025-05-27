// api/transcribe.js
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
    // collect raw chunks
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    const buffer = Buffer.concat(chunks);
    const mimeType = req.headers["content-type"] || "audio/webm";

    const dg = createClient(process.env.DEEPGRAM_API_KEY);
    const { result, error } = await dg.listen.prerecorded.transcribeFile(
      buffer,
      {
        model: "nova-3",
        punctuate: true,
        smart_format: true,
      }
    );

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Transcription failed." });
    }

    const transcript = result.results.channels[0].alternatives[0].transcript;
    return res.status(200).json({ transcript });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Transcription failed." });
  }
}
