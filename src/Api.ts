import fetch from 'node-fetch';
import { Response } from 'node-fetch';
import { format as urlFormat, UrlObject } from 'url';

const defaultApiOptions: ApiOptions = {
  protocol: 'https',
  hostname: 'pay.crypt.bot',
};

interface ApiOptions {
  protocol?: string;
  hostname?: string;
}

class Api {
  private token: string;
  private options: ApiOptions;

  constructor(token: string, options?: ApiOptions) {
    this.token = token;
    if (options && options.hostname) {
      // Trim protocol
      const hostname = options.hostname.match(/(\w*:\/\/)?(.+)/)?.[2];
      if (hostname) {
        options.hostname = hostname;
      }
    }
    this.options = { ...defaultApiOptions, ...options };
  }

  private buildRequest(method: string, params: Record<string, string> = {}): { body: string; headers: Record<string, string> } {
    // Remove empty params
    Object.keys(params).forEach((key) => {
      if ([undefined, null, ''].some((empty) => params[key] === empty)) {
        delete params[key];
      }
    });

    const urlObj: UrlObject = {
      ...this.options,
      pathname: `api/${method}`,
      query: params,
    };
    const body = urlFormat(urlObj);

    return {
      headers: { 'Crypto-Pay-API-Token': this.token },
      body,
    };
  }

  private async makeRequest({ body, headers }: { body: string; headers: Record<string, string> }): Promise<unknown> {
    const res: Response = await fetch(body, { headers });
    const data: any = await res.json();
    if (!data.ok) {
      let message = 'API call failed';
      if (data.error) {
        message += `: ${JSON.stringify(data.error)}`;
      }
      throw new Error(message);
    }

    return data.result;
  }

  async callApi(method: string, params: Record<string, string>): Promise<unknown> {
    const request = this.buildRequest(method, params);
    return this.makeRequest(request);
  }
}

export default Api;

