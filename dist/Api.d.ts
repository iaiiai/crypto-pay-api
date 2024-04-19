interface ApiOptions {
    protocol?: string;
    hostname?: string;
}
declare class Api {
    private token;
    private options;
    constructor(token: string, options?: ApiOptions);
    private buildRequest;
    private makeRequest;
    callApi(method: string, params: Record<string, string>): Promise<unknown>;
}
export default Api;
