import { CustomTransportStrategy, Server, Transport } from "@nestjs/microservices";
import { DapServer } from '@dap-js/server';
import { DapMicroserviceOptions } from "./dap-microservice-options";

/**
 * DAP microservice class
 */
export class DapMicroserviceServer extends Server implements CustomTransportStrategy {
    transportId?: symbol | Transport;
    private server: DapServer;
    
    /**
     * 
     * @param { DapMicroserviceOptions } options options for service
     */
    constructor(private options?: DapMicroserviceOptions) {
        super();
    }
    /**
     * 
     * @param {Function} callback callback to be invoked when server is up
     */
    async listen(callback: () => void) {
        this.server = new DapServer((req, res) => {
            const handler = this.messageHandlers.get(String(req.procedureId));
            handler(req).then((result) => {
                res.send(0, result as unknown as Buffer);
            });
        });
        await this.server.listen(this.options?.port ?? 1312);
        callback();
    }
    /**
     * Invokes when service is stoped
     */
    async close() {
        await this.server.stop();
    }
}