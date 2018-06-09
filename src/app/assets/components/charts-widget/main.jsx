import Menu from '../_/Menu';

class ChartsWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isCandles: true,
      loading: true,
      data: [],
      bids: [],
      asks: [],
    };
  }

  componentDidMount() {
    Bitso.API.on('markets', payload => {
      this.setState({
        loading: false,
        data: payload,
      });
    });

    Bitso.API.on('orders', payload => {
      this.setState({
        loading: false,
        asks: payload.asks.data,
        bids: payload.bids.data,
      });
    });
  }

  selectChart(value) {
    this.setState({
      isCandles: value === 'candles',
    });
  }

  render() {
    const { bids, asks, data, loading, isCandles } = this.state;

    if (loading) {
      return (
        <div>
          <span>Cargando...</span>
        </div>
      );
    }

    return (
      <div className='v-flex'>
        <div>
          <div className='pad flex'>
            <div className='auto flex push'>
              <Menu
                unique
                value='candles'
                onChange={selectedItem => this.selectChart(selectedItem.value)}
                renderValue={currentValue => (
                  <i className={`x-icon_${currentValue}`}/>
                )}
                items={[
                  { label: <i className='x-icon_candles'/>, value: 'candles' },
                  { label: <i className='x-icon_deep'/>, value: 'deep' },
                ]}
              />
              {isCandles && (
                <Menu label='Periodo' value='3m' items={[
                  { label: 'Cada 3 días', value: '3d' },
                  { label: '1 semana', value: '1w' },
                  { label: '1 mes', value: '1m' },
                  { label: '3 meses', value: '3m' },
                  { label: '1 año', value: '1y' },
                ]} />
              )}
              {isCandles && (
                <Menu label='Intervalo' value='1h' items={[
                  { label: '1 hora', value: '1h' },
                  { label: '3 horas', value: '3h' },
                  { label: '12 horas', value: '12h' },
                  { label: '24 horas', value: '24h' },
                ]} />
              )}
            </div>
            {isCandles && (
              <div className='round menu flex'>
                <button>-</button>
                <button>+</button>
              </div>
            )}
          </div>
        </div>
        <div className='auto flex'>
          {isCandles && (
            <Bitso.CandleChart data={data} />
          )}
          {/*<Bitso.DeepChart asks={asks} bids={bids} />*/}
        </div>
      </div>
    );
  }
}

document.currentScript.exports = {
  ChartsWidget,
};
