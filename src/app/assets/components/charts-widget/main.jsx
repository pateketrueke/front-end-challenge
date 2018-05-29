class ChartsWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
    };
  }

  componentDidMount() {
    const book = 'btc_mxn';
    const range = '1month';

    Bitso.API.getMarkets(book, range)
      .then(_result => {
        this.setState({
          loading: false,
          data: _result,
        });
      });
  }

  render() {
    const { data, loading } = this.state;

    if (loading) {
      return (
        <div>
          <span>Cargando...</span>
        </div>
      );
    }

    return (
      <Bitso.CandleChart data={data}/>
    );
  }
}

document.currentScript.exports = {
  ChartsWidget,
};
