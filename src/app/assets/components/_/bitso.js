/* global _ */

import { getJSON } from './util';

import {
  fixMarkets,
  fixTicker,
  fixGroup,
  fixTrades,
  fixOrders,
  sumOrders,
  tradeInfo,
  orderInfo,
  mergeOrders,
  fixBooks,
  bookInfo,
} from './data';

// const BASE_URL = 'https://api.bitso.com/v3';
const BASE_URL = 'https://bitso-api-v3.herokuapp.com';
const SOCKETS_URL = 'wss://ws.bitso.com';

export class API {
  constructor() {
    this._cache = {
      books: [],
    };

    this._events = {};
    this._bookName = 'btc_mxn';
    this._timeFrame = '1month';

    this.fetchData(this._bookName);

    setTimeout(() => this.init(), 3000);
  }

  init() {
    this.ws = new WebSocket(SOCKETS_URL);
    this.ws.onopen = () => {
      ['trades', 'orders', 'diff-orders'].forEach(event => {
        this.ws.send(JSON.stringify({ action: 'subscribe', book: this._bookName, type: event }));
      });
    };

    this.ws.onmessage = _.debounce(message => {
      const data = JSON.parse(message.data);

      if (data.type === 'trades' && data.payload) {
        data.payload.forEach(item => {
          this._cache[data.type].unshift(tradeInfo(this._bookName, item));
        });
      } else if (data.type === 'diff-orders' && data.payload) {
        const ordersKey = 'orders';

        ['asks', 'bids'].forEach(key => {
          this._cache[ordersKey][key] = mergeOrders(data.payload[key], this._cache[ordersKey][key]);
        });
      } else if (data.type === 'orders' && data.payload) {
        ['asks', 'bids'].forEach(key => {
          data.payload[key] = sumOrders(data.payload[key].map(orderInfo));
        });

        this._cache[data.type] = fixOrders('rate', this._bookName, data);
      }

      this.emit(data.type, this._cache[data.type]);
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
    this.resolve('markets', this.getMarkets(this._bookName, this._timeFrame).then(fixMarkets));

    this.resolve('books', this.getBooks(book).then(response => {
      return Promise.all(response.payload.map((item, key) => {
        return this.getMarkets(item.book, this._timeFrame)
          .then(result => Object.assign(response.payload[key], bookInfo(result.slice(0, 30))));
      }))
      .then(() => fixBooks(response));
    }));

    this.resolve('trades', this.getTrades(book).then(fixTrades));
    this.resolve('ticker', this.getTicker(book).then(response => fixTicker(this._bookName, response)));
    this.resolve('orders', this.getOrders(book).then(response => fixOrders('price', this._bookName, response)));
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
