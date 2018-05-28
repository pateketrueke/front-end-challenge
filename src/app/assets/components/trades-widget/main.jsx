import { formatNumber, priceFormat } from '../_/util';

function parseData(payload) {
  return payload.map(item => ({
    key: item.tid,
    side: item.maker_side,
    time: moment(item.created_at).format('H:mm:ss'),
    price: formatNumber(item.book, item.price),
    amount: priceFormat(item.amount),
  }));
}

function parseInfo(item) {
  return {
    key: item.identifier,
    side: item.operation,
    time: moment().format('H:mm:ss'),
    price: formatNumber(item.book, item.rate),
    amount: priceFormat(item.amount),
  };
}

class TradesWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    const book = 'btc_mxn';

    Bitso.API.getTrades(book)
      .then(result => {
        this.setState({
          loading: false,
          trades: parseData(result.payload),
        });
      });

    Bitso.API.on('trades', payload => {
      payload.forEach(trade => {
        const tradeInfo = parseInfo({
          ...trade,
          book,
        });

        this.setState({
          trades: [tradeInfo].concat(this.state.trades).slice(0, 50),
        })
      });
    });
  }

  render() {
    const { loading, trades } = this.state;

    return (
      <Bitso.CustomTable
        fields={[
          { key: 'time', label: 'Hora', align: 'left' },
          { key: 'price', label: 'Precio', align: 'right', classes: 'coin mxn' },
          { key: 'amount', label: 'Monto', align: 'right', classes: 'coin btc' },
        ]}
        caption='Últimos trades'
        loading={loading}
        data={trades}
      />
    );
  }
}

document.currentScript.exports = {
  TradesWidget,
};
