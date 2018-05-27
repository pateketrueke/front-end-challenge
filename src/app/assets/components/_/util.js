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

export function getQuery(params) {
  const query = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return query;
}

export function getJSON(url, params, callback) {
  return fetch(`${url}?${getQuery(params)}`)
    .then(resp => resp.json());
}
