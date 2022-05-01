import { DapRequest } from "./DapRequest";
import { DapResponse } from "./DapResponse";

export type DapRequestHandler = (
  req: DapRequest,
  res: DapResponse
) => void | Promise<void>;
