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
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const deepgramKey = process.env.DEEPGRAM_API_KEY;
  if (!deepgramKey) {
    return res.status(500).json({ error: "Deepgram API key not configured." });
  }

  const dgClient = createClient(deepgramKey);

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(400).json({ error: "Invalid form data." });
    }

    const audioFile = files.audio;
    if (!audioFile) {
      return res.status(400).json({ error: "No audio file provided." });
    }

    try {
      // read the uploaded temp file into a buffer
      const buffer = await fs.promises.readFile(audioFile.filepath);

      // send to Deepgram
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

      return res.status(200).json({ transcript });
    } catch (dgErr) {
      console.error("Deepgram error:", dgErr);
      return res.status(500).json({ error: "Transcription failed." });
    }
  });
}
