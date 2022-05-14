# `@dap-js/client`

NodeJS client implementation for [DAP application protocol](https://github.com/dkonasov/dap)

## Usage

```ts
import { sendData } from "@dap-js/server";

const result = await sendData("dap://localhost:1312", {procedureId: 42, payload: String.from("Hello, there!")});

console.log(result.resultCode); // 0
console.log(payload.toString()); // "General Kenobi?"
```
