/* global _ */

function parseData(payload) {
  return payload.map(item => ({
    volume: parseFloat(item.volume),
    close: parseFloat(item.close),
    high: parseFloat(item.high),
    low: parseFloat(item.low),
    open: parseFloat(item.open),
    date: new Date(item.date),
  }));
}

const {
  discontinuousTimeScaleProvider,
  fitDimensions,
  last,
  BarSeries,
  CandlestickSeries,
  ChartCanvas,
  Chart,
} = Bitso.ReactStockcharts;

class CandleChart extends React.Component {
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
          height={230}
        >
          <CandlestickSeries
            fill={d => (d.close > d.open ? 'rgba(134, 175, 107, .4)' : 'rgba(186, 48, 64, .4)')}
            stroke={d => (d.close > d.open ? '#80C156' : '#BA3040')}
            wickStroke={d => (d.close > d.open ? '#80C156' : '#BA3040')}
          />
        </Chart>
        <Chart
          id={2}
          yExtents={[d => d.volume]}
          height={50}
          origin={(w, h) => [0, h - 50]}
        >
          <BarSeries
            yAccessor={d => d.volume}
            fill='rgba(56, 69, 85, .4)'
          />
        </Chart>
      </ChartCanvas>
    )
  }
}

CandleChart.defaultProps = {
  ratio: 1,
  width: 800,
  height: 335,
};

export default fitDimensions(CandleChart);
