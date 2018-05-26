import { save, toggle } from './actions';

export function Highlight(props) {
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

export function Table(props) {
  return (
    <div className='md-push v-scroll' data-scrollable='tbody'>
      <table className='full-width' cellPadding={0} cellSpacing={0}>{props.children}</table>
    </div>
  );
}

export function Caption({ caption, isLoading }) {
  return (
    <caption className='pad caps align-left'>
      {caption}{isLoading ? '...' : ''}
    </caption>
  );
}

export function Header(props) {
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

export function Body(props) {
  if (props.isLoading) {
    return (
      <tbody><tr><td className='pad'>Cargando...</td></tr></tbody>
    );
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

export class CustomTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: [],
    };
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
    const { data, caption, isLoading } = this.props;

    return (
      <Table>
        <Caption caption={caption} isLoading={isLoading}/>
        <Header />
        <Body
          set={node => this.selectItem(node)}
          unset={offset => this.unselectItem(offset)}
          items={data}
          values={selected}
          isLoading={isLoading}
        />
      </Table>
    );
  }
}
