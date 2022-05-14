/**
 * Interface that represents DAP response object
 */
export interface DapResponse {
  resultCode: number;
  payload?: Buffer;
}
