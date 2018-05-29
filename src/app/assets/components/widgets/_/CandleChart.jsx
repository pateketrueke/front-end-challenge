/* global _, Chart */

function parseData(payload) {
  return payload.map(item => ({
    c: parseFloat(item.close),
    h: parseFloat(item.high),
    l: parseFloat(item.low),
    o: parseFloat(item.open),
    t: item.date,
  }));
}

export class LineChart extends React.Component {
  componentWillUnmount() {
    if (this._ref) {
      this._ref.destroy();
    }
  }

  componentWillUpdate(props) {
    if (this._ref && props.data) {
      this._ref.data.labels = Array.from({ length: props.data.length });
      this._ref.data.datasets[0].data = props.data;
      this._ref.update(0);
    }
  }

  componentDidMount() {
    const ctx = ReactDOM.findDOMNode(this).getContext('2d');
    const data = this.props.data || [];

    this._ref = new Chart(ctx, {
      type: 'candlestick',
      data: {
        datasets: [{
          color: {
            up: 'rgba(52, 207, 51, 0.5)',
            down: 'rgba(173, 0, 44, 0.5)',
            unchanged: '#747f89',
          },
          border: {
            up: '#34CF33',
            down: '#AD002C',
            unchanged: '#747f89',
          },
          fill: false,
          borderWidth: 1.5,
          borderColor: 'rgba(255, 255, 255, .2)',
          data: parseData(data),
        }],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        animation: {
          duration: 0,
        },
        legend: {
          display: false,
        },
        scales: {
          xAxes: [{
            display: false,
          }],
          yAxes: [{
            display: false,
          }],
        },
      },
    });
  }

  render() {
    return (
      <canvas className={`fit ${this.props.shown || ''}`}/>
    );
  }
}


export default LineChart;
