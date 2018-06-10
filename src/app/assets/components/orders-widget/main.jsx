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
    const currencies = Bitso.API._bookName.toUpperCase().split('_');

    const { loading, data, sum } = this.state;

    return (
      <Bitso.CustomTable
        fields={[
          { key: 'sum', label: 'SUM', align: 'right' },
          { key: 'amount', label: 'Monto', align: 'right', classes: 'coin', currency: currencies[0] },
          { key: 'value', label: 'Valor', align: 'right', classes: 'coin', currency: currencies[1] },
          { key: 'price', label: 'Precio', align: 'right', classes: 'coin', currency: currencies[1] },
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
