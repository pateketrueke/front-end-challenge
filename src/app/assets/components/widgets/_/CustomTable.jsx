import { Table, Caption, Header, Body } from './elements';

export class CustomTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: [],
    };
  }

  componentDidMount() {
    this.ref = ReactDOM.findDOMNode(this);

    Bitso.bindScrollers([this.ref]);
  }

  componentDidUpdate() {
    Bitso.updateScroller(this.ref);
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
    const { data, fields, caption, loading, className, captionRender } = this.props;

    return (
      <Table className={className || ''}>
        <Caption caption={caption} loading={loading} suffix={captionRender}/>
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

export default CustomTable;
