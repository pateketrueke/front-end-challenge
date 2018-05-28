import { formatNumber, priceFormat } from '../_/util';
import { toggle } from '../_/actions';

function parseData(payload) {
  return payload.map(item => ({
    title: item.book.toUpperCase().replace('_', '/'),
    key: item.book,
  }));
}

function parseInfo(prev, cur) {
  return {
    time: cur.date,
    value: priceFormat(cur.value),
    diff: cur.value > prev.value ? 'up' : 'down',
  };
}

class MarketsWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      books: [],
    };
  }

  componentDidMount() {
    Bitso.API.getBooks()
      .then(result => {
        this.setState({
          loading: false,
          books: parseData(result.payload),
        });

        result.payload.forEach(item => {
          Bitso.API.getMarkets(item.book, '1month')
            .then(_result => {
              this.setState({
                books: this.state.books.map(_item => {
                  if (_item.key === item.book) {
                    Object.assign(_item, parseInfo(_result[0], _result[_result.length - 1]));
                  }

                  return _item;
                }),
              });
            });
        });
      })
  }

  render() {
    const { books, loading } = this.state;

    return (
      <div className='content'>
        <Bitso.CustomList
          itemRender={props => (
            <div>
              <div className='flex'>
                <span className='hi auto'>{props.title}</span>
                <span className={props.diff}>{props.value}</span>
              </div>
              {props.selected && (
                <div>
                  <small className='float-right'>{props.time}</small>
                  <img className='fit' src='//placehold.it/260x80/161a1e/fff' />
                </div>
              )}
            </div>
          )}
          caption='Mercados 24 h'
          loading={loading}
          data={books}
        />
      </div>
    );
  }
}

document.currentScript.exports = {
  MarketsWidget,
};
