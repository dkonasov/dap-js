import { DapServer } from '@dap-js/server';
import { DapMicroserviceClient } from '../../src/dap-microservice-client';
import { firstValueFrom } from 'rxjs';

describe('DAP microservice client', () => {
    let server: DapServer;
    const requestSpy = jest.fn();

    beforeAll(async() => {
        server = new DapServer((req, res) => {
            requestSpy(req);
            res.send(0, Buffer.from('General Kenobi?'));
        });
        await server.listen(1312);
    });

    it('should get response', async() => {
        const client = new DapMicroserviceClient('dap://localhost:1312');
        const result = await firstValueFrom(client.send<number, {token?: Buffer, payload?: Buffer}>(42, { payload: Buffer.from('Hello there!')}));
        expect(result).toEqual(Buffer.from('General Kenobi?'));
    });


    it('should send request', async() => {
        const client = new DapMicroserviceClient('dap://localhost:1312');
        await firstValueFrom(client.send<number, {token?: Buffer, payload?: Buffer}>(42, { payload: Buffer.from('Hello there!'), token: Buffer.from('2128506')}));
        expect(requestSpy.mock.calls[0][0].procedureId).toEqual(42);
        expect(requestSpy.mock.calls[0][0].payload).toEqual(Buffer.from('Hello there!'));
        expect(requestSpy.mock.calls[0][0].token).toEqual(Buffer.from('2128506'));
    });

    afterAll(async() => {
        await server.stop();
    });
});