class TickerWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    Bitso.API.on('ticker', payload => {
      this.setState({
        loading: false,
        ticker: payload,
      });
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
