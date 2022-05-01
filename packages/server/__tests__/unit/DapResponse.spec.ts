import { Writable } from "stream";
import { DapResponse } from "../../src/DapResponse";

describe("DapResponse", () => {
  it("should write status", () => {
    const writeSpy = jest
      .spyOn(Writable.prototype, "write")
      .mockImplementation((_, __) => true);
    const endSpy = jest.spyOn(Writable.prototype, "end");
    const response = new DapResponse(new Writable());
    response.sendStatus(0);
    expect(writeSpy).toHaveBeenCalledWith(Buffer.alloc(1));
    expect(endSpy).toHaveBeenCalled();
  });

  it("should write status and payload", () => {
    const writeSpy = jest
      .spyOn(Writable.prototype, "write")
      .mockImplementation((_, __) => true);
    const endSpy = jest.spyOn(Writable.prototype, "end");
    const response = new DapResponse(new Writable());
    response.send(0, Buffer.from([2, 12, 85, 6]));
    expect(writeSpy).toHaveBeenCalledWith(Buffer.from([0, 2, 12, 85, 6]));
    expect(endSpy).toHaveBeenCalled();
  });
});
