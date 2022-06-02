import { createConnection } from "net";
import { DapRequest } from "./DapRequest";
import { DapResponse } from "./DapResponse";
/**
 * 
 * @param {Promise} url url (host and port) of server
 * @param {DapRequest} request request object
 * @return {Promise} response object
 */
export function sendData(url: string, request: DapRequest): Promise<DapResponse> {
    const { procedureId, payload, token } = request;
    const tokenBuffer = token ? (typeof token === 'string' ? Buffer.from(token) : token) : Buffer.alloc(0);
    const payloadBuffer = payload ? (typeof payload === 'string' ? Buffer.from(payload) : payload) : Buffer.alloc(0);
    const bufferLength = 3 + tokenBuffer.length + payloadBuffer.length;
    const requestBuffer = Buffer.alloc(bufferLength);
    requestBuffer.writeUInt16BE(tokenBuffer.length);
    tokenBuffer.copy(requestBuffer, 2);
    requestBuffer.writeUint8(procedureId, 2 + tokenBuffer.length);
    payloadBuffer.copy(requestBuffer, 3 + tokenBuffer.length);
    const parsedUrl = new URL(url);

    return new Promise((resolve) => {
        const client = createConnection({port: Number(parsedUrl.port) || 1312, allowHalfOpen: true}, () => {
            client.write(requestBuffer, () => {
                client.end();
            });
            let result = [];
            client.on('data', (buf) => {
                result = result.concat(Array.from(buf));
            });
            client.on('end', () => {
                const resultBuffer = Buffer.from(result);
                const resultCode = resultBuffer.readUInt8();
                const payload = resultBuffer.subarray(1);
                resolve({
                    payload, resultCode
                });
            });
        });
    });
}