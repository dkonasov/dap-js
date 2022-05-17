import { DapRequest } from "../../src/DapRequest";
import { DapServer } from "../../src/DapServer";
import { mergeRight } from "ramda";
import { DapResponse } from "../../src/DapResponse";
import { sendData } from "@dap-js/client";

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
    await sendData('dap://localhost:3000', { procedureId: 0});
    expect(spy).toHaveBeenCalled();
  });

  it("should parse procedureId", async () => {
    const spy = jest.fn((_, res: DapResponse) => res.sendStatus(0));
    server = new DapServer(spy);
    await server.listen(3000);
    await sendData('dap://localhost:3000', { procedureId: 42});
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
    await sendData('dap://localhost:3000', {procedureId: 0, payload: Buffer.from("Hello, world!")});

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
    await sendData('dap://localhost:3000', {procedureId: 0, payload: Buffer.alloc(1)});

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
    await sendData('dap://localhost:3000', {procedureId: 0, token: Buffer.from([2, 12, 85, 6])});

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
    const result = await sendData('dap://localhost:3000', { procedureId: 0});
    expect(result.resultCode).toBe(0);
    expect(result.payload).toEqual(Buffer.from([2, 12, 85, 6]));
  });
});
