class OrdersWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      sum: 0,
    };
  }

  componentDidMount() {
    Bitso.API.on('orders', payload => {
      this.setState({
        ...payload[this.props.group],
        loading: false,
      });
    });
  }

  render() {
    const { loading, data, sum } = this.state;

    return (
      <Bitso.CustomTable
        fields={[
          { key: 'sum', label: 'SUM', align: 'right' },
          { key: 'amount', label: 'Monto', align: 'right', classes: 'coin btc' },
          { key: 'value', label: 'Valor', align: 'right', classes: 'coin mxn' },
          { key: 'price', label: 'Precio', align: 'right', classes: 'coin mxn' },
        ]}
        className={this.props.group === 'bids' ? 'left' : 'right'}
        titleRender={(
          <span className='coin mxn'>
            <span className={`type ${this.props.group}`}>${sum}</span>
          </span>
        )}
        caption={this.props.group === 'bids' ? 'Posturas de compra' : 'Posturas de venta'}
        grouping={this.props.group}
        loading={loading}
        data={data}
      />
    );
  }
}

document.currentScript.exports = {
  OrdersWidget,
};
