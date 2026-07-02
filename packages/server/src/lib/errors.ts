import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler(
    (error: FastifyError | ZodError, request: FastifyRequest, reply: FastifyReply) => {
      app.log.error({
        path: request.url,
        method: request.method,
        type: error.constructor.name,
        message: error.message,
        stack: error.stack,
      }, error.message);

      if (error instanceof ZodError) {
        return reply.status(400).send({
          error: "Validation Error",
          details: error.errors,
        });
      }

      if ("statusCode" in error && error.statusCode) {
        return reply.status(error.statusCode).send({
          error: error.message,
        });
      }

      return reply.status(500).send({
        error: "Internal Server Error",
      });
    },
  );
}
