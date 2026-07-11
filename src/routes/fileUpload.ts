import { FastifyInstance } from "fastify";
import { processMp3Upload } from "../services/processMp3Upload.js";
import Mp3Error from "../errors/Mp3Error.js";

export default async function fileUpload(fastify: FastifyInstance) {
  fastify.post("/file-upload", async (request, reply) => {
    const file = await request.file();

    if (!file) {
      throw new Mp3Error("No file uploaded", 400);
    }

    const frameCount = await processMp3Upload(file);

    return reply.send({
      frameCount: frameCount,
    });
  });
}
