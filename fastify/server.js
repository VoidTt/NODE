import Fastify from "fastify";
import router from "./routes.js";

const fastify = Fastify({
  logger: true
});

fastify.register(router);

fastify.listen({ port: 3000, host: "0.0.0.0" });

// npm.cmd install fastify @fastify/static
// npm.cmd start