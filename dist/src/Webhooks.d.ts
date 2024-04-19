declare class Webhooks {
    private token;
    private options;
    private updateHandler;
    private webhookServer;
    constructor(token: string, options: any, updateHandler: (update: any) => void);
    private handleRequest;
    private verifyUpdate;
    private webhookCallbackFabric;
}
export default Webhooks;
