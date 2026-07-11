import Mp3Error from "../errors/Mp3Error.js";
import { countMp3Frames } from "../services/mp3FrameCounter.js";

const allowedMimeTypes = new Set([
  "audio/mpeg",
  "audio/mp3",
  "application/octet-stream",
]);

export async function processMp3Upload(file: MultipartFile) {
  if (!file) {
    throw new Mp3Error("No MP3 file provided", 400);
  }

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
    throw new Mp3Error("File must have a .mp3 extension", 400);
  }

  if (!allowedMimeTypes.has(mimetype)) {
    throw new Mp3Error("File must be an MP3", 400);
  }
}
