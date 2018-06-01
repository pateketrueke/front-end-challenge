/* global _ */

import { getJSON } from './util';

// const BASE_URL = 'https://api.bitso.com/v3';
const BASE_URL = 'https://bitso-api-v3.herokuapp.com';
const SOCKETS_URL = 'wss://ws.bitso.com';

export class API {
  constructor() {
    this._cache = {};
    this._events = {};

    this.fetchData('btc_mxn');

    setTimeout(() => this.init(), 3000);
  }

  init() {
    this.ws = new WebSocket(SOCKETS_URL);
    this.ws.onopen = () => {
      ['trades', 'orders', 'diff-orders'].forEach(event => {
        this.ws.send(JSON.stringify({ action: 'subscribe', book: 'btc_mxn', type: event }));
      });
    };

    this.ws.onmessage = _.debounce(message => {
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

    if (this._cache[event]) {
      callback(this._cache[event]);
    }

    this._events[event].push(_.debounce(callback, 200));
  }

  emit(event, ...args) {
    if (this._events[event]) {
      this._events[event].forEach(cb => cb(...args));
    }
  }

  fetchData(book) {
    this.resolve('books', this.getBooks(book));
    this.resolve('ticker', this.getTicker(book));
    this.resolve('trades', this.getTrades(book));
    this.resolve('orders', this.getOrders(book));
  }

  resolve(event, deferred) {
    deferred.then(result => {
      this.emit(event, result);
      this._cache[event] = result;
    });
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
    return this.getData('api/available_books');
  }

  getTrades(book) {
    return this.getData('api/trades', { book, limit: 30 });
  }

  getOrders(book) {
    return this.getData('api/order_book', { book, aggregate: true });
  }

  getTicker(book) {
    return this.getData('api/ticker', { book });
  }

  getMarkets(book, timeframe) {
    return this.getData(`trade/chartJSON/${book}/${timeframe}`);
  }
}

export default {
  API,
};
