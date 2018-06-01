/* global _ */

import { formatNumber, priceFormat } from '../_/util';
import { toggle } from '../_/actions';

function parseData(payload) {
  return payload.map(item => ({
    title: item.book.toUpperCase().replace('_', ' / '),
    key: item.book,
  }));
}

function parseInfo(payload) {
  const prev = payload[0];
  const cur = payload[payload.length - 1];

  return {
    time: `${moment(prev.date).format('MMMM D')} - ${moment(cur.date).format('MMMM D')}`,
    data: payload,
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
                    Object.assign(_item, parseInfo(_result.slice(-30)));
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
      <div className='content no-sel'>
        <Bitso.CustomList
          itemRender={props => (
            <div>
              <div className='item flex' onClick={props.itemToggle}>
                <span className='hi auto'>{props.title}</span>
                <span className={props.diff}>{props.value}</span>
              </div>
              {props.selected && (
                <div>
                  <small className='float-right'>{props.time}</small>
                  <Bitso.LineChart shown={props.diff} type='lines' data={props.data}/>
                </div>
              )}
            </div>
          )}
          caption='Mercados 30 días'
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
