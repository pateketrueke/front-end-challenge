export function priceFormat(number) {
  if (number < 1) {
    return numeral(number).format('0.00000000');
  }

  return numeral(number).format('0,0.00');
};

export function formatNumber(values, number) {
  const value = priceFormat(number);

  if (values[1] !== 'mxn') {
    return value;
  }

  return `$${value}`;
};

export default {
  priceFormat,
  formatNumber,
};
