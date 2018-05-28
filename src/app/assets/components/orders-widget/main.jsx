import { fixedNumber, formatNumber, priceFormat, average } from '../_/util';

function parseInfo(item) {
  let width;

  if (item.max) {
    width = item.amount / item.max * 100;

    if (width < 5) {
      width = '1px';
    } else if (width > 100) {
      width = '100%';
    } else {
      width = `${width}%`;
    }
  }

  return {
    width,
    key: item.order,
    sum: fixedNumber(item.sum, 2),
    amount: priceFormat(item.amount),
    value: priceFormat(item.value || (item.price * item.amount)),
    price: formatNumber(item.book, item.rate || item.price),
    side: item.side || item.operation,
  };
}

function parseData(offset, payload, itemInfo) {
  return payload.map((item, key) => {
    const data = parseInfo({
      ...itemInfo,
      ...item,
    });

    if (!data.key) {
      data.key = offset + key;
    }

    return data;
  });
}

function sumAll(payload) {
  payload.forEach((item, key) => {
    if (!key) {
      payload[key].sum = parseFloat(item.amount);
    } else {
      payload[key].sum = payload[key - 1].sum + parseFloat(item.amount);
    }
  });

  return payload;
}

function mergeData(sequence, payload, orders) {
  let { bids, asks } = orders;

  if (asks || bids) {
    payload.map(item => {
      const target = item.operation === 'buy'
        ? asks
        : bids;

      if (item.type === 'open') {
        target.splice(_.sortedIndexBy(target, { price: item.price }, 'price'), 1, item);
      } else {
        target.splice(_.findIndex(target, ['order', item.order]), 1);
      }
    });

    bids = sumAll(_.orderBy(bids, ['price'], ['asc']));
    asks = sumAll(_.orderBy(asks, ['price'], ['desc']));
  }

  return { bids, asks };
}

class OrdersWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      orders: {},
      data: [],
      sum: 0,
    };
  }

  componentDidMount() {
    const book = 'btc_mxn';

    Bitso.API.getOrders(book)
      .then(result => {
        const data = result.payload[this.props.group].slice(0, 50);
        const max = (_.maxBy(data, 'amount') || {}).amount || 1;

        this.setState({
          loading: false,
          orders: result.payload,
          data: parseData(result.payload.sequence, data, { book, max }),
          sum: priceFormat(average(data, 'price')),
        });
      });

    Bitso.API.on('orders', payload => {
      this.setState({
        orders: payload,
      });
    });

    Bitso.API.on('diff', (sequence, payload) => {
      const result = mergeData(sequence, payload, this.state.orders)[this.props.group];

      if (result) {
        const data = this.state.orders[this.props.group].slice(0, 50);
        const max = (_.maxBy(data, 'amount') || {}).amount || 1;

        this.setState({
          data: parseData(sequence, result, { book, max }),
          sum: priceFormat(average(data, 'rate')),
        });
      }
    });
  }

  render() {
    const { loading, data, sum } = this.state;

    return (
      <Bitso.CustomTable
        fields={[
          { key: 'sum', label: 'SUM', align: 'right' },
          { key: 'amount', label: 'Monto', align: 'right', classes: 'coin btc' },
          { key: 'value', label: 'Valor', align: 'right', classes: 'coin mxn' },
          { key: 'price', label: 'Precio', align: 'right', classes: 'coin mxn' },
        ]}
        className={this.props.group === 'bids' ? 'left' : 'right'}
        titleRender={(
          <span className='coin mxn'>
            <span className={`type ${this.props.group}`}>${sum}</span>
          </span>
        )}
        caption={this.props.group === 'bids' ? 'Posturas de compra' : 'Posturas de venta'}
        grouping={this.props.group}
        loading={loading}
        data={data}
      />
    );
  }
}

document.currentScript.exports = {
  OrdersWidget,
};
