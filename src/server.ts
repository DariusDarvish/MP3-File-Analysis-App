import Fastify from "fastify";
import multipart from "@fastify/multipart";
import fileUpload from "./routes/fileUpload.js";
import errorHandler from "./errors/errorHandler.js";

const fastify = Fastify({
  logger: true,
});

await fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

errorHandler(fastify);
await fastify.register(fileUpload);

try {
  await fastify.listen({
    port: 3000,
  });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
