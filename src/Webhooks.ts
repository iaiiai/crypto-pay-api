import { createHash, createHmac } from 'crypto';

const SIGNATURE_HEADER_NAME: string = 'crypto-pay-api-signature';

interface WebhooksOptions {
  serverPort: number;
  serverHostname?: string;
  path: string;
  tls?: any;
  updateVerification?: boolean;
}

interface WebhooksDefault {
    serverPort: number,
}

const defaultWebhooksOptions: WebhooksDefault = Object.freeze({
  serverPort: 80,
});

class Webhooks {
  private token: string;
  private options: WebhooksOptions;
  private updateHandler: (update: any) => void;
  private webhookServer: any;

  constructor(token: string, options: any, updateHandler: (update: any) => void) {
    this.token = token;
    this.options = { ...defaultWebhooksOptions, ...options.webhook, updateVerification: options.updateVerification };
    this.updateHandler = updateHandler;

    if (!this.options.serverHostname) throw new Error('Webhook server hostname is required');
    if (typeof this.options.serverHostname !== 'string') throw new Error('Webhook server hostname must be a string');
    if (typeof this.options.serverPort !== 'number') throw new Error('Webhook server port must be a number');
    if (!this.options.path) throw new Error('Webhook path is required');
    if (typeof this.options.path !== 'string') throw new Error('Webhook path must be a string');

    const cb = this.webhookCallbackFabric(this.options.path, this.handleRequest.bind(this));

    this.webhookServer = this.options.tls
      ? require('https').createServer(this.options.tls, cb)
      : require('http').createServer(cb);
    this.webhookServer.listen(this.options.serverPort, this.options.serverHostname);
  }

  private handleRequest(update: any, headers: any): void {
    if (this.options.updateVerification) {
      let signature: string;
      Object.keys(headers).find((name: string) => {
        if (name.toLowerCase() === SIGNATURE_HEADER_NAME) {
          signature = headers[name];
          return true;
        }
      });
      if (!signature || !this.verifyUpdate(update, signature)) throw new WebhookError(400, 'Wrong signature');
    }

    this.updateHandler(update);
  }

  private verifyUpdate(update: any, signature: string): boolean {
    const secret: Buffer = createHash('sha256').update(this.token).digest();
    const serializedData: string = JSON.stringify(update);
    const hmac: string = createHmac('sha256', secret).update(serializedData).digest('hex');
    return hmac === signature;
  }

  private webhookCallbackFabric(webhookPath: string, requestHandler: (update: any, headers: any) => void): any {
    return (req: any, res: any, next: any) => {
      if (req.method !== 'POST' || req.url !== webhookPath) {
        if (typeof next === 'function') {
          return next();
        }
        res.statusCode = 400;
        return res.end();
      }
      let body: string = '';
      req.on('data', (chunk: any) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        let update: any = {};
        try {
          update = JSON.parse(body);
        } catch (error) {
          res.writeHead(415);
          res.end();
        }
        try {
          requestHandler(update, req.headers);
        } catch (error) {
          if (error.code) {
            res.writeHead(error.code, error.message);
          } else {
            res.writeHead(500);
          }
          res.end();
        }
        if (!res.finished) {
          res.end();
        }
      });
    };
  }
}

class WebhookError extends Error {
  public code: number;

  constructor(code: number, ...params: any[]) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WebhookError);
    }

    this.code = code;
  }
}

export default Webhooks;