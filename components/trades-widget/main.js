(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () {

  var TradesWidget = (function (superclass) {
    function TradesWidget(props) {
      superclass.call(this, props);
      this.state = {
        loading: true,
      };
    }

    if ( superclass ) TradesWidget.__proto__ = superclass;
    TradesWidget.prototype = Object.create( superclass && superclass.prototype );
    TradesWidget.prototype.constructor = TradesWidget;

    TradesWidget.prototype.componentDidMount = function componentDidMount () {
      var this$1 = this;

      Bitso.API.on('trades', function (payload) {
        this$1.setState({
          loading: false,
          trades: payload,
        });
      });
    };

    TradesWidget.prototype.render = function render () {
      var currencies = Bitso.API._bookName.toUpperCase().split('_');

      var ref = this.state;
      var loading = ref.loading;
      var trades = ref.trades;

      return (
        React.createElement( Bitso.CustomTable, {
          fields: [
            { key: 'time', label: 'Hora', align: 'left' },
            { key: 'price', label: 'Precio', align: 'right', classes: 'coin', currency: currencies[1] },
            { key: 'amount', label: 'Monto', align: 'right', classes: 'coin', currency: currencies[0] } ], caption: 'Últimos trades', loading: loading, data: trades })
      );
    };

    return TradesWidget;
  }(React.Component));

  document.currentScript.exports = {
    TradesWidget: TradesWidget,
  };

})));
