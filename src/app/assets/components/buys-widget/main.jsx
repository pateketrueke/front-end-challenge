class BuysWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  render() {
    return (
      <div>BUYS</div>
    );
  }
}

document.currentScript.exports = {
  BuysWidget,
};
