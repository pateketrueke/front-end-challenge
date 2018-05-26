class MarketsWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  render() {
    return (
      <div className='content'>MARKETS</div>
    );
  }
}

document.currentScript.exports = {
  MarketsWidget,
};
