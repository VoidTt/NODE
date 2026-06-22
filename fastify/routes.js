import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";
import {
  checkPalindrome,
  reverseText,
  getTextStats
} from "./utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function router(fastify) {
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, "public")
  });

  fastify.get("/", async (request, reply) => {
    return reply.sendFile("index.html");
  });

  fastify.post("/api", async (request, reply) => {
    const { text = "", action = "palindrome" } = request.body ?? {};

    if (!text.trim()) {
      return reply.code(400).send({
        status: "error",
        result: "Пустой текст"
      });
    }

    let result = "";

    if (action === "palindrome") {
      result = checkPalindrome(text)
        ? "Это палиндром"
        : "Это не палиндром";
    } else if (action === "reverse") {
      result = reverseText(text);
    } else if (action === "stats") {
      const stats = getTextStats(text);
      result = `Символов: ${stats.chars}, слов: ${stats.words}, без пробелов: ${stats.withoutSpaces}`;
    } else {
      result = "Неизвестное действие";
    }

    return reply.send({
      status: "success",
      result
    });
  });
}

export default router;