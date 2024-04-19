"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const url_1 = require("url");
const defaultApiOptions = {
    protocol: 'https',
    hostname: 'pay.crypt.bot',
};
class Api {
    constructor(token, options) {
        var _a;
        this.token = token;
        if (options && options.hostname) {
            // Trim protocol
            const hostname = (_a = options.hostname.match(/(\w*:\/\/)?(.+)/)) === null || _a === void 0 ? void 0 : _a[2];
            if (hostname) {
                options.hostname = hostname;
            }
        }
        this.options = { ...defaultApiOptions, ...options };
    }
    buildRequest(method, params = {}) {
        // Remove empty params
        Object.keys(params).forEach((key) => {
            if ([undefined, null, ''].some((empty) => params[key] === empty)) {
                delete params[key];
            }
        });
        const urlObj = {
            ...this.options,
            pathname: `api/${method}`,
            query: params,
        };
        const body = (0, url_1.format)(urlObj);
        return {
            headers: { 'Crypto-Pay-API-Token': this.token },
            body,
        };
    }
    async makeRequest({ body, headers }) {
        const res = await (0, node_fetch_1.default)(body, { headers });
        const data = await res.json();
        if (!data.ok) {
            let message = 'API call failed';
            if (data.error) {
                message += `: ${JSON.stringify(data.error)}`;
            }
            throw new Error(message);
        }
        return data.result;
    }
    async callApi(method, params) {
        const request = this.buildRequest(method, params);
        return this.makeRequest(request);
    }
}
exports.default = Api;
