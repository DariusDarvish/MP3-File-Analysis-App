import { FastifyInstance } from "fastify";
import { processMp3Upload } from "../services/processMp3Upload.js";

export default async function fileUpload(fastify: FastifyInstance) {
  fastify.post("/file-upload", async (request, reply) => {
    const file = await request.file();

    const frameCount = await processMp3Upload(file);

    return reply.send({
      frameCount: frameCount,
    });
  });
}
