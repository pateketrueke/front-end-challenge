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

export function getJSON(params, parseData) {
  const query = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return fetch(`https://api.bitso.com/v3/trades/?${query}`)
    .then(resp => resp.json())
    .then(data => parseData(data.payload));
}
