import { skipIdTag } from "../utils/skipIdTag.js";
import { isXingHeaderFrame } from "../utils/isXingHeaderFrame.js";
import { bitrateTable, sampleRateTable } from "./type.js";

const MPEG_SYNC_BYTE = 0xff;
const MPEG_SYNC_MASK = 0xe0;

const MPEG_VERSION_1 = 0b11;
const MPEG_LAYER_III = 0b01;

const MPEG_VERSION_MASK = 0b11;
const MPEG_LAYER_MASK = 0b11;

const BITRATE_INDEX_MASK = 0x0f;
const SAMPLE_RATE_INDEX_MASK = 0x03;
const PADDING_MASK = 0x01;
const CHANNEL_MODE_MASK = 0x03;

const MPEG1_LAYER3_COEFFICIENT = 144;

export function countMp3Frames(buffer: Buffer): number {
  let offset = skipIdTag(buffer, 0);
  let frameCount = 0;

  while (offset + 4 <= buffer.length) {
    const b1 = buffer[offset];
    const b2 = buffer[offset + 1];
    const b3 = buffer[offset + 2];
    const b4 = buffer[offset + 3];

    // Check for MPEG frame sync (11 sync bits)
    if (b1 !== MPEG_SYNC_BYTE || (b2 & MPEG_SYNC_MASK) !== MPEG_SYNC_MASK) {
      offset++;
      continue;
    }

    // MPEG Version
    const version = (b2 >> 3) & MPEG_VERSION_MASK;

    // Layer
    const layer = (b2 >> 1) & MPEG_LAYER_MASK;

    // Only support MPEG Version 1 Layer III
    if (version !== MPEG_VERSION_1 || layer !== MPEG_LAYER_III) {
      offset++;
      continue;
    }

    // Extract bitrate/sample rate indexes
    const bitrateIndex = (b3 >> 4) & BITRATE_INDEX_MASK;
    const sampleRateIndex = (b3 >> 2) & SAMPLE_RATE_INDEX_MASK;

    if (bitrateIndex === 0 || bitrateIndex === 15 || sampleRateIndex === 3) {
      offset++;
      continue;
    }

    const bitrate = bitrateTable[bitrateIndex] * 1000;
    const sampleRate = sampleRateTable[sampleRateIndex];

    const padding = (b3 >> 1) & PADDING_MASK;
    const channelMode = (b4 >> 6) & CHANNEL_MODE_MASK;

    // MPEG-1 Layer III frame size
    const frameLength =
      Math.floor((MPEG1_LAYER3_COEFFICIENT * bitrate) / sampleRate) + padding;

    if (!isXingHeaderFrame(buffer, offset, frameLength, channelMode)) {
      frameCount++;
    }

    offset += frameLength;
  }

  return frameCount;
}
