class BooksWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      books: [],
      loading: true,
      currentBook: {
        value: Bitso.API._bookName,
        label: Bitso.API._bookName.toUpperCase().split('_').join(' / '),
      },
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
        });
      }
    });
  }

  changeBook(bookInfo) {
    this.setState({
      currentBook: bookInfo,
    });

    Bitso.API.emit('changeBook', bookInfo);
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
