import { DapServer, DapRequest, DapResponse } from '@dap-js/server';
import { sendData, DapResponse as LocalDapResponse } from '../../src';

let server: DapServer;

describe("sendData", () => {
  it("should send request", async () => {
    const handlerSpy = jest.fn((_, res: DapResponse) => {
        res.sendStatus(0);
    });
    server = new DapServer(handlerSpy);
    await server.listen(1312);
    await sendData('dap://localhost:1312', { payload: Buffer.from('Hello, world!'), procedureId: 42});

    expect(handlerSpy.mock.calls[0][0]).toEqual({payload: Buffer.from('Hello, world!'), procedureId: 42} as DapRequest);
  });

  it("should return response request", async () => {
    server = new DapServer((_, res: DapResponse) => {
      res.send(0, Buffer.from("Hello, world!"));
    });
    await server.listen(1312);
    const result = await sendData('dap://localhost:1312', { payload: Buffer.from('Hello, world!'), procedureId: 42});

    expect(result).toEqual({resultCode: 0, payload: Buffer.from("Hello, world!")} as LocalDapResponse);
  });

  afterEach(async() => {
      await server.stop();
  });
});
