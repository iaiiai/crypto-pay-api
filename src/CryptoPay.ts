import { EventEmitter } from 'events';
import Api from './Api';
import Webhooks from './Webhooks';

enum Assets {
  BTC = 'BTC',
  TON = 'TON',
  ETH = 'ETH',
  USDT = 'USDT',
  USDC = 'USDC',
}

enum PaidButtonNames {
  VIEW_ITEM = 'viewItem',
  OPEN_CHANNEL = 'openChannel',
  OPEN_BOT = 'openBot',
  CALLBACK = 'callback',
}

const UpdateTypes: string[] = ['invoice_paid'];

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

const defaultOptions: Options = {
  updateVerification: true,
};

class CryptoPay {
  private options: Options;
  private on: Function;
  private once: Function;
  private off: Function;
  private emit: Function;
  private callApi: Function;
  private webhooks: Webhooks;

  constructor(token: string, options?: Options) {
    this.options = { ...defaultOptions, ...options };

    const emitter = new EventEmitter();
    this.on = emitter.on.bind(emitter);
    this.once = emitter.once.bind(emitter);
    this.off = emitter.removeListener.bind(emitter);
    this.emit = emitter.emit.bind(emitter);

    const api = new Api(token, this.options);
    this.callApi = api.callApi.bind(api);

    if (this.options.webhook) {
      this.webhooks = new Webhooks(token, this.options, this.handleUpdate.bind(this));
    }
  }

  getMe(): Promise<object> {
    return this.callApi('getMe');
  }

  async createInvoice(asset: string, amount: string, options: object = {}): Promise<object> {
    return this.callApi('createInvoice', { asset, amount, ...options });
  }

  async transfer(user_id: number, asset: string, amount: string, spend_id: string, options: object = {}): Promise<object> {
    return this.callApi('transfer', { user_id, asset, amount, spend_id, ...options });
  }

  async getInvoices(options: object = {}): Promise<object> {
    return this.callApi('getInvoices', options);
  }

  async getBalance(): Promise<object> {
    return this.callApi('getBalance');
  }

  async getExchangeRates(): Promise<object> {
    return this.callApi('getExchangeRates');
  }

  async getCurrencies(): Promise<object> {
    return this.callApi('getCurrencies');
  }

  invoicePaid(handler: Function) {
    return this.on('invoice_paid', handler);
  }

  private handleUpdate(update: { update_type, data }) {
    const { update_type, ...data } = update;

    if (!UpdateTypes.some((key) => key === update_type)) return;

    this.emit(update_type, data);
  }
}

export { CryptoPay, Assets, PaidButtonNames };