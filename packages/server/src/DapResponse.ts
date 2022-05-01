import { Writable } from "stream";

/**
 * DAP protocol response object
 */
export class DapResponse {
  /**
   *
   * @param {WritableStream} stream stream to send response
   */
  constructor(private stream: Writable) {}

  /**
   * Sends status without payload
   * @param {number} status
   */
  sendStatus(status: number): void {
    const result = Buffer.alloc(1);
    result.writeUint8(status);
    this.stream.write(result);
    this.stream.end();
  }

  /**
   * Sends status with payload
   * @param {number} status
   * @param {Buffer} payload
   */
  send(status: number, payload: Buffer): void {
    const result = Buffer.alloc(1 + payload.length);
    result.writeUint8(status);
    payload.copy(result, 1);
    this.stream.write(result);
    this.stream.end();
  }
}
