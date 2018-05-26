import { formatNumber, priceFormat } from '../../_/util';
import { CustomTable } from '../../_/elements';

// FIXME: abstract as much as possible and reuse!

function parseData(payload) {
  return payload.map(item => ({
    is: item.maker_side === 'sell' ? 'up' : 'down',
    key: item.tid,
    time: moment(item.created_at).format('H:mm:ss'),
    price: formatNumber(item.book.split('_'), item.price),
    amount: priceFormat(item.amount),
  }));
}

function fetchData(book) {
  return fetch(`https://api.bitso.com/v3/trades/?book=${book}`)
    .then(resp => resp.json())
    .then(data => parseData(data.payload));
}

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    fetchData('btc_mxn')
      .then(result => {
        this.setState({
          trades: result,
          loading: false,
        });
      });
  }

  render() {
    const { loading, trades } = this.state;

    return (
      <CustomTable
        caption='Últimos trades'
        isLoading={loading}
        data={trades}
      />
    );
  }
}
