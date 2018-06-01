import { List } from './elements';

export class CustomList extends React.Component {
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
    const { data, caption, loading, grouping, className, itemRender, itemToggle } = this.props;

    return (
      <List
        toggle={itemToggle}
        render={itemRender}
        className={`no-sel ${className || ''}`}
        set={item => this.selectItem(item.key)}
        unset={item => this.unselectItem(item.key)}
        items={data}
        values={selected}
        caption={caption}
        loading={loading}
        grouping={grouping}
      />
    );
  }
}

export default CustomList;
