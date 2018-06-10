(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () {

  // This script will help to load most code asynchronously, since most
  // functionality is already encapsulated as components they can be
  // loaded and shared easily.

  var thisSrc = document.currentScript.src.split('/').slice(0, -1).join('/');

  var docHead = document.getElementsByTagName('head')[0];

  var BASE_URL = thisSrc + "/components";

  var _sources = {};

  var NODE_ENV="production";

  function debugLog() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    if (NODE_ENV !== 'production') {
      console.log.apply(console, args);
    }
  }

  function loadStyle(fromSrc) {
    return Promise.resolve()
      .then(function () {
        if (!_sources[fromSrc]) {
          var link = document.createElement('link');

          link.rel = 'stylesheet';
          link.type = 'text/css';
          link.href = fromSrc;

          docHead.appendChild(link);
        }
      });
  }

  // Due appending the desired <script> lacks on getting the app context
  // we rely on overloading `currentScript` for import/export things
  function loadScript(fromSrc) {
    if (_sources[fromSrc]) {
      if (!_sources[fromSrc].loaded) {
        // wait while being loaded...
        return new Promise(function (resolve) {
          setTimeout(resolve, 200);
        }).then(function () { return loadScript(fromSrc); });
      }

      return Promise.resolve(_sources[fromSrc].context);
    }

    // Check for deferred import-calls
    var _deferred = Promise.resolve();

    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');

      // Once the script is loaded on the browser we need
      // to execute it somehow, also on this point we can
      // securely remove the script from the document's head
      script.onload = function () {
        // The injected script is able to expose functionality
        // through `document.currentScript.exports`
        _sources[fromSrc] = {
          loaded: new Date(),
          context: script.exports,
        };

        // Cleanup
        delete script.import;
        delete script.exports;

        docHead.removeChild(script);

        // Run all pending promises
        return Promise.resolve(_deferred)
          // Resolves with the exported value
          .then(function () { return resolve(_sources[fromSrc].context); })
          .catch(function (e) { return script.onerror(e); });
      };

      script.onerror = function (e) {
        // FIXME: how recover from this?
        debugLog(e.stack);
        reject(e);
      };

      // The injected script is able to use this symbol
      // as `document.currentScript.import`
      script.import = function (src, cb) {
        // This function is very similar to `System.import()`
        // or NodeJS's `import()` call but instead it will
        // try to load known resources from BASE_URL

        var results = [];

        var p = function () { return Promise.resolve()
          .then(function () {
            src = !Array.isArray(src) && src
              ? [src]
              : src;

            // Load all scripts in order, note that probably
            // using `Promise.all()` can be fast on some well
            // controlled scenarios where there are not inter-dependencies
            return src.reduce(function (prev, cur) { return prev.then(function () {
                if (cur.indexOf('//') === -1 && cur.indexOf('.js') === -1) {
                  cur = BASE_URL + "/" + cur + ".js";
                }

                return (cur.indexOf('.css') > -1 ? loadStyle(cur) : loadScript(cur))
                  .then(function (result) {
                    if (results) {
                      results.push(result);

                      if (typeof cb === 'function') {
                        cb(result);
                      }
                    }
                  })
                  .catch(function () { return debugLog('ERROR LOADING', cur); });
              }); }, Promise.resolve());
          })
          .then(function () { return (results.length === 1 ? results[0] : results); }); };

        _deferred = _deferred.then(function () { return p(); });

        return _deferred;
      };

      // Add this component on the registry
      _sources[fromSrc] = {
        loaded: null,
        context: null,
      };

      script.src = fromSrc;

      docHead.appendChild(script);
    });
  }

  // load components from markup definitions
  var _components = [].slice.call(document.querySelectorAll('[data-component]'));

  _components.forEach(function (node) {
    debugLog('Component declaration found', node.dataset.component);

    // Creates a host element for mounting the component
    var target = document.createElement(node.tagName !== 'SCRIPT'
      ? node.tagName
      : 'DIV');

    var prefix = node.dataset.endpoint || BASE_URL;

    target.classList.add('is-loading');

    node.parentNode.insertBefore(target, node);
    node.parentNode.removeChild(node);

    loadScript((prefix + "/" + (node.dataset.component) + "/index.js"))
      .then(function (component) {
        debugLog('Component', node.dataset.component, 'loaded');

        // Parses innerText as JSON, what a deal!
        var options = Object.assign({}, node.dataset);

        try {
          Object.assign(options, JSON.parse(node.innerText));
        } catch (e) {
          // do nothing
        }

        // Ok, let the component do his magic here...
        if (component) {
          target.classList.remove('is-loading');

          debugLog('Component init', options);

          return component.init(target, options);
        }
      });
  });

})));
