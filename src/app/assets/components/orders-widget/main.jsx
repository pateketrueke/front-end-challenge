import { fixedNumber, formatNumber, priceFormat } from '../_/util';

function parseInfo(item) {
  return {
    key: item.order,
    sum: fixedNumber(item.sum, 2),
    amount: priceFormat(item.amount),
    value: priceFormat(item.value || (item.price * item.amount)),
    price: formatNumber(item.book, item.rate || item.price),
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
    };
  }

  componentDidMount() {
    const book = 'btc_mxn';

    Bitso.API.getOrders(book)
      .then(result => {
        this.setState({
          loading: false,
          orders: result.payload,
          data: parseData(result.payload.sequence, result.payload[this.props.group], { book }),
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
        this.setState({
          data: parseData(sequence, result, { book }),
        });
      }
    });
  }

  render() {
    const { loading, data } = this.state;

    return (
      <Bitso.CustomTable
        fields={[
          { key: 'sum', label: 'SUM', align: 'right' },
          { key: 'amount', label: 'Monto', align: 'right', classes: 'coin btc' },
          { key: 'value', label: 'Valor', align: 'right', classes: 'coin mxn' },
          { key: 'price', label: 'Precio', align: 'right', classes: 'coin mxn' },
        ]}
        className={this.props.group === 'bids' ? 'ordered' : 'inverted'}
        captionRender={(
          <span className='coin mxn'>
            <span className={`kind ${this.props.group}`}>N</span>
          </span>
        )}
        caption={this.props.group === 'bids' ? 'Posturas de compra' : 'Posturas de venta'}
        loading={loading}
        data={data}
      />
    );
  }
}

document.currentScript.exports = {
  OrdersWidget,
};
