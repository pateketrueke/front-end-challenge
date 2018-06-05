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

    return (
      <div className='v-flex'>
        <div>TOOLBAR</div>
        <div className='auto flex'>
          <Bitso.CandleChart data={data} />
          <Bitso.DeepChart asks={asks} bids={bids} />
        </div>
      </div>
    );
  }
}

document.currentScript.exports = {
  ChartsWidget,
};
