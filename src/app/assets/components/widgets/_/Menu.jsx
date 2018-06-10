/* global Rract */

export default class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentValue: this.props.value || null,
    };
  }

  handleItem(e, itemInfo) {
    e.preventDefault();
    this.setState({
      currentValue: itemInfo.value,
    });
  }

  render() {
    let items = this.props.items;

    if (this.props.unique) {
      items = items.filter(item => item.value !== this.state.currentValue);
    }

    return (
      <div className='menu'>
        {this.props.label && (
          <span className='menu-lb'>{this.props.label}</span>
        )}
        <span className='menu-pin no-wrap'>
          {this.props.renderValue
            ? this.props.renderValue(this.state.currentValue)
            : this.state.currentValue}
        </span>
        <ul className='menu-sub reset no-type no-wrap'>
        {items.map(item => (
          <li key={item.value} className={this.state.currentValue === item.value ? 'sel' : null}>
            <a href='#' onClick={e => {
              this.handleItem(e, item);

              if (this.props.onChange) {
                this.props.onChange(item);
              }
            }}>{item.label}</a>
          </li>
        ))}
        </ul>
      </div>
    );
  }
}
