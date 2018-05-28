import { formatNumber, priceFormat } from '../_/util';
import { toggle } from '../_/actions';

function parseData(payload) {
  return payload.map(item => ({
    title: item.book.toUpperCase().replace('_', '/'),
    maxa: item.maximum_amount,
    maxp: item.maximum_price,
    maxv: item.maximum_value,
    mina: item.minimum_amount,
    minp: item.minimum_price,
    minv: item.minimum_value,
    key: item.book,
  }));
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
      });
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
                <span className='down'>{props.maxp}</span>
              </div>
              {props.selected && (
                <div>
                  <small className='float-right'>10:23 AM</small>
                  <img className='fit' src='//placehold.it/260x80/161a1e/fff' />
                </div>
              )}
            </div>
          )}
          caption='Mercados 24 h'
          loading={loading}
          data={books}
        ></Bitso.CustomList>
      </div>
    );
  }
}

document.currentScript.exports = {
  MarketsWidget,
};
