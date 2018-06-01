const resolve = require('rollup-plugin-node-resolve');
const common = require('rollup-plugin-commonjs');

module.exports = {
  external: ['react', 'react-dom', 'prop-types'],
  format: 'umd',
  globals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    'prop-types': 'PropTypes',
  },
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      module: true,
      browser: true,
      preferBuiltins: false,
      customResolveOptions: {
        moduleDirectory: 'node_modules',
      },
    }),
    common(),
  ],
  onwarn(warning) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      return;
    }

    console.log(warning.message);
  }
};
