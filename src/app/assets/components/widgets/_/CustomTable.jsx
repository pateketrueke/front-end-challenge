import { Table, Caption, Header, Body } from './elements';

export class CustomTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: [],
    };
  }

  unselectItem(key) {
    const offset = this.state.selected.indexOf(key);
    const copy = this.state.selected;

    copy.splice(offset, 1);

    this.setState({
      selected: copy,
    });
  }

  selectItem(key) {
    const copy = this.state.selected;

    this.setState({
      selected: copy.concat(copy.indexOf(key) === -1 ? key : []),
    });
  }

  render() {
    const { selected } = this.state;
    const { data, fields, caption, loading, grouping, className, titleRender } = this.props;

    return (
      <Table className={`no-sel ${className || ''}`}>
        <Caption caption={caption} loading={loading} suffix={titleRender}/>
        <Header fields={fields}/>
        <Body
          set={item => this.selectItem(item.key)}
          unset={item => this.unselectItem(item.key)}
          items={data}
          fields={fields}
          values={selected}
          loading={loading}
          grouping={grouping}
        />
      </Table>
    );
  }
}

export default CustomTable;
