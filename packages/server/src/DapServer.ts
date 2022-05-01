import { createServer, Server } from "net";
import { DapRequestHandler } from "./DapRequestHandler";
import { DapResponse } from "./DapResponse";

/**
 * DAP protocol server
 */
export class DapServer {
  #tcpServer: Server;

  /**
   *
   * @param {DapRequestHandler} handler handler for incoming request
   */
  constructor(handler: DapRequestHandler) {
    this.#tcpServer = createServer((c) => {
      let result: number[] = [];
      c.on("data", (buffer) => {
        result = result.concat(Array.from(buffer));
      });

      c.on("end", () => {
        const tokenLength = Buffer.from(result.slice(0, 2)).readUint16BE();
        const procedureId = Buffer.from(
          result.slice(2 + tokenLength, 3 + tokenLength)
        ).readUInt8();
        const payload =
          result.length > 3 + tokenLength
            ? Buffer.from(result.slice(3 + tokenLength))
            : undefined;
        const token =
          tokenLength > 0
            ? Buffer.from(result.slice(2, 2 + tokenLength))
            : undefined;
        handler({ procedureId, payload, token }, new DapResponse(c));
      });
    });
  }

  /**
   * Starts listening for incoming connections on the specified port
   * @param {number} port port to listen
   * @return {Promise} promise that resolves when server starts listen
   */
  listen(port: number): Promise<void> {
    return new Promise((resolve) => {
      this.#tcpServer.listen(port, () => {
        resolve();
      });
    });
  }

  /**
   * Stops server
   * @return {Promise}
   */
  stop(): Promise<void> {
    return new Promise((resolve) => {
      this.#tcpServer.close(() => resolve());
    });
  }
}
