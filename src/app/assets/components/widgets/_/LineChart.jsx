/* global _ */

function parseData(payload) {
  return payload.map(item => ({
    close: parseFloat(item.close),
    high: parseFloat(item.high),
    low: parseFloat(item.low),
    open: parseFloat(item.open),
    date: new Date(item.date),
  }));
}

const {
  discontinuousTimeScaleProvider,
  last,
  fitWidth,
  LineSeries,
  ChartCanvas,
  Chart,
} = Bitso.ReactStockcharts;

class LineChart extends React.Component {
  render () {
    const initialData = parseData(this.props.data);
    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(d => d.date)
    const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(initialData)

    const lastData = last(data)
    const highest = data[Math.max(0, data.length - 150)]
    const start = xAccessor(lastData)
    const end = xAccessor(highest)
    const xExtents = [start, end]

    return (
      <ChartCanvas
        type='hybrid'
        seriesName='timeline'
        margin={{left:0,top:10,right:0,bottom:0}}
        width={this.props.width}
        height={this.props.height}
        ratio={this.props.ratio}
        data={data}
        xScale={xScale}
        xExtents={xExtents}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
      >
        <Chart
          id={1}
          yExtents={[d => [d.high, d.low]]}
          height={80}
        >
          <LineSeries
            yAccessor={d => d.close}
          />
        </Chart>
      </ChartCanvas>
    )
  }
}

LineChart.defaultProps = {
  ratio: 1,
  width: 200,
  height: 90,
};

export default fitWidth(LineChart);
