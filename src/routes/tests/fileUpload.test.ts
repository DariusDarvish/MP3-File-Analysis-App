// fileUpload.test.ts

import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import Fastify from "fastify";
import multipart from "@fastify/multipart";
import formAutoContent from "form-auto-content";

import fileUpload from "../fileUpload.js";
import { processMp3Upload } from "../../services/processMp3Upload.js";

vi.mock("../../services/processMp3Upload.js", () => ({
  processMp3Upload: vi.fn(),
}));

describe("POST /file-upload", () => {
  let app = Fastify();
  beforeEach(async () => {
    app = Fastify();
    await app.register(multipart);
    await app.register(fileUpload);
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  it("should upload an mp3 file and return the frame count", async () => {
    const mockedProcessMp3Upload = vi.mocked(processMp3Upload);

    mockedProcessMp3Upload.mockResolvedValue(123);

    const form = formAutoContent({
      file: {
        value: Buffer.from("fake mp3 content"),
        options: {
          filename: "test.mp3",
          contentType: "audio/mpeg",
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/file-upload",
      ...form,
    });

    expect(response.statusCode).toBe(200);
    expect(processMp3Upload).toHaveBeenCalledTimes(1);
    expect(response.json()).toEqual({
      frameCount: 123,
    });
  });
});
