import { average, fixedNumber, formatNumber, priceFormat } from './util';

/* global _, moment */

export function fixMarkets(payload) {
  return payload.map(item => ({
    volume: parseFloat(item.volume),
    close: parseFloat(item.close),
    high: parseFloat(item.high),
    low: parseFloat(item.low),
    open: parseFloat(item.open),
    date: new Date(item.date),
  }));
}

export function fixTicker(bookName, response) {
  const data = response.payload;
  const media = ((data.high - data.low) / 2) + parseFloat(data.low);
  const variation = (data.last * 100) / media;

  const sign = data.last > media ? '+' : '';
  const percent = ((data.last - media) * 100) / data.last;
  const parts = bookName.toUpperCase().split('_');

  return {
    time: moment(data.created_at).format('H:mm:ss'),
    vol: priceFormat(data.volume),
    max: formatNumber(bookName, data.high),
    min: formatNumber(bookName, data.low),
    vary: `${sign}${formatNumber(bookName, variation)}`,
    percent: percent.toFixed(2),
    source: parts[0],
    target: parts[1],
  };
}

export function tradeInfo(bookName, item) {
  return {
    key: item.i,
    side: item.t ? 'sell' : 'buy',
    time: moment().format('H:mm:ss'),
    price: formatNumber(bookName, item.r),
    amount: priceFormat(item.a),
  };
}

export function fixTrades(response) {
  return response.payload.map(item => ({
    key: item.tid,
    side: item.maker_side,
    time: moment(item.created_at).format('H:mm:ss'),
    price: formatNumber(item.book, item.price),
    amount: priceFormat(item.amount),
  }));
}

export function orderInfo(item) {
  return {
    operation: item.t ? 'sell' : 'buy',
    timestamp: item.d,
    rate: item.r,
    amount: item.a,
    value: item.v,
    order: item.o,
  };
}

export function fixItems(groupName, bookName, payload, offset, max) {
  return payload.map((item, key) => {
    let width = item.amount / max * 100;

    if (width < 5) {
      width = '1px';
    } else if (width > 100) {
      width = '100%';
    } else {
      width = `${width}%`;
    }

    const newItem = {
      width,
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

export function fixGroup(groupName, bookName, response) {
  const payload = response.payload[groupName];
  const offset = parseInt(response.payload.sequence, 10);
  const max = (_.maxBy(payload, 'amount') || {}).amount || 1;

  return fixItems(groupName, bookName, payload.slice(0, 15), offset, max);
}

export function fixOrders(bookName, response) {
  return ['asks', 'bids'].reduce((prev, cur) => {
    prev[cur] = {
      data: fixGroup(cur, bookName, response),
      sum: average(response.payload[cur], 'price'),
    };

    return prev;
  }, {});
}

export function sumOrders(payload) {
  payload.forEach((item, key) => {
    if (!key) {
      payload[key].sum = parseFloat(item.amount);
    } else {
      payload[key].sum = payload[key - 1].sum + parseFloat(item.amount);
    }
  });

  return payload;
}

export function mergeOrders(payload, orders) {
  const { bids, asks } = orders;

  if (asks || bids) {
    payload.map(item => {
      const target = item.operation === 'buy' ? asks : bids;

      if (item.type === 'open') {
        target.data.splice(_.sortedIndexBy(target.data, { price: item.price }, 'price'), 1, item);
      } else {
        target.data.splice(_.findIndex(target.data, ['order', item.order]), 1);
      }
    });

    ['asks', 'bids'].forEach(key => {
      orders[key].data = sumOrders(_.orderBy(taget.data, ['price'], ['asc']));
    });
  }

  return orders;
}

export function fixBooks(response) {
  return response.payload.map(item => ({
    ...item,
    key: item.book,
    title: item.book.toUpperCase().replace('_', ' / '),
  }));
}

export function bookInfo(payload) {
  const prev = payload[0];
  const cur = payload[payload.length - 1];

  return {
    time: `${moment(prev.date).format('MMMM D')} - ${moment(cur.date).format('MMMM D')}`,
    data: payload,
    value: priceFormat(cur.value),
    diff: cur.value > prev.value ? 'up' : 'down',
  };
}

export default {
  fixMarkets,
  fixTicker,
  tradeInfo,
  fixTrades,
  orderInfo,
  fixOrders,
  sumOrders,
  mergeOrders,
  fixBooks,
  bookInfo,
};
