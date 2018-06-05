/* global React, ReactDOM */

import Bitso from '../_/bitso';

window.process = {
  env: {
    NODE_ENV: 'production',
  },
};

const load = document.currentScript.import;

load([
  '//unpkg.com/prop-types@15.5.10/prop-types.js',
  '//unpkg.com/react@16.3.1/umd/react.development.js',
  '//unpkg.com/react-dom@16.3.1/umd/react-dom.development.js',
  '//unpkg.com/react-transition-group@2.3.1/dist/react-transition-group.js',
  '//unpkg.com/classnames@2.2.5/index.js',
  '//unpkg.com/d3-array@1.2.1/build/d3-array.js',
  '//unpkg.com/d3-scale@2.0.0/dist/d3-scale.js',
]);

load([
  '//unpkg.com/moment@2.22.0/moment.js',
  '//unpkg.com/moment@2.22.0/locale/es.js',
  '//unpkg.com/numeral@2.0.6/numeral.js',
  '//unpkg.com/lodash@4.17.10/lodash.js',
]).then(() => {
  window.Bitso = Bitso;
  window.Bitso.API = new Bitso.API();
});

load([
  'widgets/charts',
  'widgets/main',
], resolvedWidgets => {
  Object.assign(window.Bitso, resolvedWidgets);
});

document.currentScript.exports = {
  init(node, context) {
    if (context.widget) {
      const widgetId = context.widget;
      const widgetName = `${widgetId[0].toUpperCase()}${widgetId.substr(1)}Widget`;
      const widgetResource = `${widgetId}-widget/main`;

      load(widgetResource)
        .then(exportedComponents => {
          if (!window.Bitso[widgetName]) {
            Object.assign(window.Bitso, exportedComponents);
          }

          ReactDOM.render(React.createElement(window.Bitso[widgetName], context), node);
        });
    }
  },
};
