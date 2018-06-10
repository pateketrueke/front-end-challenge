(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () {

  var TickerWidget = (function (superclass) {
    function TickerWidget(props) {
      superclass.call(this, props);
      this.state = {
        loading: true,
      };
    }

    if ( superclass ) TickerWidget.__proto__ = superclass;
    TickerWidget.prototype = Object.create( superclass && superclass.prototype );
    TickerWidget.prototype.constructor = TickerWidget;

    TickerWidget.prototype.componentDidMount = function componentDidMount () {
      var this$1 = this;

      Bitso.API.on('ticker', function (payload) {
        this$1.setState({
          loading: false,
          ticker: payload,
        });
      });
    };

    TickerWidget.prototype.render = function render () {
      var ref = this.state;
      var loading = ref.loading;
      var ticker = ref.ticker;

      if (loading) {
        return (
          React.createElement( 'div', { className: 'flex push' },
            React.createElement( 'span', null, "Cargando..." )
          )
        );
      }

      return (
        React.createElement( 'div', { className: 'flex push' },
          React.createElement( 'span', null, "Volumen 24 h ", React.createElement( 'span', { className: 'light' }, ticker.vol, " ", ticker.source) ),
          React.createElement( 'span', null, "Máx. ", React.createElement( 'span', { className: 'light' }, ticker.max, " ", ticker.target) ),
          React.createElement( 'span', null, "Mín. ", React.createElement( 'span', { className: 'light' }, ticker.min, " ", ticker.target) ),
          React.createElement( 'span', null, "Variación ", React.createElement( 'span', { className: 'light' }, ticker.vary, " ", ticker.target, " (", ticker.percent, " %)") )
        )
      );
    };

    return TickerWidget;
  }(React.Component));

  document.currentScript.exports = {
    TickerWidget: TickerWidget,
  };

})));
