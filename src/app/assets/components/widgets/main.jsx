import { save, toggle } from '../_/actions';

function Highlight(props) {
  const suffix = Array.from({
    length: 11 - String(props.value).length
  }).join('0');

  const matches = String(props.value).match(/^(.+?)(0+)$/);

  if (!matches) {
    return (
      <span>
        <span className='hi'>{props.value}</span>{suffix}
      </span>
    );
  }

  return (
    <span>
      <span className='hi'>{matches[1]}</span>{matches[2]}{suffix}
    </span>
  );
}

function Table(props) {
  return (
    <div className='md-push v-scroll' data-scrollable='tbody'>
      <table className='full-width' cellPadding={0} cellSpacing={0}>{props.children}</table>
    </div>
  );
}

function Caption({ caption, loading }) {
  return (
    <caption className='pad caps align-left'>
      {caption}{loading ? '...' : ''}
    </caption>
  );
}

function Header(props) {
  return (
    <thead>
      <tr className='caps'>{props.fields.map(field => (
        <th key={field.label} className={`pad align-${field.align} ${field.classes || ''}`}>{field.label}</th>
      ))}</tr>
    </thead>
  );
}

function Value(props) {
  if (props.field.key === 'amount') {
    return (
      <Highlight value={props[props.field.key]} />
    );
  }

  if (props.field.key === 'price') {
    return (
      <span className={props.side === 'sell' ? 'up' : 'down'}>{props[props.field.key]}</span>
    );
  }

  return (
    <span className='hi'>{props[props.field.key]}</span>
  );
}

function Body(props) {
  if (props.loading) {
    return (
      <tbody><tr><td className='pad'>Cargando...</td></tr></tbody>
    );
  }

  return (
    <tbody>{props.items.map(item => (
      <tr key={item.key} ref={save(item)} onClick={toggle(props, item, 'sel')}>{props.fields.map(field => (
        <th key={field.key} className={`pad align-${field.align}`}><Value {...item} field={field}/></th>
      ))}</tr>
    ))}</tbody>
  );
}

class CustomTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: [],
    };
  }

  componentDidMount() {
    Bitso.bindScrollers([
      ReactDOM.findDOMNode(this),
    ]);
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
    const { selected, trades } = this.state;
    const { data, fields, caption, loading } = this.props;

    return (
      <Table>
        <Caption caption={caption} loading={loading}/>
        <Header fields={fields}/>
        <Body
          set={node => this.selectItem(node)}
          unset={offset => this.unselectItem(offset)}
          items={data}
          fields={fields}
          values={selected}
          loading={loading}
        />
      </Table>
    );
  }
}

document.currentScript.exports = {
  CustomTable,
  Highlight,
  Table,
  Caption,
  Header,
  Value,
  Body,
};
