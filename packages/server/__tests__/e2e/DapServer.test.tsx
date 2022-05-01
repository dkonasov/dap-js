import { createConnection } from "net";
import { DapRequest } from "../../src/DapRequest";
import { DapServer } from "../../src/DapServer";
import { mergeRight } from "ramda";
import { DapResponse } from "../../src/DapResponse";

// TODO: Replace this dummy client with actual client from lib

interface DapServerResponse {
  resultCode: number;
  payload?: Buffer;
}

// eslint-disable-next-line require-jsdoc
function sendData(
  procedureId: number,
  payload?: Buffer,
  token?: Buffer
): Promise<DapServerResponse> {
  const tokenBuffer = token ?? Buffer.alloc(0);
  const payloadBuffer = payload ?? Buffer.alloc(0);

  const bufferLength = 3 + tokenBuffer.length + payloadBuffer.length;
  const request = Buffer.alloc(bufferLength);
  request.writeUInt16BE(tokenBuffer.length);
  tokenBuffer.copy(request, 2);
  request.writeUint8(procedureId, 2 + tokenBuffer.length);
  payloadBuffer.copy(request, 3 + tokenBuffer.length);

  return new Promise((resolve) => {
    const client = createConnection({ port: 3000 }, () => {
      client.write(request);
      client.end();
      let result = [];
      client.on("data", (buf) => {
        result = result.concat(Array.from(buf));
      });
      client.on("end", () => {
        const resultBuffer = Buffer.from(result);
        const resultCode = resultBuffer.readUInt8();
        const payload = resultBuffer.subarray(1);
        resolve({
          payload,
          resultCode,
        });
      });
    });
  });
}

let server: DapServer;
const validRequest: DapRequest = {
  procedureId: 0,
};
describe("DapServer", () => {
  afterEach(async () => {
    await server.stop();
  });
  it("should call handler", async () => {
    const spy = jest.fn((_, res: DapResponse) => res.sendStatus(0));
    server = new DapServer(spy);
    await server.listen(3000);
    await sendData(0);
    expect(spy).toHaveBeenCalled();
  });

  it("should parse procedureId", async () => {
    const spy = jest.fn((_, res: DapResponse) => res.sendStatus(0));
    server = new DapServer(spy);
    await server.listen(3000);
    await sendData(42);
    expect(spy.mock.calls[0][0]).toEqual(
      mergeRight<DapRequest, Partial<DapRequest>>(validRequest, {
        procedureId: 42,
      })
    );
  });

  it("should parse request payload", async () => {
    const spy = jest.fn((_, res: DapResponse) => res.sendStatus(0));
    server = new DapServer(spy);
    await server.listen(3000);
    await sendData(0, Buffer.from("Hello, world!"));

    expect(spy.mock.calls[0][0]).toEqual(
      mergeRight<DapRequest, Partial<DapRequest>>(validRequest, {
        payload: Buffer.from("Hello, world!"),
      })
    );
  });

  it("should parse request payload which length is 1", async () => {
    const spy = jest.fn((_, res: DapResponse) => res.sendStatus(0));
    server = new DapServer(spy);
    await server.listen(3000);
    await sendData(0, Buffer.alloc(1));

    expect(spy.mock.calls[0][0]).toEqual(
      mergeRight<DapRequest, Partial<DapRequest>>(validRequest, {
        payload: Buffer.alloc(1),
      })
    );
  });

  it("should parse token", async () => {
    const spy = jest.fn((_, res: DapResponse) => res.sendStatus(0));
    server = new DapServer(spy);
    await server.listen(3000);
    await sendData(0, undefined, Buffer.from([2, 12, 85, 6]));

    expect(spy.mock.calls[0][0]).toEqual(
      mergeRight<DapRequest, Partial<DapRequest>>(validRequest, {
        token: Buffer.from([2, 12, 85, 6]),
      })
    );
  });

  it("should send response", async () => {
    server = new DapServer((req, res) => {
      res.send(0, Buffer.from([2, 12, 85, 6]));
    });

    await server.listen(3000);
    const result = await sendData(0);
    expect(result.resultCode).toBe(0);
    expect(result.payload).toEqual(Buffer.from([2, 12, 85, 6]));
  });
});
