import Util from '../../_/Util';

function parseData(payload) {
  return payload.map(item => ({
    className: item.marker_side ? 'up' : 'down',
    time: moment(item.created_at).format('H:mm:ss'),
    price: Util.formatNumber(item.book.split('_'), item.price),
    amount: Util.priceFormat(item.amount),
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
        console.log('>>>', result);

        this.setState({
          loading: false,
          trades: result,
        });
      });
  }

  render() {
    const { loading } = this.state;

    if (loading) {
      return <div>Cargando últimos trades...</div>;
    }

    return <div>WIP</div>;
  }
}
