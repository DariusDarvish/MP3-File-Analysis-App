import { describe, expect, it } from "vitest";
import { isXingHeaderFrame } from "../isXingHeaderFrame.js";

describe("isXingHeaderFrame", () => {
  it("returns true when a stereo frame contains a Xing header", () => {
    const buffer = Buffer.alloc(100);

    buffer.write("Xing", 36, "ascii");

    expect(isXingHeaderFrame(buffer, 0, 100, 0)).toBe(true);
  });

  it("returns true when a stereo frame contains an Info header", () => {
    const buffer = Buffer.alloc(100);

    buffer.write("Info", 36, "ascii");

    expect(isXingHeaderFrame(buffer, 0, 100, 0)).toBe(true);
  });

  it("returns true when a mono frame contains a Xing header", () => {
    const buffer = Buffer.alloc(100);

    buffer.write("Xing", 21, "ascii");

    expect(isXingHeaderFrame(buffer, 0, 100, 3)).toBe(true);
  });

  it("returns true when a mono frame contains an Info header", () => {
    const buffer = Buffer.alloc(100);

    buffer.write("Info", 21, "ascii");

    expect(isXingHeaderFrame(buffer, 0, 100, 3)).toBe(true);
  });

  it("returns false when neither Xing nor Info is present", () => {
    const buffer = Buffer.alloc(100);

    expect(isXingHeaderFrame(buffer, 0, 100, 0)).toBe(false);
  });

  it("returns false when the Xing header is at the wrong offset", () => {
    const buffer = Buffer.alloc(100);

    // Stereo expects byte 36, not 21
    buffer.write("Xing", 21, "ascii");

    expect(isXingHeaderFrame(buffer, 0, 100, 0)).toBe(false);
  });

  it("uses the provided frame offset", () => {
    const buffer = Buffer.alloc(300);

    // Frame starts at byte 100, so Xing should be at 136.
    buffer.write("Xing", 136, "ascii");

    expect(isXingHeaderFrame(buffer, 100, 100, 0)).toBe(true);
  });
});
