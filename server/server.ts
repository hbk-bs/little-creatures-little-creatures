//@ts-check
import Fastify from "fastify";
import cors from "@fastify/cors";
import { S } from "fluent-json-schema";
import fastifyStatic from "@fastify/static";
import { resolve } from "path";
// import { SerialPort } from "serialport";

import WebSocket, { WebSocketServer } from "ws";
import { getHostnameAndIP } from "./lib/util.js";

async function main() {
  const bodyJsonSchema = S.object()
    .prop("channel", S.string().required())
    .prop("measurements", S.array().items(S.integer()).required())

    .additionalProperties(true);

  const isTestEnv = process.argv.includes("--test");

  const isDevEnv = process.argv.includes("--dev");

  const NODE_ENV = isTestEnv ? "test" : isDevEnv ? "development" : "production";

  const envPort = process.env.PORT;

  const port =
    isNaN(parseInt(`${envPort}`)) || envPort === undefined
      ? 3000
      : parseInt(`${envPort}`);

  const LOG_LEVEL = process.env.LOG_LEVEL ?? "info";
  const envToLogger: Record<string, unknown> = {
    development: {
      level: LOG_LEVEL,
      transport: {
        target: "pino-pretty",
        options: {
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      },
    },
    production: true,
    test: false,
  };
  // Initialize Fastify
  const fastify = Fastify({
    logger: envToLogger[NODE_ENV] ?? true,
    disableRequestLogging:
      NODE_ENV === "development" || NODE_ENV === "test" ? false : true,
  });

  await fastify.register(cors, {
    origin: true,
  });

  const channels: Record<string, WebSocket[]> = {};

  // Register the plugin
  fastify.register(fastifyStatic, {
    root: resolve(process.cwd(), "./public"), // path to your directory
    prefix: "/", // optional: default '/'
  });

  fastify.get("/", async (_request, reply) => {
    return reply.sendFile("index.html");
  });
  // fastify.get("/board/", async (request, reply) => {
  // 	return reply.sendFile("index.html");
  // });
  // Define POST route for Arduino boards
  fastify.post<{ Body: { channel: string } }>(
    "/arduino",
    {
      schema: {
        body: bodyJsonSchema,
      },
    },
    async (request, reply) => {
      // Parse incoming data

      const { channel, ...data } = request.body;
      if (!channel) {
        return reply.status(400).send({ error: "Missing channel or data" });
      }

      fastify.log.info(data, `Received message from channel ${channel}`);

      // Check if channel exists
      if (!channels[channel]) {
        return reply
          .status(400)
          .send({ error: `Channel "${channel}" does not exist` });
      }

      // Broadcast message to all connections in the channel
      channels[channel].forEach((conn) => {
        if (conn.readyState === WebSocket.OPEN) {
          conn.send(JSON.stringify({ ...data, channel }));
        }
      });
      reply.status(201).send({ status: "ok" });
    },
  );

  // Create a WebSocket server and attach it to the Fastify server

  // Start the server
  const start = async () => {
    try {
      // const ports = await SerialPort.list();
      // fastify.log.info(ports);
      await fastify.listen({ port, host: "0.0.0.0" });
      const wss = new WebSocketServer({ server: fastify.server });
      // Create a port
      // try {
      //   const board = new SerialPort({
      //     path: "/dev/tty.usbmodemF412FA68EC842",
      //     baudRate: 9600,
      //     autoOpen: false,
      //   });

      //   board.open();
      //   board.on("error", (err) => {
      //     fastify.log.error(err, "Error opening port to board");
      //   });
      //   // The open event is always emitted
      //   board.on("open", function () {
      //     fastify.log.info("Port to board open");
      //   });
      //   // Switches the port into "flowing mode"
      //   board.on("data", function (data) {
      //     const parsedData = data.toString();
      //     if (!parsedData.startsWith("data:")) {
      //       fastify.log.info("serial string did not match 'data:' pattern");
      //       return;
      //     }
      //     const dataFromBoard = parsedData.toString().split("data:")[1];
      //     if (!dataFromBoard) {
      //       fastify.log.info("No data from board");
      //       return;
      //     }
      //     const body = JSON.parse(dataFromBoard);
      //     {
      //       // Parse incoming data

      //       const { channel, ...rest } = body;
      //       if (!channel) {
      //         fastify.log.info("Missing channel or data");
      //         return;
      //       }

      //       fastify.log.info(rest, `Received message from channel ${channel}`);

      //       // Check if channel exists
      //       if (!channels[channel]) {
      //         fastify.log.info(`Channel "${channel}" does not exist`);
      //         return;
      //       }

      //       // Broadcast message to all connections in the channel
      //       channels[channel].forEach((conn) => {
      //         if (conn.readyState === WebSocket.OPEN) {
      //           conn.send(JSON.stringify({ ...rest, channel }));
      //         }
      //       });
      //       fastify.log.info("Sent data to clients");
      //     }
      //   });
      // } catch (e) {
      //   fastify.log.error(e, "Error opening port to board");
      // }

      wss.on("connection", (ws, req) => {
        fastify.log.info("Client connected");
        if (!req.url) {
          ws.close(1008, "Invalid URL");
          return;
        }
        if (req.url.split("/")[1] !== "ws") {
          ws.close(1008, "Invalid URL");
          return;
        }

        const channel = req.url.split("/")[2]; // Assuming URL is /ws/:channel

        // Initialize channel array if it doesn't exist
        if (!channels[channel]) {
          channels[channel] = [];
        }

        // Add connection to channel
        channels[channel].push(ws);

        fastify.log.info(`Client connected to channel ${channel}`);

        ws.on("message", (message) => {
          fastify.log.info(`Client message on channel ${channel}: ${message}`);
          try {
            const body = JSON.parse(message.toString());
            const { channel, ...data } = body;
            if (!channel) {
              fastify.log.warn("Missing channel or data");
              return;
            }

            fastify.log.info(data, `Received message from channel ${channel}`);

            // Check if channel exists
            if (!channels[channel]) {
              fastify.log.warn(`Channel "${channel}" does not exist`);
              return;
            }

            // Broadcast message to all connections in the channel
            channels[channel].forEach((conn) => {
              if (conn.readyState === WebSocket.OPEN) {
                conn.send(JSON.stringify({ ...data, channel }));
              }
            });
            fastify.log.info("Sent data to clients");
          } catch (e) {
            fastify.log.error(e, "Error parsing ws message");
          }
        });
        ws.on("error", (err) => {
          console.error(err);
          throw err;
        });
        ws.on("close", () => {
          fastify.log.info(`Client disconnected from channel ${channel}`);

          // Remove connection from channel
          channels[channel] = channels[channel].filter((conn) => conn !== ws);
        });
      });

      const { hostname, address, error } = await getHostnameAndIP();
      if (error) {
        console.error(`Failed to get IP from hostname due to: ${error}`);
      }
      fastify.log.info(`Server running at http://localhost:3000`);
      if (hostname)
        fastify.log.info(`Server running at http://${hostname}:3000`);
      if (address) fastify.log.info(`Server running at http://${address}:3000`);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };

  start();
}

main().catch(console.error);
