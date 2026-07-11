import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Fastify from "fastify";
import errorHandler from "../errorHandler.js";
import Mp3Error from "../Mp3Error.js";

describe("errorHandler", () => {
  let app = Fastify();

  beforeEach(async () => {
    app = Fastify();
    errorHandler(app);
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns the status code and message for Mp3Error", async () => {
    app.post("/file-upload", () => {
      throw new Mp3Error("No MP3 file provided", 400);
    });

    const response = await app.inject({
      method: "POST",
      url: "/file-upload",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: "No MP3 file provided",
      statusCode: 400,
    });
  });

  it("returns 413 for FST_REQ_FILE_TOO_LARGE", async () => {
    app.post("/file-upload", () => {
      const error = new Error("Too large") as Error & { code: string };
      error.code = "FST_REQ_FILE_TOO_LARGE";
      throw error;
    });

    const response = await app.inject({
      method: "POST",
      url: "/file-upload",
    });

    expect(response.json()).toEqual({
      error: "File too large. Maximum size is 10 MB.",
      statusCode: 413,
    });
  });

  it("returns 500 for Interal Server Error if no error code is set", async () => {
    app.post("/file-upload", () => {
      const error = new Error("Internal Server Error") as Error & {
        code: string;
      };
      throw error;
    });

    const response = await app.inject({
      method: "POST",
      url: "/file-upload",
    });

    expect(response.json()).toEqual({
      error: "Internal Server Error",
      statusCode: 500,
    });
  });

  it("returns the correct error code if set", async () => {
    app.post("/file-upload", () => {
      const error = new Error("Page not found") as Error & {
        code: string;
        statusCode: number;
      };
      error.statusCode = 404;
      throw error;
    });

    const response = await app.inject({
      method: "POST",
      url: "/file-upload",
    });

    expect(response.json()).toEqual({
      error: "Page not found",
      statusCode: 404,
    });
  });
});
