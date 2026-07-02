import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler(
    (error: FastifyError | ZodError, _request: FastifyRequest, reply: FastifyReply) => {
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
