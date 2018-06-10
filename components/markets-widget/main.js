(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () {

  var MarketsWidget = (function (superclass) {
    function MarketsWidget(props) {
      superclass.call(this, props);
      this.state = {
        loading: true,
        books: [],
      };
    }

    if ( superclass ) MarketsWidget.__proto__ = superclass;
    MarketsWidget.prototype = Object.create( superclass && superclass.prototype );
    MarketsWidget.prototype.constructor = MarketsWidget;

    MarketsWidget.prototype.componentDidMount = function componentDidMount () {
      var this$1 = this;

      Bitso.API.on('books', function (payload) {
        this$1.setState({
          loading: false,
          books: payload,
        });
      });
    };

    MarketsWidget.prototype.render = function render () {
      var ref = this.state;
      var books = ref.books;
      var loading = ref.loading;

      return (
        React.createElement( 'div', { className: 'content no-sel' },
          React.createElement( Bitso.CustomList, {
            itemRender: function (props) { return (
              React.createElement( 'div', null,
                React.createElement( 'div', { className: 'item flex', onClick: props.itemToggle },
                  React.createElement( 'span', { className: 'hi auto' }, props.title),
                  React.createElement( 'span', { className: props.diff }, props.value)
                ),
                props.selected && (
                  React.createElement( 'div', null,
                    React.createElement( 'small', { className: 'float-right' }, props.time),
                    React.createElement( Bitso.LineChart, { shown: props.diff, type: 'lines', data: props.data })
                  )
                )
              )
            ); }, caption: 'Mercados 30 días', loading: loading, data: books })
        )
      );
    };

    return MarketsWidget;
  }(React.Component));

  document.currentScript.exports = {
    MarketsWidget: MarketsWidget,
  };

})));
