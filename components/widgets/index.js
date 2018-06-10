(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () {

  

  function priceFormat(number) {
    if (number < 1) {
      var value = numeral(number).format('0.00000000');

      if (value === 'NaN') {
        return number;
      }

      return value;
    }

    return numeral(number).format('0,0.00');
  }

  function formatNumber(values, number) {
    var value = priceFormat(number);

    if (values.indexOf('mxn') === -1) {
      return value;
    }

    return ("$" + value);
  }

  function fixedNumber(value, length) {
    return parseFloat(value || 0).toFixed(length);
  }

  function getQuery(params) {
    var query = Object.keys(params)
      .map(function (key) { return (
        typeof params[key] !== 'undefined'
          ? (key + "=" + (params[key]))
          : undefined
      ); })
      .filter(Boolean)
      .join('&');

    return query;
  }

  function getJSON(url, params) {
    var query;

    if (params) {
      query = "?" + (getQuery(params));
    }

    return fetch(("" + url + (query || '')))
      .then(function (resp) { return resp.json(); });
  }

  function average(values, property) {
    return values.reduce(function (prev, cur) { return prev + parseFloat(cur[property]); }, 0) / values.length;
  }

  

  function fixMarkets(payload) {
    return payload.map(function (item) { return ({
      volume: parseFloat(item.volume),
      close: parseFloat(item.close),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      open: parseFloat(item.open),
      date: new Date(item.date),
    }); });
  }

  function fixTicker(bookName, response) {
    var data = response.payload;
    var media = ((data.high - data.low) / 2) + parseFloat(data.low);
    var variation = (data.last * 100) / media;

    var sign = data.last > media ? '+' : '';
    var percent = ((data.last - media) * 100) / data.last;
    var parts = bookName.toUpperCase().split('_');

    return {
      time: moment(data.created_at).format('H:mm:ss'),
      vol: priceFormat(data.volume),
      max: formatNumber(bookName, data.high),
      min: formatNumber(bookName, data.low),
      vary: ("" + sign + (formatNumber(bookName, variation))),
      percent: percent.toFixed(2),
      source: parts[0],
      target: parts[1],
    };
  }

  function tradeInfo(bookName, item) {
    return {
      key: item.i,
      side: item.t ? 'sell' : 'buy',
      time: moment().format('H:mm:ss'),
      price: formatNumber(bookName, item.r),
      amount: priceFormat(item.a),
    };
  }

  function fixTrades(response) {
    return response.payload.map(function (item) { return ({
      key: item.tid,
      side: item.maker_side,
      time: moment(item.created_at).format('H:mm:ss'),
      price: formatNumber(item.book, item.price),
      amount: priceFormat(item.amount),
    }); });
  }

  function orderInfo(item) {
    return {
      operation: item.t ? 'sell' : 'buy',
      timestamp: item.d,
      rate: item.r,
      amount: item.a,
      value: item.v,
      order: item.o,
    };
  }

  function fixItems(groupName, bookName, payload, offset, max) {
    return payload.map(function (item, key) {
      var width = item.amount / max * 100;

      if (width < 5) {
        width = '1px';
      } else if (width > 100) {
        width = '100%';
      } else {
        width = width + "%";
      }

      var newItem = {
        width: width,
        type: groupName,
        key: item.order,
        sum: fixedNumber(item.sum, 2),
        amount: priceFormat(item.amount),
        value: priceFormat(item.value || (item.price * item.amount)),
        price: formatNumber(item.book || bookName, item.rate || item.price),
        rate: parseFloat(item.rate || item.price),
        side: item.side || item.operation,
      };

      if (!newItem.key) {
        newItem.key = offset + key;
      }

      return newItem;
    });
  }

  function fixGroup(groupName, bookName, response) {
    var payload = response.payload[groupName];
    var offset = parseInt(response.payload.sequence, 10);
    var max = (_.maxBy(payload, 'amount') || {}).amount || 1;

    return fixItems(groupName, bookName, payload.reverse().slice(0, 15), offset, max);
  }

  function sumOrders(payload) {
    payload.forEach(function (item, key) {
      if (!key) {
        payload[key].sum = parseFloat(item.amount);
      } else {
        payload[key].sum = payload[key - 1].sum + parseFloat(item.amount);
      }
    });

    return payload;
  }

  function fixOrders(fieldName, bookName, response) {
    return ['asks', 'bids'].reduce(function (prev, cur) {
      prev[cur] = {
        data: sumOrders(fixGroup(cur, bookName, response)),
        sum: priceFormat(average(response.payload[cur], fieldName)),
      };

      return prev;
    }, {});
  }

  function mergeOrders(payload, orders) {
    var bids = orders.bids;
    var asks = orders.asks;

    if (asks || bids) {
      payload.map(function (item) {
        var target = item.operation === 'buy' ? asks : bids;

        if (item.type === 'open') {
          target.data.splice(_.sortedIndexBy(target.data, { price: item.price }, 'price'), 1, item);
        } else {
          target.data.splice(_.findIndex(target.data, ['order', item.order]), 1);
        }
      });

      ['asks', 'bids'].forEach(function (key) {
        orders[key].data = sumOrders(_.orderBy(taget.data, ['price'], ['asc']));
      });
    }

    return orders;
  }

  function fixBooks(response) {
    return response.payload.map(function (item) { return (Object.assign({}, item,
      {key: item.book,
      title: item.book.toUpperCase().replace('_', ' / ')})); });
  }

  function bookInfo(payload) {
    var prev = payload[0];
    var cur = payload[payload.length - 1];

    return {
      time: ((moment(prev.date).format('MMMM D')) + " - " + (moment(cur.date).format('MMMM D'))),
      data: payload,
      value: priceFormat(cur.value),
      diff: cur.value > prev.value ? 'up' : 'down',
    };
  }

  

  // const BASE_URL = 'https://api.bitso.com/v3';
  var BASE_URL = 'https://bitso-api-v3.herokuapp.com';
  var SOCKETS_URL = 'wss://ws.bitso.com';

  var API = function API() {
    var this$1 = this;

    this._cache = {
      books: [],
    };

    this._events = {};
    this._bookName = window.localStorage.BOOK_NAME || 'btc_mxn';

    this.fetchAll();

    this.on('changeBook', function (bookInfo$$1) {
      ['trades', 'orders', 'diff-orders'].forEach(function (event) {
        this$1.ws.send(JSON.stringify({ action: 'unsubscribe', book: this$1._bookName, type: event }));
        this$1.ws.send(JSON.stringify({ action: 'subscribe', book: bookInfo$$1.value, type: event }));
      });

      window.localStorage.BOOK_NAME = bookInfo$$1.value;

      this$1._bookName = bookInfo$$1.value;
      this$1.fetchData();
    });

    setTimeout(function () { return this$1.init(); }, 3000);
  };

  API.prototype.init = function init () {
      var this$1 = this;

    this.ws = new WebSocket(SOCKETS_URL);
    this.ws.onopen = function () {
      ['trades', 'orders', 'diff-orders'].forEach(function (event) {
        this$1.ws.send(JSON.stringify({ action: 'subscribe', book: this$1._bookName, type: event }));
      });
    };

    this.ws.onmessage = _.debounce(function (message) {
      var data$$1 = JSON.parse(message.data);

      if (data$$1.type === 'trades' && data$$1.payload) {
        data$$1.payload.forEach(function (item) {
          this$1._cache[data$$1.type].unshift(tradeInfo(this$1._bookName, item));
        });
      } else if (data$$1.type === 'diff-orders' && data$$1.payload) {
        var ordersKey = 'orders';

        ['asks', 'bids'].forEach(function (key) {
          this$1._cache[ordersKey][key] = mergeOrders(data$$1.payload[key], this$1._cache[ordersKey][key]);
        });
      } else if (data$$1.type === 'orders' && data$$1.payload) {
        ['asks', 'bids'].forEach(function (key) {
          data$$1.payload[key] = sumOrders(data$$1.payload[key].map(orderInfo));
        });

        this$1._cache[data$$1.type] = fixOrders('rate', this$1._bookName, data$$1);
      }

      this$1.emit(data$$1.type, this$1._cache[data$$1.type]);
    }, 200);
  };

  API.prototype.on = function on (event, callback) {
    if (!this._events[event]) {
      this._events[event] = [];
    }

    if (this._cache[event]) {
      callback(this._cache[event]);
    }

    this._events[event].push(_.debounce(callback, 200));
  };

  API.prototype.emit = function emit (event) {
      var args = [], len = arguments.length - 1;
      while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    if (this._events[event]) {
      this._events[event].forEach(function (cb) { return cb.apply(void 0, args); });
    }
  };

  API.prototype.fetchAll = function fetchAll () {
      var this$1 = this;

    this.resolve('books', this.getBooks().then(function (response) {
      return Promise.all(response.payload.map(function (item, key) {
        return this$1.getMarkets(item.book, '1month')
          .then(function (result) { return Object.assign(response.payload[key], bookInfo(result.slice(0, 30))); });
      }))
      .then(function () { return fixBooks(response); });
    }));

    this.fetchData();
  };

  API.prototype.fetchData = function fetchData () {
      var this$1 = this;

    this.resolve('markets', this.getMarkets(this._bookName, '1year').then(fixMarkets));
    this.resolve('trades', this.getTrades(this._bookName).then(fixTrades));
    this.resolve('ticker', this.getTicker(this._bookName).then(function (response) { return fixTicker(this$1._bookName, response); }));
    this.resolve('orders', this.getOrders(this._bookName).then(function (response) { return fixOrders('price', this$1._bookName, response); }));
  };

  API.prototype.resolve = function resolve (event, deferred) {
      var this$1 = this;

    deferred.then(function (result) {
      this$1.emit(event, result);
      this$1._cache[event] = result;
    });
  };

  API.prototype.getURL = function getURL (path) {
    return ("" + BASE_URL + path);
  };

  API.prototype.getData = function getData (group, params) {
    var path = "/" + group;
    var url = this.getURL(path);

    return getJSON(url, params);
  };

  API.prototype.getBooks = function getBooks () {
    return this.getData('api/available_books');
  };

  API.prototype.getTrades = function getTrades (book) {
    return this.getData('api/trades', { book: book, limit: 30 });
  };

  API.prototype.getOrders = function getOrders (book) {
    return this.getData('api/order_book', { book: book, aggregate: true });
  };

  API.prototype.getTicker = function getTicker (book) {
    return this.getData('api/ticker', { book: book });
  };

  API.prototype.getMarkets = function getMarkets (book, timeframe) {
    return this.getData(("trade/chartJSON/" + book + "/" + timeframe));
  };

  var Bitso = {
    API: API,
  };

  

  window.process = {
    env: {
      NODE_ENV: 'production',
    },
  };

  var load = document.currentScript.import;

  load([
    '//unpkg.com/prop-types@15.5.10/prop-types.js',
    '//unpkg.com/react@16.3.1/umd/react.development.js',
    '//unpkg.com/react-dom@16.3.1/umd/react-dom.development.js',
    '//unpkg.com/react-transition-group@2.3.1/dist/react-transition-group.js',
    '//unpkg.com/classnames@2.2.5/index.js',
    '//unpkg.com/d3-array@1.2.1/build/d3-array.js',
    '//unpkg.com/d3-scale@2.0.0/dist/d3-scale.js' ]);

  load([
    '//unpkg.com/moment@2.22.0/moment.js',
    '//unpkg.com/moment@2.22.0/locale/es.js',
    '//unpkg.com/numeral@2.0.6/numeral.js',
    '//unpkg.com/lodash@4.17.10/lodash.js' ]).then(function () {
    window.Bitso = Bitso;
    window.Bitso.API = new Bitso.API();
  });

  load([
    'widgets/charts',
    'widgets/main' ], function (resolvedWidgets) {
    Object.assign(window.Bitso, resolvedWidgets);
  });

  document.currentScript.exports = {
    init: function init(node, context) {
      if (context.widget) {
        var widgetId = context.widget;
        var widgetName = "" + (widgetId[0].toUpperCase()) + (widgetId.substr(1)) + "Widget";
        var widgetResource = widgetId + "-widget/main";

        load(widgetResource)
          .then(function (exportedComponents) {
            if (!window.Bitso[widgetName]) {
              Object.assign(window.Bitso, exportedComponents);
            }

            ReactDOM.render(React.createElement(window.Bitso[widgetName], context), node);
          });
      }
    },
  };

})));
