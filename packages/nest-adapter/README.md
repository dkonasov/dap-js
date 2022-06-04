# `@dap-js/nest-adapter`

NestJS microservice adapter for [DAP application protocol](https://github.com/dkonasov/dap)

## Usage

### Server

```ts
// Controller

@Controller()
class AppController {
  @MessagePattern(42)
  testHandler(req: unknown) {
    controllerSpy(req);
    return Buffer.from('General Kenobi?');
  }
}

// main.ts

import { NestFactory } from "@nestjs/core";
import { DapMicroserviceServer } from "@dap-js/nest-adapter";

const app = NestFactory.createMicroservice(AppModule, {
    strategy: new DapMicroserviceServer({port: 1313}),
});

microservice = await app;
await microservice.listen();
```

### Client

```ts
import { DapMicroserviceClient } from '@dap-js/nest-adapter';
import { firstValueFrom } from 'rxjs';

const client = new DapMicroserviceClient('dap://localhost:1313');
const result = await firstValueFrom(client.send<number, {token?: Buffer, payload?: Buffer}>(42, { payload: Buffer.from('Hello there!')}));
```
