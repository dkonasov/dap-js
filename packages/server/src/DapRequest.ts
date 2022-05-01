/**
 * Interface that represents request object
 */
export interface DapRequest {
  procedureId: number;
  payload?: Buffer;
  token?: Buffer;
}
