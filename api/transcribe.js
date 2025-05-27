// api/transcribe.js
import { createClient } from "@deepgram/sdk";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // we’ll use formidable
  },
};

export default async function handler(req, res) {
  console.log("Received request with method:", req.method); // Debug

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    console.log("Method not allowed:", req.method); // Debug
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const deepgramKey = process.env.DEEPGRAM_API_KEY;
  if (!deepgramKey) {
    console.error("Deepgram API key not configured."); // Debug
    return res.status(500).json({ error: "Deepgram API key not configured." });
  }
  console.log("Deepgram API key is available."); // Debug

  const dgClient = createClient(deepgramKey);

  const form = new formidable.IncomingForm();
  console.log("Parsing form data..."); // Debug
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err); // Debug
      return res.status(400).json({ error: "Invalid form data." });
    }

    console.log("Form fields:", fields); // Debug
    console.log("Form files:", files); // Debug

    const audioFile = files.audio;
    if (!audioFile) {
      console.error("No audio file provided."); // Debug
      return res.status(400).json({ error: "No audio file provided." });
    }

    try {
      console.log("Reading uploaded file from:", audioFile.filepath); // Debug
      const buffer = await fs.promises.readFile(audioFile.filepath);

      console.log("Sending file to Deepgram for transcription..."); // Debug
      const dgRes = await dgClient.transcription.preRecorded(
        { buffer, mimetype: audioFile.mimetype },
        {
          model: "nova-3",
          punctuate: true,
          smart_format: true,
        }
      );

      const transcript =
        dgRes.results.channels[0].alternatives[0].transcript || "";

      console.log("Transcription successful. Transcript:", transcript); // Debug

      return res.status(200).json({ transcript });
    } catch (dgErr) {
      console.error("Deepgram error:", dgErr); // Debug
      return res.status(500).json({ error: "Transcription failed." });
    }
  });
}
