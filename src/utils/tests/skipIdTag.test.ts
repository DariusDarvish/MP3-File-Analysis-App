import { describe, expect, it } from "vitest";
import { skipIdTag } from "../skipIdTag.js";

describe("skipIdTag", () => {
  it("returns the original offset when no ID3 tag is present", () => {
    const buffer = Buffer.alloc(40);
    buffer.write("NOPE", 0, "ascii");

    expect(skipIdTag(buffer, 0)).toBe(0);
  });

  it("returns 10 when an ID3 tag has no body", () => {
    const buffer = Buffer.alloc(40);
    buffer.write("ID3", 0, "ascii");

    expect(skipIdTag(buffer, 0)).toBe(10);
  });

  it("skips the ID3 header plus the synchsafe tag size", () => {
    const buffer = Buffer.alloc(80);
    buffer.write("ID3", 0, "ascii");
    buffer[6] = 0;
    buffer[7] = 1;
    buffer[8] = 2;
    buffer[9] = 3;
    // tagSize = (0 << 21) | (1 << 14) | (2 << 7) | 3 = 16643
    // expected offset = 10 + 16643 = 16653
    expect(skipIdTag(buffer, 0)).toBe(16653);
  });

  it("masks off the high bit of each synchsafe size byte", () => {
    const buffer = Buffer.alloc(40);
    buffer.write("ID3", 0, "ascii");

    // Without masking these would be 255.
    // With & 0x7f they become 127.
    buffer[6] = 0xff;
    buffer[7] = 0xff;
    buffer[8] = 0xff;
    buffer[9] = 0xff;

    const expectedTagSize = (127 << 21) | (127 << 14) | (127 << 7) | 127;

    expect(skipIdTag(buffer, 0)).toBe(10 + expectedTagSize);
  });

  it("returns the original offset when the buffer is smaller than an ID3 header", () => {
    const buffer = Buffer.alloc(5);

    expect(skipIdTag(buffer, 0)).toBe(0);
  });
});
