import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { sendData } from '@dap-js/client';

/**
 * DAP microservice client
 */
export class DapMicroserviceClient extends ClientProxy {

    /**
     * 
     * @param {string} url url to connect 
     */
    constructor(private url: string) {
        super();
    }

    /**
     * Callback to invoke when client is connected
     * @return {Promise}
     */
    connect(): Promise<any> {
        return Promise.resolve();
    }

    /**
     * Callback to invoke when connection is closed
     */
    close() {
    }

    /**
     * Processes request
     * @param {ReadPacket} packet incoming message
     * @param {Function} callback callback to invoke when result is ready
     * @return {Function} teardown function
     */
    protected publish(packet: ReadPacket<{token?: Buffer, payload?: Buffer}>, callback: (packet: WritePacket<Buffer>) => void): () => void {
       sendData(this.url, { procedureId: packet.pattern, token: packet.data.token, payload: packet.data.payload}).then((response) => {
           if (response.resultCode === 0) {
            callback({response: response.payload});
           }
       });

       return () => {};
    }

    
    // eslint-disable-next-line require-jsdoc
    protected dispatchEvent<T = any>(packet: ReadPacket<any>): Promise<T> {
        return Promise.resolve(null);
    }
}