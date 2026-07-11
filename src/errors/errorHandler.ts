import { FastifyInstance } from "fastify";
import Mp3Error from "./Mp3Error.js";

export default async function errorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if (error instanceof Mp3Error) {
      return reply.status(error.statusCode).send({
        error: error.message,
        statusCode: error.statusCode,
      });
    }

    const fastifyError = error as Error & {
      code?: string;
      statusCode?: number;
    };

    if (fastifyError.code === "FST_REQ_FILE_TOO_LARGE") {
      return reply.status(413).send({
        error: "File too large. Maximum size is 10 MB.",
        statusCode: 413,
      });
    }

    return reply.status(fastifyError.statusCode ?? 500).send({
      error:
        fastifyError.statusCode && fastifyError.statusCode < 500
          ? fastifyError.message
          : "Internal Server Error",
      statusCode: fastifyError.statusCode ?? 500,
    });
  });
}
