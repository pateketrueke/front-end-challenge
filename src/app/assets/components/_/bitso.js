import { getJSON } from './util';

const BASE_URL = 'https://api.bitso.com/v3';
const SOCKETS_URL = 'wss://ws.bitso.com';

export class API {
  constructor() {
    this.ws = new WebSocket(SOCKETS_URL);
    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({ action: 'subscribe', book: 'btc_mxn', type: 'trades' }));
      this.ws.send(JSON.stringify({ action: 'subscribe', book: 'btc_mxn', type: 'diff-orders' }));
      this.ws.send(JSON.stringify({ action: 'subscribe', book: 'btc_mxn', type: 'orders' }));
    };

    this._events = {};
    this.diff = [];
    this.bids = [];
    this.asks = [];
    this.trades = [];

    this.ws.onmessage = message => {
      const data = JSON.parse(message.data);

      if (data.type == 'trades' && data.payload) {
        this.trades = data.payload.map(trade => {
          return {
            identifier: trade.i,
            amount: trade.a,
            value: trade.v,
            rate: trade.r,
          };
        });

        this.emit('trades');
      } else if (data.type == 'diff-orders' && data.payload) {
        this.diff = data.payload.map(order => {

          return {
            timestamp: order.d,
            rate: order.r,
            amount: order.a,
            value: order.v,
            order: order.o,
            type: order.t ? 'sell' : 'buy',
          };
        });

        this.emit('diff');
      } else if (data.type == 'orders' && data.payload) {
        Object.keys(data.payload).forEach(key => {
          this[key] = data.payload[key].map(order => {
            return {
              timestamp: order.d,
              rate: order.r,
              amount: order.a,
              value: order.v,
              order: order.o,
              type: order.t ? 'sell' : 'buy',
            };
          });
        });

        this.emit('orders');
      }
    };
  }

  on(event, callback) {
    if (!this._events[event]) {
      this._events[event] = [];
    }

    this._events[event].push(callback);
  }

  off(event, callback) {
    if (this._events[event]) {
      const offset = this._events[event].indexOf(event);

      this._events.splice(offset, 1);
    }
  }

  emit(event) {
    if (this._events[event]) {
      this._events[event].forEach(cb => cb());
    }
  }

  getURL(path) {
    return `${BASE_URL}${path}`;
  }

  getTrades(book, callback) {
    return getJSON(this.getURL('/trades'), { book }, callback);
  }
}

export default {
  API: new API(),
};
