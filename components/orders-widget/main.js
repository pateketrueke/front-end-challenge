(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () {

  var OrdersWidget = (function (superclass) {
    function OrdersWidget(props) {
      superclass.call(this, props);
      this.state = {
        loading: true,
        data: [],
        sum: 0,
      };
    }

    if ( superclass ) OrdersWidget.__proto__ = superclass;
    OrdersWidget.prototype = Object.create( superclass && superclass.prototype );
    OrdersWidget.prototype.constructor = OrdersWidget;

    OrdersWidget.prototype.componentDidMount = function componentDidMount () {
      var this$1 = this;

      Bitso.API.on('orders', function (payload) {
        this$1.setState(Object.assign({}, payload[this$1.props.group],
          {loading: false}));
      });
    };

    OrdersWidget.prototype.render = function render () {
      var currencies = Bitso.API._bookName.toUpperCase().split('_');

      var ref = this.state;
      var loading = ref.loading;
      var data = ref.data;
      var sum = ref.sum;

      return (
        React.createElement( Bitso.CustomTable, {
          fields: [
            { key: 'sum', label: 'SUM', align: 'right' },
            { key: 'amount', label: 'Monto', align: 'right', classes: 'coin', currency: currencies[0] },
            { key: 'value', label: 'Valor', align: 'right', classes: 'coin', currency: currencies[1] },
            { key: 'price', label: 'Precio', align: 'right', classes: 'coin', currency: currencies[1] } ], className: this.props.group === 'bids' ? 'left' : 'right', titleRender: (
            React.createElement( 'span', { className: 'coin mxn' },
              React.createElement( 'span', { className: ("type " + (this.props.group)) }, "$", sum)
            )
          ), caption: this.props.group === 'bids' ? 'Posturas de compra' : 'Posturas de venta', grouping: this.props.group, loading: loading, data: data })
      );
    };

    return OrdersWidget;
  }(React.Component));

  document.currentScript.exports = {
    OrdersWidget: OrdersWidget,
  };

})));
