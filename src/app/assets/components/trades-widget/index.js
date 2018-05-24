document.currentScript.import([
  '//unpkg.com/react@16.3.1/umd/react.development.js',
  '//unpkg.com/react-dom@16.3.1/umd/react-dom.development.js',
  '//unpkg.com/classnames@2.2.5/index.js',
  '//unpkg.com/prop-types@15.5.10/prop-types.js',
  '//unpkg.com/moment@2.22.0/moment.js',
  '//unpkg.com/moment@2.22.0/locale/es.js',
  '//unpkg.com/numeral@2.0.6/numeral.js'
]);

document.currentScript
  .import('trades-widget/main')
  .then(main => {
    window.Bitso = window.Bitso || {};
    Object.assign(window.Bitso, main);
  });

document.currentScript.exports = {
  init(node, context) {
    ReactDOM.render(React.createElement(window.Bitso.TradesWidget), node);
  },
};
