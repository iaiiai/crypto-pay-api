declare enum Assets {
    BTC = "BTC",
    TON = "TON",
    ETH = "ETH",
    USDT = "USDT",
    USDC = "USDC"
}
declare enum PaidButtonNames {
    VIEW_ITEM = "viewItem",
    OPEN_CHANNEL = "openChannel",
    OPEN_BOT = "openBot",
    CALLBACK = "callback"
}
interface Options {
    protocol?: string;
    hostname?: string;
    updateVerification?: boolean;
    webhook?: {
        serverHostname: string;
        serverPort?: number;
        path: string;
        tls?: object;
    };
}
declare class CryptoPay {
    private options;
    private on;
    private once;
    private off;
    private emit;
    private callApi;
    private webhooks;
    constructor(token: string, options?: Options);
    getMe(): Promise<object>;
    createInvoice(asset: string, amount: string, options?: object): Promise<object>;
    transfer(user_id: number, asset: string, amount: string, spend_id: string, options?: object): Promise<object>;
    getInvoices(options?: object): Promise<object>;
    getBalance(): Promise<object>;
    getExchangeRates(): Promise<object>;
    getCurrencies(): Promise<object>;
    invoicePaid(handler: Function): any;
    private handleUpdate;
}
export { CryptoPay, Assets, PaidButtonNames };
