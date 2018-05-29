/* global Chartist */

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
      this._ref.update();
    }
  }

  componentDidMount() {
    const ctx = ReactDOM.findDOMNode(this).getContext('2d');
    const data = this.props.data || [];

    this._ref = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: data.length }),
        datasets: [{
          borderColor: this.props.shown === 'up' ? '#34CF33' : '#AD002C',
          pointRadius: 0,
          lineTension: 0,
          borderWidth: 1.5,
          showLine: true,
          label: false,
          fill: false,
          data,
        }]
      },
      options: {
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
      <canvas className={`fit chart ${this.props.shown || ''}`} />
    );
  }
}


export default LineChart;
