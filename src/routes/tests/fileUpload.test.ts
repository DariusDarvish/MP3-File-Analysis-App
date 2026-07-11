// fileUpload.test.ts

import { readFileSync } from "node:fs";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import Fastify from "fastify";
import multipart from "@fastify/multipart";
import FormData from "form-data";

import fileUpload from "../fileUpload.js";
import errorHandler from "../../errors/errorHandler.js";
import { processMp3Upload } from "../../services/processMp3Upload.js";

vi.mock("../../services/processMp3Upload.js", () => ({
  processMp3Upload: vi.fn(),
}));

describe("POST /file-upload", () => {
  let app = Fastify();
  beforeEach(async () => {
    app = Fastify();
    await app.register(multipart);
    errorHandler(app);
    await app.register(fileUpload);
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  it("should upload an mp3 file and return the frame count", async () => {
    const mockedProcessMp3Upload = vi.mocked(processMp3Upload);

    mockedProcessMp3Upload.mockResolvedValue(123);

    const form = new FormData();
    form.append(
      "file",
      readFileSync("src/services/tests/fixtures/one-frame.mp3"),
      {
        filename: "one-frame.mp3",
        contentType: "audio/mpeg",
      },
    );

    const response = await app.inject({
      method: "POST",
      url: "/file-upload",
      payload: form,
      headers: form.getHeaders(),
    });

    expect(response.statusCode).toBe(200);
    expect(processMp3Upload).toHaveBeenCalledTimes(1);
    expect(response.json()).toEqual({
      frameCount: 123,
    });
  });

  it("should return 400 if no file is provided", async () => {
    const form = new FormData();

    const response = await app.inject({
      method: "POST",
      url: "/file-upload",
      payload: form,
      headers: form.getHeaders(),
    });

    expect(response.statusCode).toBe(400);
    expect(processMp3Upload).not.toHaveBeenCalled();
    expect(response.json()).toEqual({
      error: "No file uploaded",
      statusCode: 400,
    });
  });
});
