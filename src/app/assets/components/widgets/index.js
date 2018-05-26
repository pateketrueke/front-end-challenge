const load = document.currentScript.import;

load([
  '//unpkg.com/react@16.3.1/umd/react.development.js',
  '//unpkg.com/react-dom@16.3.1/umd/react-dom.development.js',
  '//unpkg.com/classnames@2.2.5/index.js',
  '//unpkg.com/prop-types@15.5.10/prop-types.js',
  '//unpkg.com/moment@2.22.0/moment.js',
  '//unpkg.com/moment@2.22.0/locale/es.js',
  '//unpkg.com/numeral@2.0.6/numeral.js',
]);

load('widgets/main')
  .then(widgets => {
    window.Bitso = window.Bitso || {};
    Object.assign(window.Bitso, widgets);
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

          ReactDOM.render(React.createElement(window.Bitso[widgetName]), node);
        });
    }
  },
};
