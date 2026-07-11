import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MultipartFile } from "@fastify/multipart";

import Mp3Error from "../../errors/Mp3Error.js";
import { processMp3Upload } from "../processMp3Upload.js";
import { countMp3Frames } from "../mp3FrameCounter.js";

vi.mock("../mp3FrameCounter.js", () => ({
  countMp3Frames: vi.fn(),
}));

describe("processMp3Upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockFile(
    overrides: Partial<MultipartFile> = {},
  ): MultipartFile {
    return {
      filename: "test.mp3",
      mimetype: "audio/mpeg",
      toBuffer: vi.fn().mockResolvedValue(Buffer.from("fake mp3")),
      ...overrides,
    } as MultipartFile;
  }

  it("throws when no file is provided", async () => {
    await expect(processMp3Upload(undefined)).rejects.toEqual(
      new Mp3Error("No MP3 file provided", 400),
    );
  });

  it("throws when the extension is not .mp3", async () => {
    const file = createMockFile({
      filename: "test.wav",
    });

    await expect(processMp3Upload(file)).rejects.toEqual(
      new Mp3Error("File must have a .mp3 extension", 400),
    );
  });

  it("throws when the mimetype is invalid", async () => {
    const file = createMockFile({
      mimetype: "image/png",
    });

    await expect(processMp3Upload(file)).rejects.toEqual(
      new Mp3Error("File must be an MP3", 400),
    );
  });

  it("throws when the file is empty", async () => {
    const file = createMockFile({
      toBuffer: vi.fn().mockResolvedValue(Buffer.alloc(0)),
    });

    await expect(processMp3Upload(file)).rejects.toEqual(
      new Mp3Error("File is empty", 400),
    );
  });

  it("throws when no MP3 frames are found", async () => {
    const file = createMockFile();

    vi.mocked(countMp3Frames).mockReturnValue(0);

    await expect(processMp3Upload(file)).rejects.toEqual(
      new Mp3Error("File does not contain valid MP3 frames", 422),
    );

    expect(countMp3Frames).toHaveBeenCalledWith(Buffer.from("fake mp3"));
  });

  it("returns the frame count for a valid MP3", async () => {
    const file = createMockFile();

    vi.mocked(countMp3Frames).mockReturnValue(123);

    const result = await processMp3Upload(file);

    expect(result).toBe(123);
    expect(file.toBuffer).toHaveBeenCalledOnce();
    expect(countMp3Frames).toHaveBeenCalledWith(Buffer.from("fake mp3"));
  });
});
