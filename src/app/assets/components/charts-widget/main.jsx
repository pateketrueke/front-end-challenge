class ChartsWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isCandles: true,
      hasError: false,
      loading: true,
      days: 365,
      pad: 1,
      data: [],
      bids: [],
      asks: [],
    };
  }

  componentDidMount() {
    Bitso.API.on('markets', payload => {
      if (this.state.isCandles) {
        this.setState({
          loading: false,
          data: payload,
        });
      }
    });

    Bitso.API.on('orders', payload => {
      if (!this.state.isCandles) {
        this.setState({
          loading: false,
          asks: payload.asks.data,
          bids: payload.bids.data,
        });
      }
    });
  }

  componentDidCatch() {
    this.setState({
      hasError: true,
    });
  }

  selectChart(value) {
    this.setState({
      isCandles: value === 'candles',
    });
  }

  setDays(value) {
    this.setState({
      days: value,
    });
  }

  setPad(value) {
    this.setState({
      pad: value,
    });
  }

  incDays() {
    this.setState({
      days: Math.min(365, this.state.days + Math.round(this.state.days * 2)),
    });
  }

  decDays() {
    this.setState({
      days: Math.max(0, this.state.days - Math.round(this.state.days / 2)),
    });
  }

  render() {
    const { bids, asks, data, loading, isCandles, hasError } = this.state;

    if (hasError) {
      return (
        <div>Oops!</div>
      );
    }

    if (loading) {
      return (
        <div className='pad'>
          <span>Cargando...</span>
        </div>
      );
    }

    return (
      <div className='v-flex'>
        <div>
          <div className='pad flex'>
            <div className='auto flex push'>
              <Bitso.Menu
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
                <Bitso.Menu
                  label='Periodo'
                  onChange={selectedItem => this.setDays(selectedItem.days)}
                  value='1y'
                  items={[
                    { label: '1 semana', value: '1w', days: 7 },
                    { label: '1 mes', value: '1m', days: 30 },
                    { label: '3 meses', value: '3m', days: 90 },
                    { label: '1 año', value: '1y' },
                  ]}
                />
              )}
              {isCandles && (
                <Bitso.Menu
                  onChange={selectedItem => this.setPad(selectedItem.pad)}
                  label='Intervalo'
                  value='24h'
                  items={[
                    { label: '24h', value: '24h', pad: 1 },
                    { label: 'Cada 3 días', value: '72h', pad: 3 },
                    { label: 'Cada 15 días', value: '15d', pad: 15 },
                  ]}
                />
              )}
            </div>
            {isCandles && (
              <div className='round menu flex'>
                <button
                  onClick={() => this.decDays()}
                  disabled={this.state.days === 1}
                ><i className='x-minus' />
                </button>
                <button
                  onClick={() => this.incDays()}
                  disabled={this.state.days === 365}
                ><i className='x-plus' />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className='auto flex'>
          {isCandles && (
            <Bitso.CandleChart data={data} pad={this.state.pad} days={this.state.days} />
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
