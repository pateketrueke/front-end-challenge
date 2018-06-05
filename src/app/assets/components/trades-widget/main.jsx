class TradesWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    Bitso.API.on('trades', payload => {
      this.setState({
        loading: false,
        trades: payload,
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
