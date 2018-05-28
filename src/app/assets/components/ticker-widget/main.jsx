import { formatNumber, priceFormat } from '../_/util';

function parseInfo(data) {
  const media = ((data.high - data.low) / 2) + parseFloat(data.low);
  const variation = (data.last * 100) / media;

  const sign = data.last > media ? '+' : '';
  const percent = ((data.last - media) * 100) / data.last;
  const parts = data.book.toUpperCase().split('_');

  return {
    time: moment(data.created_at).format('H:mm:ss'),
    vol: priceFormat(data.volume),
    max: formatNumber(data.book, data.high),
    min: formatNumber(data.book, data.low),
    vary: `${sign}${formatNumber(data.book, variation)}`,
    percent: percent.toFixed(2),
    source: parts[0],
    target: parts[1],
  };
}

class TickerWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    this.updateTicker();
  }

  updateTicker() {
    const book = 'btc_mxn';

    Bitso.API.getTicker(book)
      .then(result => {
        this.setState({
          loading: false,
          ticker: parseInfo(result.payload),
        });

        setTimeout(() => this.updateTicker(), 60000);
      });
  }

  render() {
    const { loading, ticker } = this.state;

    if (loading) {
      return (
        <div className='flex push'>
          <span>Cargando...</span>
        </div>
      );
    }

    return (
      <div className='flex push'>
        <span>Volumen 24 h <span className='light'>{ticker.vol} {ticker.source}</span></span>
        <span>Máx. <span className='light'>{ticker.max} {ticker.target}</span></span>
        <span>Mín. <span className='light'>{ticker.min} {ticker.target}</span></span>
        <span>Variación <span className='light'>{ticker.vary} {ticker.target} ({ticker.percent} %)</span></span>
      </div>
    );
  }
}

document.currentScript.exports = {
  TickerWidget,
};
