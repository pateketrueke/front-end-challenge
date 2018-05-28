/* global _ */

import { getJSON } from './util';

// const BASE_URL = 'https://api.bitso.com/v3';
const BASE_URL = 'https://bitso-api-v3.herokuapp.com';
const SOCKETS_URL = 'wss://ws.bitso.com';

export class API {
  constructor() {
    this._events = {};

    setTimeout(() => this.init(), 1000);
  }

  init() {
    this.ws = new WebSocket(SOCKETS_URL);
    this.ws.onopen = () => {
      ['trades', 'orders', 'diff-orders'].forEach(event => {
        this.ws.send(JSON.stringify({ action: 'subscribe', book: 'btc_mxn', type: event }));
      });
    };

    this.ws.onmessage = _.throttle(message => {
      const data = JSON.parse(message.data);

      if (data.type === 'trades' && data.payload) {
        const trades = data.payload.map(trade => {
          return {
            operation: trade.t ? 'sell' : 'buy',
            identifier: trade.i,
            amount: trade.a,
            value: trade.v,
            rate: trade.r,
          };
        });

        this.emit('trades', trades);
      } else if (data.type === 'diff-orders' && data.payload) {
        const diff = data.payload.map(order => {
          return {
            operation: order.t ? 'sell' : 'buy',
            timestamp: order.d,
            rate: order.r,
            type: order.s,
            amount: order.a,
            value: order.v,
            order: order.o,
          };
        });

        this.emit('diff', data.sequence, diff);
      } else if (data.type === 'orders' && data.payload) {
        const orders = {};

        Object.keys(data.payload).forEach(key => {
          orders[key] = data.payload[key].map(order => {
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

        this.emit('orders', orders);
      }
    }, 200);
  }

  on(event, callback) {
    if (!this._events[event]) {
      this._events[event] = [];
    }

    this._events[event].push(_.throttle(callback, 200));
  }

  emit(event, ...args) {
    if (this._events[event]) {
      this._events[event].forEach(cb => cb(...args));
    }
  }

  getURL(path) {
    return `${BASE_URL}${path}`;
  }

  getData(group, params) {
    const path = `/${group}`;
    const url = this.getURL(path);

    return getJSON(url, params);
  }

  getBooks() {
    return this.getData('available_books');
  }

  getTrades(book) {
    return this.getData('trades', { book, limit: 50 });
  }

  getOrders(book) {
    return this.getData('order_book', { book, aggregate: true });
  }

  getTicker(book) {
    return this.getData('ticker', { book });
  }

  getMarkets() {
  }
}

export default {
  API: new API(),
};
