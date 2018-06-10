import * as ReactStockcharts from 'react-stockcharts';

import { XAxis, YAxis } from 'react-stockcharts/es/lib/axes'

import {
  BarSeries,
  LineSeries,
  CandlestickSeries,
} from 'react-stockcharts/es/lib/series';

import { discontinuousTimeScaleProvider } from 'react-stockcharts/es/lib/scale';

import { fitWidth, fitDimensions } from 'react-stockcharts/es/lib/helper';
import { last } from 'react-stockcharts/es/lib/utils';

document.currentScript.exports = {
  ReactStockcharts: {
    ...ReactStockcharts,
    BarSeries,
    LineSeries,
    CandlestickSeries,
    discontinuousTimeScaleProvider,
    fitWidth,
    fitDimensions,
    last,
    XAxis,
    YAxis,
  },
};
