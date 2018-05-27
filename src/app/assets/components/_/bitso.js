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
    this.trades = [];
    this.orders = {};

    this.ws.onmessage = message => {
      const data = JSON.parse(message.data);

      if (data.type == 'trades' && data.payload) {
        this.trades = data.payload.map(trade => {
          return {
            operation: trade.t ? 'sell' : 'buy',
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
            operation: order.t ? 'sell' : 'buy',
            timestamp: order.d,
            rate: order.r,
            amount: order.a,
            value: order.v,
            order: order.o,
          };
        });

        this.emit('diff');
      } else if (data.type == 'orders' && data.payload) {
        Object.keys(data.payload).forEach(key => {
          this.orders[key] = data.payload[key].map(order => {
            return {
              operation: order.t ? 'sell' : 'buy',
              timestamp: order.d,
              rate: order.r,
              amount: order.a,
              value: order.v,
              order: order.o,
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

  getBook(book, group) {
    return getJSON(this.getURL(`/${group}`), { book });
  }

  getTrades(book) {
    return this.getBook(book, 'trades');
  }

  getOrders(book) {
    return this.getBook(book, 'order_book');
  }
}

export default {
  API: new API(),
};
