# `@dap-js/server`

NodeJS server implementation for [DAP application protocol](https://github.com/dkonasov/dap)

## Usage

```ts
import { DapServer } from "@dap-js/server";

const server = new DapServer((req, res) => { res.send(0, Buffer.from("Hello, world!"))});

server.listen(3000);
```
