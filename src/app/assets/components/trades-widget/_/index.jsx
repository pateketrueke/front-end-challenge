import Util from '../../_/Util';

// FIXME: abstract as much as possible and reuse!

function parseData(payload) {
  return payload.map(item => ({
    is: item.maker_side === 'sell' ? 'up' : 'down',
    key: item.tid,
    time: moment(item.created_at).format('H:mm:ss'),
    price: Util.formatNumber(item.book.split('_'), item.price),
    amount: Util.priceFormat(item.amount),
  }));
}

function fetchData(book) {
  return fetch(`https://api.bitso.com/v3/trades/?book=${book}`)
    .then(resp => resp.json())
    .then(data => parseData(data.payload));
}

function save(target) {
  return ref => {
    target.$el = ref;
  };
}

function toggle(props, target, className) {
  return e => {
    e.preventDefault();

    const offset = props.values.indexOf(target);

    if (offset !== -1) {
      props.unset(offset).$el.classList.remove(className);
      return;
    }

    props.set(target).$el.classList.add(className);
  };
}

function Highlight(props) {
  const suffix = Array.from({
    length: 11 - String(props.value).length
  }).join('0');

  const matches = String(props.value).match(/^(.+?)(0+)$/);

  if (!matches) {
    return (
      <span><span className='hi'>{props.value}</span>{suffix}</span>
    );
  }

  return (
    <span><span className='hi'>{matches[1]}</span>{matches[2]}{suffix}</span>
  );
}

function Table(props) {
  return (
    <div className='md-push v-scroll'>
      <table className='full-width' cellPadding={0} cellSpacing={0}>{props.children}</table>
    </div>
  );
}

function Caption({ isLoading }) {
  return (
    <caption className='pad caps align-left'>
      Últimos trades{isLoading ? '...' : ''}
    </caption>
  );
}

function Header(props) {
  return (
    <thead>
      <tr className='caps'>
        <th className='pad align-left'>Hora</th>
        <th className='pad align-right coin mxn'>Precio</th>
        <th className='pad align-right coin btc'>Monto</th>
      </tr>
    </thead>
  );
}

function Body(props) {
  if (props.isLoading) {
    return (
      <tbody><tr><td className='pad'>Cargando...</td></tr></tbody>
    )
  }

  return (
    <tbody>{props.items.map(item => (
      <tr key={item.key} ref={save(item)} onClick={toggle(props, item, 'sel')}>
        <td className='pad align-left'><span className='hi'>{item.time}</span></td>
        <td className='pad align-right'><span className={item.is}>{item.price}</span></td>
        <td className='pad align-right'><Highlight value={item.amount} /></td>
      </tr>
    ))}</tbody>
  );
}

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      selected: [],
    };
  }

  componentDidMount() {
    fetchData('btc_mxn')
      .then(result => {
        this.setState({
          trades: result,
          loading: false,
          selected: [],
        });
      });
  }

  unselectItem(offset) {
    const node = this.state.selected[offset];
    const copy = this.state.selected;

    copy.splice(offset, 1);

    this.setState({
      selected: copy,
    });

    return node;
  }

  selectItem(node) {
    const copy = this.state.selected;

    this.setState({
      selected: copy.concat(copy.indexOf(node) === -1 ? node : []),
    });

    return node;
  }

  render() {
    const { selected, loading, trades } = this.state;

    return (
      <Table>
        <Caption isLoading={loading} />
        <Header />
        <Body
          set={node => this.selectItem(node)}
          unset={offset => this.unselectItem(offset)}
          items={trades}
          values={selected}
          isLoading={loading}
        />
      </Table>
    );
  }
}
