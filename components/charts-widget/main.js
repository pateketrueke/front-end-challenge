(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () {

  var ChartsWidget = (function (superclass) {
    function ChartsWidget(props) {
      superclass.call(this, props);
      this.state = {
        isCandles: true,
        hasError: false,
        loading: true,
        days: 365,
        pad: 1,
        data: [],
        bids: [],
        asks: [],
      };
    }

    if ( superclass ) ChartsWidget.__proto__ = superclass;
    ChartsWidget.prototype = Object.create( superclass && superclass.prototype );
    ChartsWidget.prototype.constructor = ChartsWidget;

    ChartsWidget.prototype.componentDidMount = function componentDidMount () {
      var this$1 = this;

      Bitso.API.on('markets', function (payload) {
        if (this$1.state.isCandles) {
          this$1.setState({
            loading: false,
            data: payload,
          });
        }
      });

      Bitso.API.on('orders', function (payload) {
        if (!this$1.state.isCandles) {
          this$1.setState({
            loading: false,
            asks: payload.asks.data,
            bids: payload.bids.data,
          });
        }
      });
    };

    ChartsWidget.prototype.componentDidCatch = function componentDidCatch () {
      this.setState({
        hasError: true,
      });
    };

    ChartsWidget.prototype.selectChart = function selectChart (value) {
      this.setState({
        isCandles: value === 'candles',
      });
    };

    ChartsWidget.prototype.setDays = function setDays (value) {
      this.setState({
        days: value,
      });
    };

    ChartsWidget.prototype.setPad = function setPad (value) {
      this.setState({
        pad: value,
      });
    };

    ChartsWidget.prototype.incDays = function incDays () {
      this.setState({
        days: Math.min(365, this.state.days + Math.round(this.state.days * 2)),
      });
    };

    ChartsWidget.prototype.decDays = function decDays () {
      this.setState({
        days: Math.max(0, this.state.days - Math.round(this.state.days / 2)),
      });
    };

    ChartsWidget.prototype.render = function render () {
      var this$1 = this;

      var ref = this.state;
      var bids = ref.bids;
      var asks = ref.asks;
      var data = ref.data;
      var loading = ref.loading;
      var isCandles = ref.isCandles;
      var hasError = ref.hasError;

      if (hasError) {
        return (
          React.createElement( 'div', null, "Oops!" )
        );
      }

      if (loading) {
        return (
          React.createElement( 'div', { className: 'pad' },
            React.createElement( 'span', null, "Cargando..." )
          )
        );
      }

      return (
        React.createElement( 'div', { className: 'v-flex' },
          React.createElement( 'div', null,
            React.createElement( 'div', { className: 'pad flex' },
              React.createElement( 'div', { className: 'auto flex push' },
                React.createElement( Bitso.Menu, {
                  unique: true, value: 'candles', onChange: function (selectedItem) { return this$1.selectChart(selectedItem.value); }, renderValue: function (currentValue) { return (
                    React.createElement( 'i', { className: ("x-icon_" + currentValue) })
                  ); }, items: [
                    { label: React.createElement( 'i', { className: 'x-icon_candles' }), value: 'candles' },
                    { label: React.createElement( 'i', { className: 'x-icon_deep' }), value: 'deep' } ] }),
                isCandles && (
                  React.createElement( Bitso.Menu, {
                    label: 'Periodo', onChange: function (selectedItem) { return this$1.setDays(selectedItem.days); }, value: '1y', items: [
                      { label: '1 semana', value: '1w', days: 7 },
                      { label: '1 mes', value: '1m', days: 30 },
                      { label: '3 meses', value: '3m', days: 90 },
                      { label: '1 año', value: '1y' } ] })
                ),
                isCandles && (
                  React.createElement( Bitso.Menu, {
                    onChange: function (selectedItem) { return this$1.setPad(selectedItem.pad); }, label: 'Intervalo', value: '24h', items: [
                      { label: '24h', value: '24h', pad: 1 },
                      { label: 'Cada 3 días', value: '72h', pad: 3 },
                      { label: 'Cada 15 días', value: '15d', pad: 15 } ] })
                )
              ),
              isCandles && (
                React.createElement( 'div', { className: 'round menu flex' },
                  React.createElement( 'button', {
                    onClick: function () { return this$1.decDays(); }, disabled: this.state.days === 1 }, React.createElement( 'i', { className: 'x-minus' })
                  ),
                  React.createElement( 'button', {
                    onClick: function () { return this$1.incDays(); }, disabled: this.state.days === 365 }, React.createElement( 'i', { className: 'x-plus' })
                  )
                )
              )
            )
          ),
          React.createElement( 'div', { className: 'auto flex' },
            isCandles && (
              React.createElement( Bitso.CandleChart, { data: data, pad: this.state.pad, days: this.state.days })
            )
            /*<Bitso.DeepChart asks={asks} bids={bids} />*/
          )
        )
      );
    };

    return ChartsWidget;
  }(React.Component));

  document.currentScript.exports = {
    ChartsWidget: ChartsWidget,
  };

})));
