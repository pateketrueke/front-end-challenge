/* global Chartist */

export class LineChart extends React.Component {
  componentWillUnmount() {
    if (this._ref) {
      this._ref.detach();
    }
  }

  componentDidMount() {
    this._ref = new Chartist.Line(ReactDOM.findDOMNode(this), {
      series: this.props.data || [],
    }, {
      low: 0,
      fullWidth: true,
      showArea: false,
      showPoint: false,
      chartPadding: 12,
      axisX: {
        showLabel: false,
        showGrid: false,
        offset: 0,
      },
      axisY: {
        high: this.props.high,
        low: this.props.low,
        showLabel: false,
        offset: 0,
      },
      width: 260,
      height: 80,
    });
  }

  render() {
    return (
      <div className={`chart ${this.props.className}`} />
    );
  }
}


export default LineChart;
