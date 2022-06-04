import { Controller, Module, INestMicroservice } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { MessagePattern } from "@nestjs/microservices";
import { DapMicroserviceServer } from "../../src/dap-microservice-server";
import { sendData } from '@dap-js/client';

const controllerSpy = jest.fn();
// eslint-disable-next-line require-jsdoc
@Controller()
class AppController {
  @MessagePattern(42)
  // eslint-disable-next-line require-jsdoc
  testHandler(req: unknown) {
    controllerSpy(req);
    return Buffer.from('General Kenobi?');
  }
}

// eslint-disable-next-line require-jsdoc
@Module({
  controllers: [AppController],
})
class AppModule {}

describe("dap microservice server", () => {
  let microservice: INestMicroservice;
  beforeAll(async() => {
    const app = NestFactory.createMicroservice(AppModule, {
      strategy: new DapMicroserviceServer(),
    });

    microservice = await app;
    await microservice.listen();
  });

  it('should retrieve response', async() => {
      const response = await sendData("dap://localhost:1312", {procedureId: 42});
      expect(response.payload.toString()).toEqual('General Kenobi?');
  });

  it('should provide request', async() => {
    await sendData("dap://localhost:1312", {procedureId: 42, payload: Buffer.from('Hello, there!')});
    expect(controllerSpy.mock.calls[0][0].payload).toEqual(Buffer.from('Hello, there!'));
  });

  it('should set custom port', async() => {
    await microservice.close();
    const app = NestFactory.createMicroservice(AppModule, {
      strategy: new DapMicroserviceServer({port: 1313}),
    });

    microservice = await app;
    await microservice.listen();
    const response = await sendData("dap://localhost:1313", {procedureId: 42});
    expect(response).toBeTruthy();
  });

  afterAll(async () => {
    await microservice.close();
  });
});
