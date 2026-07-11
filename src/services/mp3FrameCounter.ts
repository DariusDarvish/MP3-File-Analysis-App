import { skipIdTag } from "../utils/skipIdTag.js";
import { isXingHeaderFrame } from "../utils/isXingHeaderFrame.js";
import { bitrateTable, sampleRateTable } from "./type.js";

export function countMp3Frames(buffer: Buffer): number {
  let offset = skipIdTag(buffer, 0);
  let frameCount = 0;

  while (offset + 4 <= buffer.length) {
    const b1 = buffer[offset];
    const b2 = buffer[offset + 1];
    const b3 = buffer[offset + 2];
    const b4 = buffer[offset + 3];

    // Check for MPEG frame sync (11 sync bits)
    if (b1 !== 0xff || (b2 & 0xe0) !== 0xe0) {
      offset++;
      continue;
    }

    // MPEG Version
    const version = (b2 >> 3) & 0x03;

    // Layer
    const layer = (b2 >> 1) & 0x03;

    // Only support MPEG Version 1 Layer III
    if (version !== 0b11 || layer !== 0b01) {
      offset++;
      continue;
    }

    // Extract bitrate/sample rate indexes
    const bitrateIndex = (b3 >> 4) & 0x0f;
    const sampleRateIndex = (b3 >> 2) & 0x03;

    if (bitrateIndex === 0 || bitrateIndex === 15 || sampleRateIndex === 3) {
      offset++;
      continue;
    }

    const bitrate = bitrateTable[bitrateIndex] * 1000;
    const sampleRate = sampleRateTable[sampleRateIndex];

    const padding = (b3 >> 1) & 1;
    const channelMode = (b4 >> 6) & 0b11;

    // MPEG-1 Layer III frame size
    const frameLength = Math.floor((144 * bitrate) / sampleRate) + padding;

    if (!isXingHeaderFrame(buffer, offset, frameLength, channelMode)) {
      frameCount++;
    }

    offset += frameLength;
  }

  return frameCount;
}
