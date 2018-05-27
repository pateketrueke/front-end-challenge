const parseData = payload => {
  return payload.map(item => ({
    amount: item.amount,
    value: item.value,
    price: item.rate,
    key: item.order,
    sum: '-',
  }));
};

class OrdersWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
    };
  }

  componentDidMount() {
    Bitso.API.on('orders', () => {
      this.setState({
        loading: false,
        data: parseData(Bitso.API[this.props.group]),
      });
    });
  }

  render() {
    const { loading, data } = this.state;

    return (
      <Bitso.CustomTable
        fields={[
          { key: 'sum', label: 'SUM', align: 'right' },
          { key: 'amount', label: 'Monto', align: 'right', classes: 'coin btc' },
          { key: 'value', label: 'Valor', align: 'right', classes: 'coin mxn' },
          { key: 'price', label: 'Precio', align: 'right', classes: 'coin mxn' },
        ]}
        className={this.props.group === 'bids' ? 'ordered' : 'inverted'}
        captionRender={(
          <span className='coin mxn'>
            <span className={`kind ${this.props.group.substr(0, 3)}`}>N</span>
          </span>
        )}
        caption={this.props.group === 'bids' ? 'Posturas de compra' : 'Posturas de venta'}
        loading={loading}
        data={data}
      />
    );
  }
}

document.currentScript.exports = {
  OrdersWidget,
};
