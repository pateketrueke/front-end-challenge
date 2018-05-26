class SellsWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  render() {
    return (
      <div>SELLS</div>
    );
  }
}

document.currentScript.exports = {
  SellsWidget,
};
