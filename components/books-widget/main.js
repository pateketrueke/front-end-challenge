(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () {

  var BooksWidget = (function (superclass) {
    function BooksWidget(props) {
      superclass.call(this, props);
      this.state = {
        books: [],
        loading: true,
        currentBook: {
          value: Bitso.API._bookName,
          label: Bitso.API._bookName.toUpperCase().split('_').join(' / '),
        },
      };
    }

    if ( superclass ) BooksWidget.__proto__ = superclass;
    BooksWidget.prototype = Object.create( superclass && superclass.prototype );
    BooksWidget.prototype.constructor = BooksWidget;

    BooksWidget.prototype.componentDidMount = function componentDidMount () {
      var this$1 = this;

      Bitso.API.on('books', function (payload) {
        if (payload.length) {
          this$1.setState({
            loading: false,
            books: payload.map(function (bookinfo) { return ({
              value: bookinfo.book,
              label: bookinfo.title,
            }); }),
          });
        }
      });
    };

    BooksWidget.prototype.changeBook = function changeBook (bookInfo) {
      this.setState({
        currentBook: bookInfo,
      });

      Bitso.API.emit('changeBook', bookInfo);
    };

    BooksWidget.prototype.render = function render () {
      var this$1 = this;

      var ref = this.state;
      var currentBook = ref.currentBook;
      var loading = ref.loading;
      var books = ref.books;

      if (loading) {
        return (
          React.createElement( 'div', { className: 'pad' }, "...")
        );
      }

      return (
        React.createElement( Bitso.Menu, {
          items: this.state.books, value: Bitso.API._bookName, renderValue: function () { return currentBook.label; }, onChange: function (selectedItem) { return this$1.changeBook(selectedItem); } })
      );
    };

    return BooksWidget;
  }(React.Component));

  document.currentScript.exports = {
    BooksWidget: BooksWidget,
  };

})));
