"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaidButtonNames = exports.Assets = exports.CryptoPay = void 0;
const events_1 = require("events");
const Api_1 = require("./Api");
const Webhooks_1 = require("./Webhooks");
var Assets;
(function (Assets) {
    Assets["BTC"] = "BTC";
    Assets["TON"] = "TON";
    Assets["ETH"] = "ETH";
    Assets["USDT"] = "USDT";
    Assets["USDC"] = "USDC";
})(Assets || (exports.Assets = Assets = {}));
var PaidButtonNames;
(function (PaidButtonNames) {
    PaidButtonNames["VIEW_ITEM"] = "viewItem";
    PaidButtonNames["OPEN_CHANNEL"] = "openChannel";
    PaidButtonNames["OPEN_BOT"] = "openBot";
    PaidButtonNames["CALLBACK"] = "callback";
})(PaidButtonNames || (exports.PaidButtonNames = PaidButtonNames = {}));
const UpdateTypes = ['invoice_paid'];
const defaultOptions = {
    updateVerification: true,
};
class CryptoPay {
    constructor(token, options) {
        this.options = { ...defaultOptions, ...options };
        const emitter = new events_1.EventEmitter();
        this.on = emitter.on.bind(emitter);
        this.once = emitter.once.bind(emitter);
        this.off = emitter.removeListener.bind(emitter);
        this.emit = emitter.emit.bind(emitter);
        const api = new Api_1.default(token, this.options);
        this.callApi = api.callApi.bind(api);
        if (this.options.webhook) {
            this.webhooks = new Webhooks_1.default(token, this.options, this.handleUpdate.bind(this));
        }
    }
    getMe() {
        return this.callApi('getMe');
    }
    async createInvoice(asset, amount, options = {}) {
        return this.callApi('createInvoice', { asset, amount, ...options });
    }
    async transfer(user_id, asset, amount, spend_id, options = {}) {
        return this.callApi('transfer', { user_id, asset, amount, spend_id, ...options });
    }
    async getInvoices(options = {}) {
        return this.callApi('getInvoices', options);
    }
    async getBalance() {
        return this.callApi('getBalance');
    }
    async getExchangeRates() {
        return this.callApi('getExchangeRates');
    }
    async getCurrencies() {
        return this.callApi('getCurrencies');
    }
    invoicePaid(handler) {
        return this.on('invoice_paid', handler);
    }
    handleUpdate(update) {
        const { update_type, ...data } = update;
        if (!UpdateTypes.some((key) => key === update_type))
            return;
        this.emit(update_type, data);
    }
}
exports.CryptoPay = CryptoPay;
