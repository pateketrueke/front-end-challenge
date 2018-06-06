class ChartsWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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

  render() {
    const { bids, asks, data, loading } = this.state;

    if (loading) {
      return (
        <div>
          <span>Cargando...</span>
        </div>
      );
    }

    // FIXME: turn menu(s) into a Component and reuse it!
    return (
      <div className='v-flex'>
        <div>
          <div className='pad flex'>
            <div className='auto flex'>
              <div className='push menu'>
                <span className='menu-pin'>
                  <i className='x-icon_candles'/>
                </span>
                <ul className='menu-sub reset no-type no-wrap'>
                  <li><a href='#'><i className='x-icon_candles'/></a></li>
                  <li><a href='#'><i className='x-icon_deep'/></a></li>
                </ul>
              </div>
              <div className='push menu'>
                <span className='menu-lb'>Periodo</span>
                <span className='menu-pin'>B</span>
                <ul className='menu-sub reset no-type no-wrap'>
                  <li><a href='#'>ITEM</a></li>
                  <li><a href='#'>ITEM</a></li>
                </ul>
              </div>
              <div className='menu'>
                <span className='menu-lb'>Intervalo</span>
                <span className='menu-pin'>C</span>
                <ul className='menu-sub reset no-type no-wrap'>
                  <li><a href='#'>ITEM</a></li>
                  <li><a href='#'>ITEM</a></li>
                </ul>
              </div>
            </div>
            <div className='round menu flex'>
              <button>-</button>
              <button>+</button>
            </div>
          </div>
        </div>
        <div className='auto flex'>
          <Bitso.CandleChart data={data} />
          {/*<Bitso.DeepChart asks={asks} bids={bids} />*/}
        </div>
      </div>
    );
  }
}

document.currentScript.exports = {
  ChartsWidget,
};
