class BooksWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      books: [],
      loading: true,
      currentBook: null,
    };
  }

  componentDidMount() {
    Bitso.API.on('books', payload => {
      if (payload.length) {
        this.setState({
          loading: false,
          books: payload.map(bookinfo => ({
            value: bookinfo.book,
            label: bookinfo.title,
          })),
          currentBook: {
            value: payload[0].book,
            label: payload[0].title,
          },
        });
      }
    });
  }

  changeBook(bookInfo) {
    this.setState({
      currentBook: bookInfo,
    });
  }

  render() {
    const { currentBook, loading, books } = this.state;

    if (loading) {
      return (
        <div className='pad'>...</div>
      );
    }

    return (
      <Bitso.Menu
        items={this.state.books}
        value={Bitso.API._bookName}
        renderValue={() => currentBook.label}
        onChange={selectedItem => this.changeBook(selectedItem)}
      />
    );
  }
}

document.currentScript.exports = {
  BooksWidget,
};
