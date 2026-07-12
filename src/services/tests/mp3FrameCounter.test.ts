import { describe, expect, it } from "vitest";
import { countMp3Frames } from "../mp3FrameCounter.js";
import { readFileSync } from "node:fs";

describe("mp3FrameCounter", () => {
  it("counts a valid mp3", () => {
    const buffer = readFileSync("src/services/tests/fixtures/one-frame.mp3");

    expect(countMp3Frames(buffer)).toBe(1);
  });

  it("ignores ID3 metadata", () => {
    const buffer = readFileSync(
      "src/services/tests/fixtures/one-frame-with-id3.mp3",
    );

    expect(countMp3Frames(buffer)).toBe(1);
  });

  it("ignores Xing header frames", () => {
    const buffer = readFileSync(
      "src/services/tests/fixtures/one-frame-with-xing.mp3",
    );

    expect(countMp3Frames(buffer)).toBe(0);
  });

  it("testing invalid sync", () => {
    const buffer = readFileSync("src/services/tests/fixtures/invalid-sync.mp3");

    expect(countMp3Frames(buffer)).toBe(0);
  });
});
