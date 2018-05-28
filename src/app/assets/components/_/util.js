/* global numeral */

export function priceFormat(number) {
  if (number < 1) {
    return numeral(number).format('0.00000000');
  }

  return numeral(number).format('0,0.00');
}

export function formatNumber(values, number) {
  const value = priceFormat(number);

  if (values.indexOf('mxn') === -1) {
    return value;
  }

  return `$${value}`;
}

export function fixedNumber(value, length) {
  return parseFloat(value || 0).toFixed(length);
}

export function getQuery(params) {
  const query = Object.keys(params)
    .map(key => (
      typeof params[key] !== 'undefined'
        ? `${key}=${params[key]}`
        : undefined
    ))
    .filter(Boolean)
    .join('&');

  return query;
}

export function getJSON(url, params) {
  return fetch(`${url}?${getQuery(params)}`)
    .then(resp => resp.json());
}

export function average(values, property) {
  return values.reduce((prev, cur) => prev + parseFloat(cur[property]), 0) / values.length;
}

export function throttle(func, limit) {
  let inThrottle;

  return function $throttled() {
    const args = arguments;
    const context = this;

    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit || 200);
    }
  };
}
