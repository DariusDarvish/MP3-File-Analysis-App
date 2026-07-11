import { MultipartFile } from "@fastify/multipart";
import Mp3Error from "../errors/Mp3Error.js";
import { countMp3Frames } from "../services/mp3FrameCounter.js";

const allowedMimeTypes = new Set([
  "audio/mpeg",
  "audio/mp3",
  "application/octet-stream",
]);

export async function processMp3Upload(file: MultipartFile) {
  validateMp3Upload(file.filename, file.mimetype);

  const buffer = await file.toBuffer();

  if (buffer.length === 0) {
    throw new Mp3Error("File is empty", 400);
  }

  const frameCount = countMp3Frames(buffer);

  if (frameCount === 0) {
    throw new Mp3Error("File does not contain valid MP3 frames", 422);
  }

  return frameCount;
}

function validateMp3Upload(filename: string, mimetype: string) {
  if (!filename.toLowerCase().endsWith(".mp3")) {
    throw new Mp3Error(
      "Invalid upload: please provide an .mp3 file with a valid filename.",
      400,
    );
  }

  if (!allowedMimeTypes.has(mimetype)) {
    throw new Mp3Error(
      "Invalid upload: the file must be an MP3 audio file.",
      400,
    );
  }
}
