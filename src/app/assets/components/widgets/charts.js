import * as ReactStockcharts from 'react-stockcharts';

import {
  BarSeries,
  LineSeries,
  CandlestickSeries,
} from 'react-stockcharts/es/lib/series';

import { XAxis, YAxis } from 'react-stockcharts/es/lib/axes';

import {
  CrossHairCursor,
  MouseCoordinateX,
  MouseCoordinateY,
} from 'react-stockcharts/es/lib/coordinates';

import { financeDiscontinuousScale, discontinuousTimeScaleProvider } from 'react-stockcharts/es/lib/scale';

import {
  OHLCTooltip,
} from 'react-stockcharts/es/lib/tooltip';

import { fitWidth, fitDimensions } from 'react-stockcharts/es/lib/helper';
import { last } from 'react-stockcharts/es/lib/utils';

document.currentScript.exports = {
  ReactStockcharts: {
    ...ReactStockcharts,
    CrossHairCursor,
    MouseCoordinateX,
    MouseCoordinateY,
    BarSeries,
    LineSeries,
    CandlestickSeries,
    discontinuousTimeScaleProvider,
    financeDiscontinuousScale,
    XAxis,
    YAxis,
    fitWidth,
    fitDimensions,
    last,
  },
};
