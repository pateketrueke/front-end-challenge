(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('react'), require('prop-types'), require('react-dom')) :
  typeof define === 'function' && define.amd ? define(['react', 'prop-types', 'react-dom'], factory) :
  (factory(global.React,global.PropTypes,global.ReactDOM));
}(this, (function (React,PropTypes,ReactDOM) {

  var React__default = 'default' in React ? React['default'] : React;
  PropTypes = PropTypes && PropTypes.hasOwnProperty('default') ? PropTypes['default'] : PropTypes;
  ReactDOM = ReactDOM && ReactDOM.hasOwnProperty('default') ? ReactDOM['default'] : ReactDOM;

  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function bisector(compare) {
    if (compare.length === 1) compare = ascendingComparator(compare);
    return {
      left: function(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) < 0) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      },
      right: function(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) > 0) hi = mid;
          else lo = mid + 1;
        }
        return lo;
      }
    };
  }

  function ascendingComparator(f) {
    return function(d, x) {
      return ascending(f(d), x);
    };
  }

  var ascendingBisect = bisector(ascending);
  var bisectRight = ascendingBisect.right;

  function descending(a, b) {
    return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
  }

  function number(x) {
    return x === null ? NaN : +x;
  }

  function extent(values, valueof) {
    var n = values.length,
        i = -1,
        value,
        min,
        max;

    if (valueof == null) {
      while (++i < n) { // Find the first comparable value.
        if ((value = values[i]) != null && value >= value) {
          min = max = value;
          while (++i < n) { // Compare the remaining values.
            if ((value = values[i]) != null) {
              if (min > value) min = value;
              if (max < value) max = value;
            }
          }
        }
      }
    }

    else {
      while (++i < n) { // Find the first comparable value.
        if ((value = valueof(values[i], i, values)) != null && value >= value) {
          min = max = value;
          while (++i < n) { // Compare the remaining values.
            if ((value = valueof(values[i], i, values)) != null) {
              if (min > value) min = value;
              if (max < value) max = value;
            }
          }
        }
      }
    }

    return [min, max];
  }

  var array = Array.prototype;

  var slice = array.slice;

  function constant(x) {
    return function() {
      return x;
    };
  }

  function identity(x) {
    return x;
  }

  function sequence(start, stop, step) {
    start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

    var i = -1,
        n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
        range = new Array(n);

    while (++i < n) {
      range[i] = start + i * step;
    }

    return range;
  }

  var e10 = Math.sqrt(50),
      e5 = Math.sqrt(10),
      e2 = Math.sqrt(2);

  function ticks(start, stop, count) {
    var reverse,
        i = -1,
        n,
        ticks,
        step;

    stop = +stop, start = +start, count = +count;
    if (start === stop && count > 0) return [start];
    if (reverse = stop < start) n = start, start = stop, stop = n;
    if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

    if (step > 0) {
      start = Math.ceil(start / step);
      stop = Math.floor(stop / step);
      ticks = new Array(n = Math.ceil(stop - start + 1));
      while (++i < n) ticks[i] = (start + i) * step;
    } else {
      start = Math.floor(start * step);
      stop = Math.ceil(stop * step);
      ticks = new Array(n = Math.ceil(start - stop + 1));
      while (++i < n) ticks[i] = (start - i) / step;
    }

    if (reverse) ticks.reverse();

    return ticks;
  }

  function tickIncrement(start, stop, count) {
    var step = (stop - start) / Math.max(0, count),
        power = Math.floor(Math.log(step) / Math.LN10),
        error = step / Math.pow(10, power);
    return power >= 0
        ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
        : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
  }

  function tickStep(start, stop, count) {
    var step0 = Math.abs(stop - start) / Math.max(0, count),
        step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
        error = step0 / step1;
    if (error >= e10) step1 *= 10;
    else if (error >= e5) step1 *= 5;
    else if (error >= e2) step1 *= 2;
    return stop < start ? -step1 : step1;
  }

  function sturges(values) {
    return Math.ceil(Math.log(values.length) / Math.LN2) + 1;
  }

  function d3Histogram() {
    var value = identity,
        domain = extent,
        threshold = sturges;

    function histogram(data) {
      var i,
          n = data.length,
          x,
          values = new Array(n);

      for (i = 0; i < n; ++i) {
        values[i] = value(data[i], i, data);
      }

      var xz = domain(values),
          x0 = xz[0],
          x1 = xz[1],
          tz = threshold(values, x0, x1);

      // Convert number of thresholds into uniform thresholds.
      if (!Array.isArray(tz)) {
        tz = tickStep(x0, x1, tz);
        tz = sequence(Math.ceil(x0 / tz) * tz, Math.floor(x1 / tz) * tz, tz); // exclusive
      }

      // Remove any thresholds outside the domain.
      var m = tz.length;
      while (tz[0] <= x0) tz.shift(), --m;
      while (tz[m - 1] > x1) tz.pop(), --m;

      var bins = new Array(m + 1),
          bin;

      // Initialize bins.
      for (i = 0; i <= m; ++i) {
        bin = bins[i] = [];
        bin.x0 = i > 0 ? tz[i - 1] : x0;
        bin.x1 = i < m ? tz[i] : x1;
      }

      // Assign data to bins by value, ignoring any outside the domain.
      for (i = 0; i < n; ++i) {
        x = values[i];
        if (x0 <= x && x <= x1) {
          bins[bisectRight(tz, x, 0, m)].push(data[i]);
        }
      }

      return bins;
    }

    histogram.value = function(_) {
      return arguments.length ? (value = typeof _ === "function" ? _ : constant(_), histogram) : value;
    };

    histogram.domain = function(_) {
      return arguments.length ? (domain = typeof _ === "function" ? _ : constant([_[0], _[1]]), histogram) : domain;
    };

    histogram.thresholds = function(_) {
      return arguments.length ? (threshold = typeof _ === "function" ? _ : Array.isArray(_) ? constant(slice.call(_)) : constant(_), histogram) : threshold;
    };

    return histogram;
  }

  function max(values, valueof) {
    var n = values.length,
        i = -1,
        value,
        max;

    if (valueof == null) {
      while (++i < n) { // Find the first comparable value.
        if ((value = values[i]) != null && value >= value) {
          max = value;
          while (++i < n) { // Compare the remaining values.
            if ((value = values[i]) != null && value > max) {
              max = value;
            }
          }
        }
      }
    }

    else {
      while (++i < n) { // Find the first comparable value.
        if ((value = valueof(values[i], i, values)) != null && value >= value) {
          max = value;
          while (++i < n) { // Compare the remaining values.
            if ((value = valueof(values[i], i, values)) != null && value > max) {
              max = value;
            }
          }
        }
      }
    }

    return max;
  }

  function mean(values, valueof) {
    var n = values.length,
        m = n,
        i = -1,
        value,
        sum = 0;

    if (valueof == null) {
      while (++i < n) {
        if (!isNaN(value = number(values[i]))) sum += value;
        else --m;
      }
    }

    else {
      while (++i < n) {
        if (!isNaN(value = number(valueof(values[i], i, values)))) sum += value;
        else --m;
      }
    }

    if (m) return sum / m;
  }

  function merge(arrays) {
    var n = arrays.length,
        m,
        i = -1,
        j = 0,
        merged,
        array;

    while (++i < n) j += arrays[i].length;
    merged = new Array(j);

    while (--n >= 0) {
      array = arrays[n];
      m = array.length;
      while (--m >= 0) {
        merged[--j] = array[m];
      }
    }

    return merged;
  }

  function min(values, valueof) {
    var n = values.length,
        i = -1,
        value,
        min;

    if (valueof == null) {
      while (++i < n) { // Find the first comparable value.
        if ((value = values[i]) != null && value >= value) {
          min = value;
          while (++i < n) { // Compare the remaining values.
            if ((value = values[i]) != null && min > value) {
              min = value;
            }
          }
        }
      }
    }

    else {
      while (++i < n) { // Find the first comparable value.
        if ((value = valueof(values[i], i, values)) != null && value >= value) {
          min = value;
          while (++i < n) { // Compare the remaining values.
            if ((value = valueof(values[i], i, values)) != null && min > value) {
              min = value;
            }
          }
        }
      }
    }

    return min;
  }

  function sum(values, valueof) {
    var n = values.length,
        i = -1,
        value,
        sum = 0;

    if (valueof == null) {
      while (++i < n) {
        if (value = +values[i]) sum += value; // Note: zero and null are equivalent.
      }
    }

    else {
      while (++i < n) {
        if (value = +valueof(values[i], i, values)) sum += value;
      }
    }

    return sum;
  }

  function transpose(matrix) {
    if (!(n = matrix.length)) return [];
    for (var i = -1, m = min(matrix, length), transpose = new Array(m); ++i < m;) {
      for (var j = -1, n, row = transpose[i] = new Array(n); ++j < n;) {
        row[j] = matrix[j][i];
      }
    }
    return transpose;
  }

  function length(d) {
    return d.length;
  }

  function zip() {
    return transpose(arguments);
  }

  var prefix = "$";

  function Map() {}

  Map.prototype = map$1.prototype = {
    constructor: Map,
    has: function(key) {
      return (prefix + key) in this;
    },
    get: function(key) {
      return this[prefix + key];
    },
    set: function(key, value) {
      this[prefix + key] = value;
      return this;
    },
    remove: function(key) {
      var property = prefix + key;
      return property in this && delete this[property];
    },
    clear: function() {
      for (var property in this) if (property[0] === prefix) delete this[property];
    },
    keys: function() {
      var keys = [];
      for (var property in this) if (property[0] === prefix) keys.push(property.slice(1));
      return keys;
    },
    values: function() {
      var values = [];
      for (var property in this) if (property[0] === prefix) values.push(this[property]);
      return values;
    },
    entries: function() {
      var entries = [];
      for (var property in this) if (property[0] === prefix) entries.push({key: property.slice(1), value: this[property]});
      return entries;
    },
    size: function() {
      var size = 0;
      for (var property in this) if (property[0] === prefix) ++size;
      return size;
    },
    empty: function() {
      for (var property in this) if (property[0] === prefix) return false;
      return true;
    },
    each: function(f) {
      for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this);
    }
  };

  function map$1(object, f) {
    var map = new Map;

    // Copy constructor.
    if (object instanceof Map) object.each(function(value, key) { map.set(key, value); });

    // Index array by numeric index or specified key function.
    else if (Array.isArray(object)) {
      var i = -1,
          n = object.length,
          o;

      if (f == null) while (++i < n) map.set(i, object[i]);
      else while (++i < n) map.set(f(o = object[i], i, object), o);
    }

    // Convert object to map.
    else if (object) for (var key in object) map.set(key, object[key]);

    return map;
  }

  function nest() {
    var keys = [],
        sortKeys = [],
        sortValues,
        rollup,
        nest;

    function apply(array, depth, createResult, setResult) {
      if (depth >= keys.length) {
        if (sortValues != null) array.sort(sortValues);
        return rollup != null ? rollup(array) : array;
      }

      var i = -1,
          n = array.length,
          key = keys[depth++],
          keyValue,
          value,
          valuesByKey = map$1(),
          values,
          result = createResult();

      while (++i < n) {
        if (values = valuesByKey.get(keyValue = key(value = array[i]) + "")) {
          values.push(value);
        } else {
          valuesByKey.set(keyValue, [value]);
        }
      }

      valuesByKey.each(function(values, key) {
        setResult(result, key, apply(values, depth, createResult, setResult));
      });

      return result;
    }

    function entries(map, depth) {
      if (++depth > keys.length) return map;
      var array, sortKey = sortKeys[depth - 1];
      if (rollup != null && depth >= keys.length) array = map.entries();
      else array = [], map.each(function(v, k) { array.push({key: k, values: entries(v, depth)}); });
      return sortKey != null ? array.sort(function(a, b) { return sortKey(a.key, b.key); }) : array;
    }

    return nest = {
      object: function(array) { return apply(array, 0, createObject, setObject); },
      map: function(array) { return apply(array, 0, createMap, setMap); },
      entries: function(array) { return entries(apply(array, 0, createMap, setMap), 0); },
      key: function(d) { keys.push(d); return nest; },
      sortKeys: function(order) { sortKeys[keys.length - 1] = order; return nest; },
      sortValues: function(order) { sortValues = order; return nest; },
      rollup: function(f) { rollup = f; return nest; }
    };
  }

  function createObject() {
    return {};
  }

  function setObject(object, key, value) {
    object[key] = value;
  }

  function createMap() {
    return map$1();
  }

  function setMap(map, key, value) {
    map.set(key, value);
  }

  function Set() {}

  var proto = map$1.prototype;

  Set.prototype = set.prototype = {
    constructor: Set,
    has: proto.has,
    add: function(value) {
      value += "";
      this[prefix + value] = value;
      return this;
    },
    remove: proto.remove,
    clear: proto.clear,
    values: proto.keys,
    size: proto.size,
    empty: proto.empty,
    each: proto.each
  };

  function set(object, f) {
    var set = new Set;

    // Copy constructor.
    if (object instanceof Set) object.each(function(value) { set.add(value); });

    // Otherwise, assume it’s an array.
    else if (object) {
      var i = -1, n = object.length;
      if (f == null) while (++i < n) set.add(object[i]);
      else while (++i < n) set.add(f(object[i], i, object));
    }

    return set;
  }

  var array$1 = Array.prototype;

  var map$2 = array$1.map;
  var slice$1 = array$1.slice;

  var implicit = {name: "implicit"};

  function ordinal(range) {
    var index = map$1(),
        domain = [],
        unknown = implicit;

    range = range == null ? [] : slice$1.call(range);

    function scale(d) {
      var key = d + "", i = index.get(key);
      if (!i) {
        if (unknown !== implicit) return unknown;
        index.set(key, i = domain.push(d));
      }
      return range[(i - 1) % range.length];
    }

    scale.domain = function(_) {
      if (!arguments.length) return domain.slice();
      domain = [], index = map$1();
      var i = -1, n = _.length, d, key;
      while (++i < n) if (!index.has(key = (d = _[i]) + "")) index.set(key, domain.push(d));
      return scale;
    };

    scale.range = function(_) {
      return arguments.length ? (range = slice$1.call(_), scale) : range.slice();
    };

    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };

    scale.copy = function() {
      return ordinal()
          .domain(domain)
          .range(range)
          .unknown(unknown);
    };

    return scale;
  }

  function define(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }

  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition) prototype[key] = definition[key];
    return prototype;
  }

  function Color() {}

  var darker = 0.7;
  var brighter = 1 / darker;

  var reI = "\\s*([+-]?\\d+)\\s*",
      reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
      reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
      reHex3 = /^#([0-9a-f]{3})$/,
      reHex6 = /^#([0-9a-f]{6})$/,
      reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
      reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
      reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
      reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
      reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
      reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

  var named = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f,
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff,
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080,
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff,
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x708090,
    slategrey: 0x708090,
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32
  };

  define(Color, color, {
    displayable: function() {
      return this.rgb().displayable();
    },
    hex: function() {
      return this.rgb().hex();
    },
    toString: function() {
      return this.rgb() + "";
    }
  });

  function color(format) {
    var m;
    format = (format + "").trim().toLowerCase();
    return (m = reHex3.exec(format)) ? (m = parseInt(m[1], 16), new Rgb((m >> 8 & 0xf) | (m >> 4 & 0x0f0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1)) // #f00
        : (m = reHex6.exec(format)) ? rgbn(parseInt(m[1], 16)) // #ff0000
        : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
        : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
        : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
        : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
        : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
        : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
        : named.hasOwnProperty(format) ? rgbn(named[format])
        : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
        : null;
  }

  function rgbn(n) {
    return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
  }

  function rgba(r, g, b, a) {
    if (a <= 0) r = g = b = NaN;
    return new Rgb(r, g, b, a);
  }

  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb;
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }

  function rgb(r, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
  }

  function Rgb(r, g, b, opacity) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }

  define(Rgb, rgb, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb: function() {
      return this;
    },
    displayable: function() {
      return (0 <= this.r && this.r <= 255)
          && (0 <= this.g && this.g <= 255)
          && (0 <= this.b && this.b <= 255)
          && (0 <= this.opacity && this.opacity <= 1);
    },
    hex: function() {
      return "#" + hex(this.r) + hex(this.g) + hex(this.b);
    },
    toString: function() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "rgb(" : "rgba(")
          + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.b) || 0))
          + (a === 1 ? ")" : ", " + a + ")");
    }
  }));

  function hex(value) {
    value = Math.max(0, Math.min(255, Math.round(value) || 0));
    return (value < 16 ? "0" : "") + value.toString(16);
  }

  function hsla(h, s, l, a) {
    if (a <= 0) h = s = l = NaN;
    else if (l <= 0 || l >= 1) h = s = NaN;
    else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a);
  }

  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl;
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r = o.r / 255,
        g = o.g / 255,
        b = o.b / 255,
        min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        h = NaN,
        s = max - min,
        l = (max + min) / 2;
    if (s) {
      if (r === max) h = (g - b) / s + (g < b) * 6;
      else if (g === max) h = (b - r) / s + 2;
      else h = (r - g) / s + 4;
      s /= l < 0.5 ? max + min : 2 - max - min;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }

  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }

  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(Hsl, hsl, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb: function() {
      var h = this.h % 360 + (this.h < 0) * 360,
          s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
          l = this.l,
          m2 = l + (l < 0.5 ? l : 1 - l) * s,
          m1 = 2 * l - m2;
      return new Rgb(
        hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
        hsl2rgb(h, m1, m2),
        hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
        this.opacity
      );
    },
    displayable: function() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s))
          && (0 <= this.l && this.l <= 1)
          && (0 <= this.opacity && this.opacity <= 1);
    }
  }));

  /* From FvD 13.37, CSS Color Module Level 3 */
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60
        : h < 180 ? m2
        : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
        : m1) * 255;
  }

  var deg2rad = Math.PI / 180;
  var rad2deg = 180 / Math.PI;

  // https://beta.observablehq.com/@mbostock/lab-and-rgb
  var K = 18,
      Xn = 0.96422,
      Yn = 1,
      Zn = 0.82521,
      t0 = 4 / 29,
      t1 = 6 / 29,
      t2 = 3 * t1 * t1,
      t3 = t1 * t1 * t1;

  function labConvert(o) {
    if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
    if (o instanceof Hcl) {
      if (isNaN(o.h)) return new Lab(o.l, 0, 0, o.opacity);
      var h = o.h * deg2rad;
      return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
    }
    if (!(o instanceof Rgb)) o = rgbConvert(o);
    var r = rgb2lrgb(o.r),
        g = rgb2lrgb(o.g),
        b = rgb2lrgb(o.b),
        y = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / Yn), x, z;
    if (r === g && g === b) x = z = y; else {
      x = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / Xn);
      z = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / Zn);
    }
    return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
  }

  function lab(l, a, b, opacity) {
    return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
  }

  function Lab(l, a, b, opacity) {
    this.l = +l;
    this.a = +a;
    this.b = +b;
    this.opacity = +opacity;
  }

  define(Lab, lab, extend(Color, {
    brighter: function(k) {
      return new Lab(this.l + K * (k == null ? 1 : k), this.a, this.b, this.opacity);
    },
    darker: function(k) {
      return new Lab(this.l - K * (k == null ? 1 : k), this.a, this.b, this.opacity);
    },
    rgb: function() {
      var y = (this.l + 16) / 116,
          x = isNaN(this.a) ? y : y + this.a / 500,
          z = isNaN(this.b) ? y : y - this.b / 200;
      x = Xn * lab2xyz(x);
      y = Yn * lab2xyz(y);
      z = Zn * lab2xyz(z);
      return new Rgb(
        lrgb2rgb( 3.1338561 * x - 1.6168667 * y - 0.4906146 * z),
        lrgb2rgb(-0.9787684 * x + 1.9161415 * y + 0.0334540 * z),
        lrgb2rgb( 0.0719453 * x - 0.2289914 * y + 1.4052427 * z),
        this.opacity
      );
    }
  }));

  function xyz2lab(t) {
    return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
  }

  function lab2xyz(t) {
    return t > t1 ? t * t * t : t2 * (t - t0);
  }

  function lrgb2rgb(x) {
    return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
  }

  function rgb2lrgb(x) {
    return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  }

  function hclConvert(o) {
    if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
    if (!(o instanceof Lab)) o = labConvert(o);
    if (o.a === 0 && o.b === 0) return new Hcl(NaN, 0, o.l, o.opacity);
    var h = Math.atan2(o.b, o.a) * rad2deg;
    return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
  }

  function hcl(h, c, l, opacity) {
    return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
  }

  function Hcl(h, c, l, opacity) {
    this.h = +h;
    this.c = +c;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(Hcl, hcl, extend(Color, {
    brighter: function(k) {
      return new Hcl(this.h, this.c, this.l + K * (k == null ? 1 : k), this.opacity);
    },
    darker: function(k) {
      return new Hcl(this.h, this.c, this.l - K * (k == null ? 1 : k), this.opacity);
    },
    rgb: function() {
      return labConvert(this).rgb();
    }
  }));

  var A = -0.14861,
      B = +1.78277,
      C = -0.29227,
      D = -0.90649,
      E = +1.97294,
      ED = E * D,
      EB = E * B,
      BC_DA = B * C - D * A;

  function cubehelixConvert(o) {
    if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Rgb)) o = rgbConvert(o);
    var r = o.r / 255,
        g = o.g / 255,
        b = o.b / 255,
        l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
        bl = b - l,
        k = (E * (g - l) - C * bl) / D,
        s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), // NaN if l=0 or l=1
        h = s ? Math.atan2(k, bl) * rad2deg - 120 : NaN;
    return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
  }

  function cubehelix(h, s, l, opacity) {
    return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
  }

  function Cubehelix(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(Cubehelix, cubehelix, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
    },
    rgb: function() {
      var h = isNaN(this.h) ? 0 : (this.h + 120) * deg2rad,
          l = +this.l,
          a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
          cosh = Math.cos(h),
          sinh = Math.sin(h);
      return new Rgb(
        255 * (l + a * (A * cosh + B * sinh)),
        255 * (l + a * (C * cosh + D * sinh)),
        255 * (l + a * (E * cosh)),
        this.opacity
      );
    }
  }));

  function constant$1(x) {
    return function() {
      return x;
    };
  }

  function linear(a, d) {
    return function(t) {
      return a + t * d;
    };
  }

  function exponential(a, b, y) {
    return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
      return Math.pow(a + t * b, y);
    };
  }

  function hue(a, b) {
    var d = b - a;
    return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant$1(isNaN(a) ? b : a);
  }

  function gamma(y) {
    return (y = +y) === 1 ? nogamma : function(a, b) {
      return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
    };
  }

  function nogamma(a, b) {
    var d = b - a;
    return d ? linear(a, d) : constant$1(isNaN(a) ? b : a);
  }

  var rgb$1 = (function rgbGamma(y) {
    var color$$1 = gamma(y);

    function rgb$$1(start, end) {
      var r = color$$1((start = rgb(start)).r, (end = rgb(end)).r),
          g = color$$1(start.g, end.g),
          b = color$$1(start.b, end.b),
          opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.r = r(t);
        start.g = g(t);
        start.b = b(t);
        start.opacity = opacity(t);
        return start + "";
      };
    }

    rgb$$1.gamma = rgbGamma;

    return rgb$$1;
  })(1);

  function array$2(a, b) {
    var nb = b ? b.length : 0,
        na = a ? Math.min(nb, a.length) : 0,
        x = new Array(na),
        c = new Array(nb),
        i;

    for (i = 0; i < na; ++i) x[i] = interpolateValue(a[i], b[i]);
    for (; i < nb; ++i) c[i] = b[i];

    return function(t) {
      for (i = 0; i < na; ++i) c[i] = x[i](t);
      return c;
    };
  }

  function date(a, b) {
    var d = new Date;
    return a = +a, b -= a, function(t) {
      return d.setTime(a + b * t), d;
    };
  }

  function number$1(a, b) {
    return a = +a, b -= a, function(t) {
      return a + b * t;
    };
  }

  function object(a, b) {
    var i = {},
        c = {},
        k;

    if (a === null || typeof a !== "object") a = {};
    if (b === null || typeof b !== "object") b = {};

    for (k in b) {
      if (k in a) {
        i[k] = interpolateValue(a[k], b[k]);
      } else {
        c[k] = b[k];
      }
    }

    return function(t) {
      for (k in i) c[k] = i[k](t);
      return c;
    };
  }

  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
      reB = new RegExp(reA.source, "g");

  function zero(b) {
    return function() {
      return b;
    };
  }

  function one(b) {
    return function(t) {
      return b(t) + "";
    };
  }

  function string(a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
        am, // current match in a
        bm, // current match in b
        bs, // string preceding current number in b, if any
        i = -1, // index in s
        s = [], // string constants and placeholders
        q = []; // number interpolators

    // Coerce inputs to strings.
    a = a + "", b = b + "";

    // Interpolate pairs of numbers in a & b.
    while ((am = reA.exec(a))
        && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) { // a string precedes the next number in b
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
        if (s[i]) s[i] += bm; // coalesce with previous string
        else s[++i] = bm;
      } else { // interpolate non-matching numbers
        s[++i] = null;
        q.push({i: i, x: number$1(am, bm)});
      }
      bi = reB.lastIndex;
    }

    // Add remains of b.
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }

    // Special optimization for only a single match.
    // Otherwise, interpolate each of the numbers and rejoin the string.
    return s.length < 2 ? (q[0]
        ? one(q[0].x)
        : zero(b))
        : (b = q.length, function(t) {
            for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
            return s.join("");
          });
  }

  function interpolateValue(a, b) {
    var t = typeof b, c;
    return b == null || t === "boolean" ? constant$1(b)
        : (t === "number" ? number$1
        : t === "string" ? ((c = color(b)) ? (b = c, rgb$1) : string)
        : b instanceof color ? rgb$1
        : b instanceof Date ? date
        : Array.isArray(b) ? array$2
        : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
        : number$1)(a, b);
  }

  function interpolateRound(a, b) {
    return a = +a, b -= a, function(t) {
      return Math.round(a + b * t);
    };
  }

  var degrees = 180 / Math.PI;

  var rho = Math.SQRT2;

  function cubehelix$1(hue$$1) {
    return (function cubehelixGamma(y) {
      y = +y;

      function cubehelix$$1(start, end) {
        var h = hue$$1((start = cubehelix(start)).h, (end = cubehelix(end)).h),
            s = nogamma(start.s, end.s),
            l = nogamma(start.l, end.l),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.h = h(t);
          start.s = s(t);
          start.l = l(Math.pow(t, y));
          start.opacity = opacity(t);
          return start + "";
        };
      }

      cubehelix$$1.gamma = cubehelixGamma;

      return cubehelix$$1;
    })(1);
  }

  cubehelix$1(hue);
  var cubehelixLong = cubehelix$1(nogamma);

  function constant$2(x) {
    return function() {
      return x;
    };
  }

  function number$2(x) {
    return +x;
  }

  var unit = [0, 1];

  function deinterpolateLinear(a, b) {
    return (b -= (a = +a))
        ? function(x) { return (x - a) / b; }
        : constant$2(b);
  }

  function deinterpolateClamp(deinterpolate) {
    return function(a, b) {
      var d = deinterpolate(a = +a, b = +b);
      return function(x) { return x <= a ? 0 : x >= b ? 1 : d(x); };
    };
  }

  function reinterpolateClamp(reinterpolate) {
    return function(a, b) {
      var r = reinterpolate(a = +a, b = +b);
      return function(t) { return t <= 0 ? a : t >= 1 ? b : r(t); };
    };
  }

  function bimap(domain, range, deinterpolate, reinterpolate) {
    var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
    if (d1 < d0) d0 = deinterpolate(d1, d0), r0 = reinterpolate(r1, r0);
    else d0 = deinterpolate(d0, d1), r0 = reinterpolate(r0, r1);
    return function(x) { return r0(d0(x)); };
  }

  function polymap(domain, range, deinterpolate, reinterpolate) {
    var j = Math.min(domain.length, range.length) - 1,
        d = new Array(j),
        r = new Array(j),
        i = -1;

    // Reverse descending domains.
    if (domain[j] < domain[0]) {
      domain = domain.slice().reverse();
      range = range.slice().reverse();
    }

    while (++i < j) {
      d[i] = deinterpolate(domain[i], domain[i + 1]);
      r[i] = reinterpolate(range[i], range[i + 1]);
    }

    return function(x) {
      var i = bisectRight(domain, x, 1, j) - 1;
      return r[i](d[i](x));
    };
  }

  function copy(source, target) {
    return target
        .domain(source.domain())
        .range(source.range())
        .interpolate(source.interpolate())
        .clamp(source.clamp());
  }

  // deinterpolate(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
  // reinterpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding domain value x in [a,b].
  function continuous(deinterpolate, reinterpolate) {
    var domain = unit,
        range = unit,
        interpolate$$1 = interpolateValue,
        clamp = false,
        piecewise$$1,
        output,
        input;

    function rescale() {
      piecewise$$1 = Math.min(domain.length, range.length) > 2 ? polymap : bimap;
      output = input = null;
      return scale;
    }

    function scale(x) {
      return (output || (output = piecewise$$1(domain, range, clamp ? deinterpolateClamp(deinterpolate) : deinterpolate, interpolate$$1)))(+x);
    }

    scale.invert = function(y) {
      return (input || (input = piecewise$$1(range, domain, deinterpolateLinear, clamp ? reinterpolateClamp(reinterpolate) : reinterpolate)))(+y);
    };

    scale.domain = function(_) {
      return arguments.length ? (domain = map$2.call(_, number$2), rescale()) : domain.slice();
    };

    scale.range = function(_) {
      return arguments.length ? (range = slice$1.call(_), rescale()) : range.slice();
    };

    scale.rangeRound = function(_) {
      return range = slice$1.call(_), interpolate$$1 = interpolateRound, rescale();
    };

    scale.clamp = function(_) {
      return arguments.length ? (clamp = !!_, rescale()) : clamp;
    };

    scale.interpolate = function(_) {
      return arguments.length ? (interpolate$$1 = _, rescale()) : interpolate$$1;
    };

    return rescale();
  }

  // Computes the decimal coefficient and exponent of the specified number x with
  // significant digits p, where x is positive and p is in [1, 21] or undefined.
  // For example, formatDecimal(1.23) returns ["123", 0].
  function formatDecimal(x, p) {
    if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
    var i, coefficient = x.slice(0, i);

    // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
    // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
    return [
      coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
      +x.slice(i + 1)
    ];
  }

  function exponent(x) {
    return x = formatDecimal(Math.abs(x)), x ? x[1] : NaN;
  }

  function formatGroup(grouping, thousands) {
    return function(value, width) {
      var i = value.length,
          t = [],
          j = 0,
          g = grouping[0],
          length = 0;

      while (i > 0 && g > 0) {
        if (length + g + 1 > width) g = Math.max(1, width - length);
        t.push(value.substring(i -= g, i + g));
        if ((length += g + 1) > width) break;
        g = grouping[j = (j + 1) % grouping.length];
      }

      return t.reverse().join(thousands);
    };
  }

  function formatNumerals(numerals) {
    return function(value) {
      return value.replace(/[0-9]/g, function(i) {
        return numerals[+i];
      });
    };
  }

  // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
  var re = /^(?:(.)?([<>=^]))?([+\-\( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

  function formatSpecifier(specifier) {
    return new FormatSpecifier(specifier);
  }

  formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

  function FormatSpecifier(specifier) {
    if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
    var match;
    this.fill = match[1] || " ";
    this.align = match[2] || ">";
    this.sign = match[3] || "-";
    this.symbol = match[4] || "";
    this.zero = !!match[5];
    this.width = match[6] && +match[6];
    this.comma = !!match[7];
    this.precision = match[8] && +match[8].slice(1);
    this.trim = !!match[9];
    this.type = match[10] || "";
  }

  FormatSpecifier.prototype.toString = function() {
    return this.fill
        + this.align
        + this.sign
        + this.symbol
        + (this.zero ? "0" : "")
        + (this.width == null ? "" : Math.max(1, this.width | 0))
        + (this.comma ? "," : "")
        + (this.precision == null ? "" : "." + Math.max(0, this.precision | 0))
        + (this.trim ? "~" : "")
        + this.type;
  };

  // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
  function formatTrim(s) {
    out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
      switch (s[i]) {
        case ".": i0 = i1 = i; break;
        case "0": if (i0 === 0) i0 = i; i1 = i; break;
        default: if (i0 > 0) { if (!+s[i]) break out; i0 = 0; } break;
      }
    }
    return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
  }

  var prefixExponent;

  function formatPrefixAuto(x, p) {
    var d = formatDecimal(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
        exponent = d[1],
        i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
        n = coefficient.length;
    return i === n ? coefficient
        : i > n ? coefficient + new Array(i - n + 1).join("0")
        : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
        : "0." + new Array(1 - i).join("0") + formatDecimal(x, Math.max(0, p + i - 1))[0]; // less than 1y!
  }

  function formatRounded(x, p) {
    var d = formatDecimal(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
        exponent = d[1];
    return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
        : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
        : coefficient + new Array(exponent - coefficient.length + 2).join("0");
  }

  var formatTypes = {
    "%": function(x, p) { return (x * 100).toFixed(p); },
    "b": function(x) { return Math.round(x).toString(2); },
    "c": function(x) { return x + ""; },
    "d": function(x) { return Math.round(x).toString(10); },
    "e": function(x, p) { return x.toExponential(p); },
    "f": function(x, p) { return x.toFixed(p); },
    "g": function(x, p) { return x.toPrecision(p); },
    "o": function(x) { return Math.round(x).toString(8); },
    "p": function(x, p) { return formatRounded(x * 100, p); },
    "r": formatRounded,
    "s": formatPrefixAuto,
    "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
    "x": function(x) { return Math.round(x).toString(16); }
  };

  function identity$2(x) {
    return x;
  }

  var prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

  function formatLocale(locale) {
    var group = locale.grouping && locale.thousands ? formatGroup(locale.grouping, locale.thousands) : identity$2,
        currency = locale.currency,
        decimal = locale.decimal,
        numerals = locale.numerals ? formatNumerals(locale.numerals) : identity$2,
        percent = locale.percent || "%";

    function newFormat(specifier) {
      specifier = formatSpecifier(specifier);

      var fill = specifier.fill,
          align = specifier.align,
          sign = specifier.sign,
          symbol = specifier.symbol,
          zero = specifier.zero,
          width = specifier.width,
          comma = specifier.comma,
          precision = specifier.precision,
          trim = specifier.trim,
          type = specifier.type;

      // The "n" type is an alias for ",g".
      if (type === "n") comma = true, type = "g";

      // The "" type, and any invalid type, is an alias for ".12~g".
      else if (!formatTypes[type]) precision == null && (precision = 12), trim = true, type = "g";

      // If zero fill is specified, padding goes after sign and before digits.
      if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

      // Compute the prefix and suffix.
      // For SI-prefix, the suffix is lazily computed.
      var prefix = symbol === "$" ? currency[0] : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
          suffix = symbol === "$" ? currency[1] : /[%p]/.test(type) ? percent : "";

      // What format function should we use?
      // Is this an integer type?
      // Can this type generate exponential notation?
      var formatType = formatTypes[type],
          maybeSuffix = /[defgprs%]/.test(type);

      // Set the default precision if not specified,
      // or clamp the specified precision to the supported range.
      // For significant precision, it must be in [1, 21].
      // For fixed precision, it must be in [0, 20].
      precision = precision == null ? 6
          : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
          : Math.max(0, Math.min(20, precision));

      function format(value) {
        var valuePrefix = prefix,
            valueSuffix = suffix,
            i, n, c;

        if (type === "c") {
          valueSuffix = formatType(value) + valueSuffix;
          value = "";
        } else {
          value = +value;

          // Perform the initial formatting.
          var valueNegative = value < 0;
          value = formatType(Math.abs(value), precision);

          // Trim insignificant zeros.
          if (trim) value = formatTrim(value);

          // If a negative value rounds to zero during formatting, treat as positive.
          if (valueNegative && +value === 0) valueNegative = false;

          // Compute the prefix and suffix.
          valuePrefix = (valueNegative ? (sign === "(" ? sign : "-") : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
          valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

          // Break the formatted value into the integer “value” part that can be
          // grouped, and fractional or exponential “suffix” part that is not.
          if (maybeSuffix) {
            i = -1, n = value.length;
            while (++i < n) {
              if (c = value.charCodeAt(i), 48 > c || c > 57) {
                valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                value = value.slice(0, i);
                break;
              }
            }
          }
        }

        // If the fill character is not "0", grouping is applied before padding.
        if (comma && !zero) value = group(value, Infinity);

        // Compute the padding.
        var length = valuePrefix.length + value.length + valueSuffix.length,
            padding = length < width ? new Array(width - length + 1).join(fill) : "";

        // If the fill character is "0", grouping is applied after padding.
        if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

        // Reconstruct the final output based on the desired alignment.
        switch (align) {
          case "<": value = valuePrefix + value + valueSuffix + padding; break;
          case "=": value = valuePrefix + padding + value + valueSuffix; break;
          case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
          default: value = padding + valuePrefix + value + valueSuffix; break;
        }

        return numerals(value);
      }

      format.toString = function() {
        return specifier + "";
      };

      return format;
    }

    function formatPrefix(specifier, value) {
      var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
          e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
          k = Math.pow(10, -e),
          prefix = prefixes[8 + e / 3];
      return function(value) {
        return f(k * value) + prefix;
      };
    }

    return {
      format: newFormat,
      formatPrefix: formatPrefix
    };
  }

  var locale;
  var format;
  var formatPrefix;

  defaultLocale({
    decimal: ".",
    thousands: ",",
    grouping: [3],
    currency: ["$", ""]
  });

  function defaultLocale(definition) {
    locale = formatLocale(definition);
    format = locale.format;
    formatPrefix = locale.formatPrefix;
    return locale;
  }

  function precisionFixed(step) {
    return Math.max(0, -exponent(Math.abs(step)));
  }

  function precisionPrefix(step, value) {
    return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
  }

  function precisionRound(step, max) {
    step = Math.abs(step), max = Math.abs(max) - step;
    return Math.max(0, exponent(max) - exponent(step)) + 1;
  }

  function tickFormat(domain, count, specifier) {
    var start = domain[0],
        stop = domain[domain.length - 1],
        step = tickStep(start, stop, count == null ? 10 : count),
        precision;
    specifier = formatSpecifier(specifier == null ? ",f" : specifier);
    switch (specifier.type) {
      case "s": {
        var value = Math.max(Math.abs(start), Math.abs(stop));
        if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
        return formatPrefix(specifier, value);
      }
      case "":
      case "e":
      case "g":
      case "p":
      case "r": {
        if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
        break;
      }
      case "f":
      case "%": {
        if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
        break;
      }
    }
    return format(specifier);
  }

  function linearish(scale) {
    var domain = scale.domain;

    scale.ticks = function(count) {
      var d = domain();
      return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
    };

    scale.tickFormat = function(count, specifier) {
      return tickFormat(domain(), count, specifier);
    };

    scale.nice = function(count) {
      if (count == null) count = 10;

      var d = domain(),
          i0 = 0,
          i1 = d.length - 1,
          start = d[i0],
          stop = d[i1],
          step;

      if (stop < start) {
        step = start, start = stop, stop = step;
        step = i0, i0 = i1, i1 = step;
      }

      step = tickIncrement(start, stop, count);

      if (step > 0) {
        start = Math.floor(start / step) * step;
        stop = Math.ceil(stop / step) * step;
        step = tickIncrement(start, stop, count);
      } else if (step < 0) {
        start = Math.ceil(start * step) / step;
        stop = Math.floor(stop * step) / step;
        step = tickIncrement(start, stop, count);
      }

      if (step > 0) {
        d[i0] = Math.floor(start / step) * step;
        d[i1] = Math.ceil(stop / step) * step;
        domain(d);
      } else if (step < 0) {
        d[i0] = Math.ceil(start * step) / step;
        d[i1] = Math.floor(stop * step) / step;
        domain(d);
      }

      return scale;
    };

    return scale;
  }

  function linear$1() {
    var scale = continuous(deinterpolateLinear, number$1);

    scale.copy = function() {
      return copy(scale, linear$1());
    };

    return linearish(scale);
  }

  var t0$1 = new Date,
      t1$1 = new Date;

  function newInterval(floori, offseti, count, field) {

    function interval(date) {
      return floori(date = new Date(+date)), date;
    }

    interval.floor = interval;

    interval.ceil = function(date) {
      return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
    };

    interval.round = function(date) {
      var d0 = interval(date),
          d1 = interval.ceil(date);
      return date - d0 < d1 - date ? d0 : d1;
    };

    interval.offset = function(date, step) {
      return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
    };

    interval.range = function(start, stop, step) {
      var range = [], previous;
      start = interval.ceil(start);
      step = step == null ? 1 : Math.floor(step);
      if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
      do range.push(previous = new Date(+start)), offseti(start, step), floori(start);
      while (previous < start && start < stop);
      return range;
    };

    interval.filter = function(test) {
      return newInterval(function(date) {
        if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
      }, function(date, step) {
        if (date >= date) {
          if (step < 0) while (++step <= 0) {
            while (offseti(date, -1), !test(date)) {} // eslint-disable-line no-empty
          } else while (--step >= 0) {
            while (offseti(date, +1), !test(date)) {} // eslint-disable-line no-empty
          }
        }
      });
    };

    if (count) {
      interval.count = function(start, end) {
        t0$1.setTime(+start), t1$1.setTime(+end);
        floori(t0$1), floori(t1$1);
        return Math.floor(count(t0$1, t1$1));
      };

      interval.every = function(step) {
        step = Math.floor(step);
        return !isFinite(step) || !(step > 0) ? null
            : !(step > 1) ? interval
            : interval.filter(field
                ? function(d) { return field(d) % step === 0; }
                : function(d) { return interval.count(0, d) % step === 0; });
      };
    }

    return interval;
  }

  var millisecond = newInterval(function() {
    // noop
  }, function(date, step) {
    date.setTime(+date + step);
  }, function(start, end) {
    return end - start;
  });

  // An optimized implementation for this simple case.
  millisecond.every = function(k) {
    k = Math.floor(k);
    if (!isFinite(k) || !(k > 0)) return null;
    if (!(k > 1)) return millisecond;
    return newInterval(function(date) {
      date.setTime(Math.floor(date / k) * k);
    }, function(date, step) {
      date.setTime(+date + step * k);
    }, function(start, end) {
      return (end - start) / k;
    });
  };

  var durationSecond = 1e3;
  var durationMinute = 6e4;
  var durationHour = 36e5;
  var durationDay = 864e5;
  var durationWeek = 6048e5;

  var second = newInterval(function(date) {
    date.setTime(Math.floor(date / durationSecond) * durationSecond);
  }, function(date, step) {
    date.setTime(+date + step * durationSecond);
  }, function(start, end) {
    return (end - start) / durationSecond;
  }, function(date) {
    return date.getUTCSeconds();
  });

  var minute = newInterval(function(date) {
    date.setTime(Math.floor(date / durationMinute) * durationMinute);
  }, function(date, step) {
    date.setTime(+date + step * durationMinute);
  }, function(start, end) {
    return (end - start) / durationMinute;
  }, function(date) {
    return date.getMinutes();
  });

  var hour = newInterval(function(date) {
    var offset = date.getTimezoneOffset() * durationMinute % durationHour;
    if (offset < 0) offset += durationHour;
    date.setTime(Math.floor((+date - offset) / durationHour) * durationHour + offset);
  }, function(date, step) {
    date.setTime(+date + step * durationHour);
  }, function(start, end) {
    return (end - start) / durationHour;
  }, function(date) {
    return date.getHours();
  });

  var day = newInterval(function(date) {
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setDate(date.getDate() + step);
  }, function(start, end) {
    return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay;
  }, function(date) {
    return date.getDate() - 1;
  });

  function weekday(i) {
    return newInterval(function(date) {
      date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setDate(date.getDate() + step * 7);
    }, function(start, end) {
      return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
    });
  }

  var sunday = weekday(0);
  var monday = weekday(1);
  var tuesday = weekday(2);
  var wednesday = weekday(3);
  var thursday = weekday(4);
  var friday = weekday(5);
  var saturday = weekday(6);

  var month = newInterval(function(date) {
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setMonth(date.getMonth() + step);
  }, function(start, end) {
    return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
  }, function(date) {
    return date.getMonth();
  });

  var year = newInterval(function(date) {
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setFullYear(date.getFullYear() + step);
  }, function(start, end) {
    return end.getFullYear() - start.getFullYear();
  }, function(date) {
    return date.getFullYear();
  });

  // An optimized implementation for this simple case.
  year.every = function(k) {
    return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
      date.setFullYear(Math.floor(date.getFullYear() / k) * k);
      date.setMonth(0, 1);
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setFullYear(date.getFullYear() + step * k);
    });
  };

  var utcMinute = newInterval(function(date) {
    date.setUTCSeconds(0, 0);
  }, function(date, step) {
    date.setTime(+date + step * durationMinute);
  }, function(start, end) {
    return (end - start) / durationMinute;
  }, function(date) {
    return date.getUTCMinutes();
  });

  var utcHour = newInterval(function(date) {
    date.setUTCMinutes(0, 0, 0);
  }, function(date, step) {
    date.setTime(+date + step * durationHour);
  }, function(start, end) {
    return (end - start) / durationHour;
  }, function(date) {
    return date.getUTCHours();
  });

  var utcDay = newInterval(function(date) {
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCDate(date.getUTCDate() + step);
  }, function(start, end) {
    return (end - start) / durationDay;
  }, function(date) {
    return date.getUTCDate() - 1;
  });

  function utcWeekday(i) {
    return newInterval(function(date) {
      date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCDate(date.getUTCDate() + step * 7);
    }, function(start, end) {
      return (end - start) / durationWeek;
    });
  }

  var utcSunday = utcWeekday(0);
  var utcMonday = utcWeekday(1);
  var utcTuesday = utcWeekday(2);
  var utcWednesday = utcWeekday(3);
  var utcThursday = utcWeekday(4);
  var utcFriday = utcWeekday(5);
  var utcSaturday = utcWeekday(6);

  var utcMonth = newInterval(function(date) {
    date.setUTCDate(1);
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCMonth(date.getUTCMonth() + step);
  }, function(start, end) {
    return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
  }, function(date) {
    return date.getUTCMonth();
  });

  var utcYear = newInterval(function(date) {
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCFullYear(date.getUTCFullYear() + step);
  }, function(start, end) {
    return end.getUTCFullYear() - start.getUTCFullYear();
  }, function(date) {
    return date.getUTCFullYear();
  });

  // An optimized implementation for this simple case.
  utcYear.every = function(k) {
    return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
      date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
      date.setUTCMonth(0, 1);
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCFullYear(date.getUTCFullYear() + step * k);
    });
  };

  function localDate(d) {
    if (0 <= d.y && d.y < 100) {
      var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
      date.setFullYear(d.y);
      return date;
    }
    return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
  }

  function utcDate(d) {
    if (0 <= d.y && d.y < 100) {
      var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
      date.setUTCFullYear(d.y);
      return date;
    }
    return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
  }

  function newYear(y) {
    return {y: y, m: 0, d: 1, H: 0, M: 0, S: 0, L: 0};
  }

  function formatLocale$1(locale) {
    var locale_dateTime = locale.dateTime,
        locale_date = locale.date,
        locale_time = locale.time,
        locale_periods = locale.periods,
        locale_weekdays = locale.days,
        locale_shortWeekdays = locale.shortDays,
        locale_months = locale.months,
        locale_shortMonths = locale.shortMonths;

    var periodRe = formatRe(locale_periods),
        periodLookup = formatLookup(locale_periods),
        weekdayRe = formatRe(locale_weekdays),
        weekdayLookup = formatLookup(locale_weekdays),
        shortWeekdayRe = formatRe(locale_shortWeekdays),
        shortWeekdayLookup = formatLookup(locale_shortWeekdays),
        monthRe = formatRe(locale_months),
        monthLookup = formatLookup(locale_months),
        shortMonthRe = formatRe(locale_shortMonths),
        shortMonthLookup = formatLookup(locale_shortMonths);

    var formats = {
      "a": formatShortWeekday,
      "A": formatWeekday,
      "b": formatShortMonth,
      "B": formatMonth,
      "c": null,
      "d": formatDayOfMonth,
      "e": formatDayOfMonth,
      "f": formatMicroseconds,
      "H": formatHour24,
      "I": formatHour12,
      "j": formatDayOfYear,
      "L": formatMilliseconds,
      "m": formatMonthNumber,
      "M": formatMinutes,
      "p": formatPeriod,
      "Q": formatUnixTimestamp,
      "s": formatUnixTimestampSeconds,
      "S": formatSeconds,
      "u": formatWeekdayNumberMonday,
      "U": formatWeekNumberSunday,
      "V": formatWeekNumberISO,
      "w": formatWeekdayNumberSunday,
      "W": formatWeekNumberMonday,
      "x": null,
      "X": null,
      "y": formatYear,
      "Y": formatFullYear,
      "Z": formatZone,
      "%": formatLiteralPercent
    };

    var utcFormats = {
      "a": formatUTCShortWeekday,
      "A": formatUTCWeekday,
      "b": formatUTCShortMonth,
      "B": formatUTCMonth,
      "c": null,
      "d": formatUTCDayOfMonth,
      "e": formatUTCDayOfMonth,
      "f": formatUTCMicroseconds,
      "H": formatUTCHour24,
      "I": formatUTCHour12,
      "j": formatUTCDayOfYear,
      "L": formatUTCMilliseconds,
      "m": formatUTCMonthNumber,
      "M": formatUTCMinutes,
      "p": formatUTCPeriod,
      "Q": formatUnixTimestamp,
      "s": formatUnixTimestampSeconds,
      "S": formatUTCSeconds,
      "u": formatUTCWeekdayNumberMonday,
      "U": formatUTCWeekNumberSunday,
      "V": formatUTCWeekNumberISO,
      "w": formatUTCWeekdayNumberSunday,
      "W": formatUTCWeekNumberMonday,
      "x": null,
      "X": null,
      "y": formatUTCYear,
      "Y": formatUTCFullYear,
      "Z": formatUTCZone,
      "%": formatLiteralPercent
    };

    var parses = {
      "a": parseShortWeekday,
      "A": parseWeekday,
      "b": parseShortMonth,
      "B": parseMonth,
      "c": parseLocaleDateTime,
      "d": parseDayOfMonth,
      "e": parseDayOfMonth,
      "f": parseMicroseconds,
      "H": parseHour24,
      "I": parseHour24,
      "j": parseDayOfYear,
      "L": parseMilliseconds,
      "m": parseMonthNumber,
      "M": parseMinutes,
      "p": parsePeriod,
      "Q": parseUnixTimestamp,
      "s": parseUnixTimestampSeconds,
      "S": parseSeconds,
      "u": parseWeekdayNumberMonday,
      "U": parseWeekNumberSunday,
      "V": parseWeekNumberISO,
      "w": parseWeekdayNumberSunday,
      "W": parseWeekNumberMonday,
      "x": parseLocaleDate,
      "X": parseLocaleTime,
      "y": parseYear,
      "Y": parseFullYear,
      "Z": parseZone,
      "%": parseLiteralPercent
    };

    // These recursive directive definitions must be deferred.
    formats.x = newFormat(locale_date, formats);
    formats.X = newFormat(locale_time, formats);
    formats.c = newFormat(locale_dateTime, formats);
    utcFormats.x = newFormat(locale_date, utcFormats);
    utcFormats.X = newFormat(locale_time, utcFormats);
    utcFormats.c = newFormat(locale_dateTime, utcFormats);

    function newFormat(specifier, formats) {
      return function(date) {
        var string = [],
            i = -1,
            j = 0,
            n = specifier.length,
            c,
            pad,
            format;

        if (!(date instanceof Date)) date = new Date(+date);

        while (++i < n) {
          if (specifier.charCodeAt(i) === 37) {
            string.push(specifier.slice(j, i));
            if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
            else pad = c === "e" ? " " : "0";
            if (format = formats[c]) c = format(date, pad);
            string.push(c);
            j = i + 1;
          }
        }

        string.push(specifier.slice(j, i));
        return string.join("");
      };
    }

    function newParse(specifier, newDate) {
      return function(string) {
        var d = newYear(1900),
            i = parseSpecifier(d, specifier, string += "", 0),
            week, day$$1;
        if (i != string.length) return null;

        // If a UNIX timestamp is specified, return it.
        if ("Q" in d) return new Date(d.Q);

        // The am-pm flag is 0 for AM, and 1 for PM.
        if ("p" in d) d.H = d.H % 12 + d.p * 12;

        // Convert day-of-week and week-of-year to day-of-year.
        if ("V" in d) {
          if (d.V < 1 || d.V > 53) return null;
          if (!("w" in d)) d.w = 1;
          if ("Z" in d) {
            week = utcDate(newYear(d.y)), day$$1 = week.getUTCDay();
            week = day$$1 > 4 || day$$1 === 0 ? utcMonday.ceil(week) : utcMonday(week);
            week = utcDay.offset(week, (d.V - 1) * 7);
            d.y = week.getUTCFullYear();
            d.m = week.getUTCMonth();
            d.d = week.getUTCDate() + (d.w + 6) % 7;
          } else {
            week = newDate(newYear(d.y)), day$$1 = week.getDay();
            week = day$$1 > 4 || day$$1 === 0 ? monday.ceil(week) : monday(week);
            week = day.offset(week, (d.V - 1) * 7);
            d.y = week.getFullYear();
            d.m = week.getMonth();
            d.d = week.getDate() + (d.w + 6) % 7;
          }
        } else if ("W" in d || "U" in d) {
          if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
          day$$1 = "Z" in d ? utcDate(newYear(d.y)).getUTCDay() : newDate(newYear(d.y)).getDay();
          d.m = 0;
          d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day$$1 + 5) % 7 : d.w + d.U * 7 - (day$$1 + 6) % 7;
        }

        // If a time zone is specified, all fields are interpreted as UTC and then
        // offset according to the specified time zone.
        if ("Z" in d) {
          d.H += d.Z / 100 | 0;
          d.M += d.Z % 100;
          return utcDate(d);
        }

        // Otherwise, all fields are in local time.
        return newDate(d);
      };
    }

    function parseSpecifier(d, specifier, string, j) {
      var i = 0,
          n = specifier.length,
          m = string.length,
          c,
          parse;

      while (i < n) {
        if (j >= m) return -1;
        c = specifier.charCodeAt(i++);
        if (c === 37) {
          c = specifier.charAt(i++);
          parse = parses[c in pads ? specifier.charAt(i++) : c];
          if (!parse || ((j = parse(d, string, j)) < 0)) return -1;
        } else if (c != string.charCodeAt(j++)) {
          return -1;
        }
      }

      return j;
    }

    function parsePeriod(d, string, i) {
      var n = periodRe.exec(string.slice(i));
      return n ? (d.p = periodLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }

    function parseShortWeekday(d, string, i) {
      var n = shortWeekdayRe.exec(string.slice(i));
      return n ? (d.w = shortWeekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }

    function parseWeekday(d, string, i) {
      var n = weekdayRe.exec(string.slice(i));
      return n ? (d.w = weekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }

    function parseShortMonth(d, string, i) {
      var n = shortMonthRe.exec(string.slice(i));
      return n ? (d.m = shortMonthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }

    function parseMonth(d, string, i) {
      var n = monthRe.exec(string.slice(i));
      return n ? (d.m = monthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }

    function parseLocaleDateTime(d, string, i) {
      return parseSpecifier(d, locale_dateTime, string, i);
    }

    function parseLocaleDate(d, string, i) {
      return parseSpecifier(d, locale_date, string, i);
    }

    function parseLocaleTime(d, string, i) {
      return parseSpecifier(d, locale_time, string, i);
    }

    function formatShortWeekday(d) {
      return locale_shortWeekdays[d.getDay()];
    }

    function formatWeekday(d) {
      return locale_weekdays[d.getDay()];
    }

    function formatShortMonth(d) {
      return locale_shortMonths[d.getMonth()];
    }

    function formatMonth(d) {
      return locale_months[d.getMonth()];
    }

    function formatPeriod(d) {
      return locale_periods[+(d.getHours() >= 12)];
    }

    function formatUTCShortWeekday(d) {
      return locale_shortWeekdays[d.getUTCDay()];
    }

    function formatUTCWeekday(d) {
      return locale_weekdays[d.getUTCDay()];
    }

    function formatUTCShortMonth(d) {
      return locale_shortMonths[d.getUTCMonth()];
    }

    function formatUTCMonth(d) {
      return locale_months[d.getUTCMonth()];
    }

    function formatUTCPeriod(d) {
      return locale_periods[+(d.getUTCHours() >= 12)];
    }

    return {
      format: function(specifier) {
        var f = newFormat(specifier += "", formats);
        f.toString = function() { return specifier; };
        return f;
      },
      parse: function(specifier) {
        var p = newParse(specifier += "", localDate);
        p.toString = function() { return specifier; };
        return p;
      },
      utcFormat: function(specifier) {
        var f = newFormat(specifier += "", utcFormats);
        f.toString = function() { return specifier; };
        return f;
      },
      utcParse: function(specifier) {
        var p = newParse(specifier, utcDate);
        p.toString = function() { return specifier; };
        return p;
      }
    };
  }

  var pads = {"-": "", "_": " ", "0": "0"},
      numberRe = /^\s*\d+/, // note: ignores next directive
      percentRe = /^%/,
      requoteRe = /[\\^$*+?|[\]().{}]/g;

  function pad(value, fill, width) {
    var sign = value < 0 ? "-" : "",
        string = (sign ? -value : value) + "",
        length = string.length;
    return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
  }

  function requote(s) {
    return s.replace(requoteRe, "\\$&");
  }

  function formatRe(names) {
    return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
  }

  function formatLookup(names) {
    var map = {}, i = -1, n = names.length;
    while (++i < n) map[names[i].toLowerCase()] = i;
    return map;
  }

  function parseWeekdayNumberSunday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 1));
    return n ? (d.w = +n[0], i + n[0].length) : -1;
  }

  function parseWeekdayNumberMonday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 1));
    return n ? (d.u = +n[0], i + n[0].length) : -1;
  }

  function parseWeekNumberSunday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.U = +n[0], i + n[0].length) : -1;
  }

  function parseWeekNumberISO(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.V = +n[0], i + n[0].length) : -1;
  }

  function parseWeekNumberMonday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.W = +n[0], i + n[0].length) : -1;
  }

  function parseFullYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 4));
    return n ? (d.y = +n[0], i + n[0].length) : -1;
  }

  function parseYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
  }

  function parseZone(d, string, i) {
    var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
    return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
  }

  function parseMonthNumber(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
  }

  function parseDayOfMonth(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.d = +n[0], i + n[0].length) : -1;
  }

  function parseDayOfYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 3));
    return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
  }

  function parseHour24(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.H = +n[0], i + n[0].length) : -1;
  }

  function parseMinutes(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.M = +n[0], i + n[0].length) : -1;
  }

  function parseSeconds(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.S = +n[0], i + n[0].length) : -1;
  }

  function parseMilliseconds(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 3));
    return n ? (d.L = +n[0], i + n[0].length) : -1;
  }

  function parseMicroseconds(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 6));
    return n ? (d.L = Math.floor(n[0] / 1000), i + n[0].length) : -1;
  }

  function parseLiteralPercent(d, string, i) {
    var n = percentRe.exec(string.slice(i, i + 1));
    return n ? i + n[0].length : -1;
  }

  function parseUnixTimestamp(d, string, i) {
    var n = numberRe.exec(string.slice(i));
    return n ? (d.Q = +n[0], i + n[0].length) : -1;
  }

  function parseUnixTimestampSeconds(d, string, i) {
    var n = numberRe.exec(string.slice(i));
    return n ? (d.Q = (+n[0]) * 1000, i + n[0].length) : -1;
  }

  function formatDayOfMonth(d, p) {
    return pad(d.getDate(), p, 2);
  }

  function formatHour24(d, p) {
    return pad(d.getHours(), p, 2);
  }

  function formatHour12(d, p) {
    return pad(d.getHours() % 12 || 12, p, 2);
  }

  function formatDayOfYear(d, p) {
    return pad(1 + day.count(year(d), d), p, 3);
  }

  function formatMilliseconds(d, p) {
    return pad(d.getMilliseconds(), p, 3);
  }

  function formatMicroseconds(d, p) {
    return formatMilliseconds(d, p) + "000";
  }

  function formatMonthNumber(d, p) {
    return pad(d.getMonth() + 1, p, 2);
  }

  function formatMinutes(d, p) {
    return pad(d.getMinutes(), p, 2);
  }

  function formatSeconds(d, p) {
    return pad(d.getSeconds(), p, 2);
  }

  function formatWeekdayNumberMonday(d) {
    var day$$1 = d.getDay();
    return day$$1 === 0 ? 7 : day$$1;
  }

  function formatWeekNumberSunday(d, p) {
    return pad(sunday.count(year(d), d), p, 2);
  }

  function formatWeekNumberISO(d, p) {
    var day$$1 = d.getDay();
    d = (day$$1 >= 4 || day$$1 === 0) ? thursday(d) : thursday.ceil(d);
    return pad(thursday.count(year(d), d) + (year(d).getDay() === 4), p, 2);
  }

  function formatWeekdayNumberSunday(d) {
    return d.getDay();
  }

  function formatWeekNumberMonday(d, p) {
    return pad(monday.count(year(d), d), p, 2);
  }

  function formatYear(d, p) {
    return pad(d.getFullYear() % 100, p, 2);
  }

  function formatFullYear(d, p) {
    return pad(d.getFullYear() % 10000, p, 4);
  }

  function formatZone(d) {
    var z = d.getTimezoneOffset();
    return (z > 0 ? "-" : (z *= -1, "+"))
        + pad(z / 60 | 0, "0", 2)
        + pad(z % 60, "0", 2);
  }

  function formatUTCDayOfMonth(d, p) {
    return pad(d.getUTCDate(), p, 2);
  }

  function formatUTCHour24(d, p) {
    return pad(d.getUTCHours(), p, 2);
  }

  function formatUTCHour12(d, p) {
    return pad(d.getUTCHours() % 12 || 12, p, 2);
  }

  function formatUTCDayOfYear(d, p) {
    return pad(1 + utcDay.count(utcYear(d), d), p, 3);
  }

  function formatUTCMilliseconds(d, p) {
    return pad(d.getUTCMilliseconds(), p, 3);
  }

  function formatUTCMicroseconds(d, p) {
    return formatUTCMilliseconds(d, p) + "000";
  }

  function formatUTCMonthNumber(d, p) {
    return pad(d.getUTCMonth() + 1, p, 2);
  }

  function formatUTCMinutes(d, p) {
    return pad(d.getUTCMinutes(), p, 2);
  }

  function formatUTCSeconds(d, p) {
    return pad(d.getUTCSeconds(), p, 2);
  }

  function formatUTCWeekdayNumberMonday(d) {
    var dow = d.getUTCDay();
    return dow === 0 ? 7 : dow;
  }

  function formatUTCWeekNumberSunday(d, p) {
    return pad(utcSunday.count(utcYear(d), d), p, 2);
  }

  function formatUTCWeekNumberISO(d, p) {
    var day$$1 = d.getUTCDay();
    d = (day$$1 >= 4 || day$$1 === 0) ? utcThursday(d) : utcThursday.ceil(d);
    return pad(utcThursday.count(utcYear(d), d) + (utcYear(d).getUTCDay() === 4), p, 2);
  }

  function formatUTCWeekdayNumberSunday(d) {
    return d.getUTCDay();
  }

  function formatUTCWeekNumberMonday(d, p) {
    return pad(utcMonday.count(utcYear(d), d), p, 2);
  }

  function formatUTCYear(d, p) {
    return pad(d.getUTCFullYear() % 100, p, 2);
  }

  function formatUTCFullYear(d, p) {
    return pad(d.getUTCFullYear() % 10000, p, 4);
  }

  function formatUTCZone() {
    return "+0000";
  }

  function formatLiteralPercent() {
    return "%";
  }

  function formatUnixTimestamp(d) {
    return +d;
  }

  function formatUnixTimestampSeconds(d) {
    return Math.floor(+d / 1000);
  }

  var locale$1;
  var timeFormat;
  var timeParse;
  var utcFormat;
  var utcParse;

  defaultLocale$1({
    dateTime: "%x, %X",
    date: "%-m/%-d/%Y",
    time: "%-I:%M:%S %p",
    periods: ["AM", "PM"],
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  });

  function defaultLocale$1(definition) {
    locale$1 = formatLocale$1(definition);
    timeFormat = locale$1.format;
    timeParse = locale$1.parse;
    utcFormat = locale$1.utcFormat;
    utcParse = locale$1.utcParse;
    return locale$1;
  }

  var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";

  function formatIsoNative(date) {
    return date.toISOString();
  }

  var formatIso = Date.prototype.toISOString
      ? formatIsoNative
      : utcFormat(isoSpecifier);

  function parseIsoNative(string) {
    var date = new Date(string);
    return isNaN(date) ? null : date;
  }

  var parseIso = +new Date("2000-01-01T00:00:00.000Z")
      ? parseIsoNative
      : utcParse(isoSpecifier);

  function colors(s) {
    return s.match(/.{6}/g).map(function(x) {
      return "#" + x;
    });
  }

  var schemeCategory10 = colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");

  colors("393b795254a36b6ecf9c9ede6379398ca252b5cf6bcedb9c8c6d31bd9e39e7ba52e7cb94843c39ad494ad6616be7969c7b4173a55194ce6dbdde9ed6");

  colors("3182bd6baed69ecae1c6dbefe6550dfd8d3cfdae6bfdd0a231a35474c476a1d99bc7e9c0756bb19e9ac8bcbddcdadaeb636363969696bdbdbdd9d9d9");

  colors("1f77b4aec7e8ff7f0effbb782ca02c98df8ad62728ff98969467bdc5b0d58c564bc49c94e377c2f7b6d27f7f7fc7c7c7bcbd22dbdb8d17becf9edae5");

  cubehelixLong(cubehelix(300, 0.5, 0.0), cubehelix(-240, 0.5, 1.0));

  var warm = cubehelixLong(cubehelix(-100, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

  var cool = cubehelixLong(cubehelix(260, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

  var rainbow = cubehelix();

  function ramp(range) {
    var n = range.length;
    return function(t) {
      return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
    };
  }

  ramp(colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));

  var magma = ramp(colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));

  var inferno = ramp(colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));

  var plasma = ramp(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));

  var noop = (function () {});

  var identity$4 = (function (d) {
    return d;
  });

  // copied from https://github.com/d3fc/d3fc-rebind/blob/master/src/rebind.js

  function zipper() {
  	var combine = identity$4;

  	function zip$$1() {
  		var n = arguments.length;
  		if (!n) return [];
  		var m = min(arguments, d3_zipLength);

  		// eslint-disable-next-line prefer-const
  		var i = void 0,
  		    zips = new Array(m);
  		for (i = -1; ++i < m;) {
  			for (var j = -1, _zip = zips[i] = new Array(n); ++j < n;) {
  				_zip[j] = arguments[j][i];
  			}
  			zips[i] = combine.apply(this, zips[i]);
  		}
  		return zips;
  	}
  	function d3_zipLength(d) {
  		return d.length;
  	}
  	zip$$1.combine = function (x) {
  		if (!arguments.length) {
  			return combine;
  		}
  		combine = x;
  		return zip$$1;
  	};
  	return zip$$1;
  }

  /*
  https://github.com/ScottLogic/d3fc/blob/master/src/indicator/algorithm/merge.js

  The MIT License (MIT)

  Copyright (c) 2014-2015 Scott Logic Ltd.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
  */

  function slidingWindow () {

  	var undefinedValue = undefined,
  	    windowSize = 10,
  	    accumulator = noop,
  	    sourcePath = void 0,
  	    source = void 0,
  	    skipInitial = 0,
  	    misc = void 0;

  	// eslint-disable-next-line prefer-const
  	var slidingWindow$$1 = function slidingWindow$$1(data) {
  		var sourceFunction = source || path(sourcePath);

  		var size = functor(windowSize).apply(this, arguments);
  		var windowData = data.slice(skipInitial, size + skipInitial).map(sourceFunction);
  		var accumulatorIdx = 0;
  		var undef = functor(undefinedValue);
  		// console.log(skipInitial, size, data.length, windowData.length);
  		return data.map(function (d, i) {
  			// console.log(d, i);
  			if (i < skipInitial + size - 1) {
  				return undef(sourceFunction(d), i, misc);
  			}
  			if (i >= skipInitial + size) {
  				// Treat windowData as FIFO rolling buffer
  				windowData.shift();
  				windowData.push(sourceFunction(d, i));
  			}
  			return accumulator(windowData, i, accumulatorIdx++, misc);
  		});
  	};

  	slidingWindow$$1.undefinedValue = function (x) {
  		if (!arguments.length) {
  			return undefinedValue;
  		}
  		undefinedValue = x;
  		return slidingWindow$$1;
  	};
  	slidingWindow$$1.windowSize = function (x) {
  		if (!arguments.length) {
  			return windowSize;
  		}
  		windowSize = x;
  		return slidingWindow$$1;
  	};
  	slidingWindow$$1.misc = function (x) {
  		if (!arguments.length) {
  			return misc;
  		}
  		misc = x;
  		return slidingWindow$$1;
  	};
  	slidingWindow$$1.accumulator = function (x) {
  		if (!arguments.length) {
  			return accumulator;
  		}
  		accumulator = x;
  		return slidingWindow$$1;
  	};
  	slidingWindow$$1.skipInitial = function (x) {
  		if (!arguments.length) {
  			return skipInitial;
  		}
  		skipInitial = x;
  		return slidingWindow$$1;
  	};
  	slidingWindow$$1.sourcePath = function (x) {
  		if (!arguments.length) {
  			return sourcePath;
  		}
  		sourcePath = x;
  		return slidingWindow$$1;
  	};
  	slidingWindow$$1.source = function (x) {
  		if (!arguments.length) {
  			return source;
  		}
  		source = x;
  		return slidingWindow$$1;
  	};

  	return slidingWindow$$1;
  }

  // https://github.com/jonschlinkert/is-equal-shallow/

  /*
  The MIT License (MIT)

  Copyright (c) 2015, Jon Schlinkert.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
  */

  function isDate(date) {
  	return Object.prototype.toString.call(date) === "[object Date]";
  }

  function isEqual(val1, val2) {
  	return isDate(val1) && isDate(val2) ? val1.getTime() === val2.getTime() : val1 === val2;
  }

  function shallowEqual(a, b) {
  	if (!a && !b) {
  		return true;
  	}
  	if (!a && b || a && !b) {
  		return false;
  	}

  	var numKeysA = 0,
  	    numKeysB = 0,
  	    key = void 0;
  	for (key in b) {
  		numKeysB++;
  		if ( /* !isPrimitive(b[key]) || */b.hasOwnProperty(key) && !a.hasOwnProperty(key) || !isEqual(a[key], b[key])) {
  			// console.log(key, a, b);
  			return false;
  		}
  	}
  	for (key in a) {
  		numKeysA++;
  	}
  	return numKeysA === numKeysB;
  }

  function accumulatingWindow () {

  	var accumulateTill = functor(false),
  	    accumulator = noop,
  	    value = identity$4,
  	    discardTillStart = false,
  	    discardTillEnd = false;

  	// eslint-disable-next-line prefer-const
  	var accumulatingWindow$$1 = function accumulatingWindow$$1(data) {
  		var accumulatedWindow = discardTillStart ? undefined : [];
  		var response = [];
  		var accumulatorIdx = 0;
  		var i = 0;
  		for (i = 0; i < data.length; i++) {
  			var d = data[i];
  			// console.log(d, accumulateTill(d));
  			if (accumulateTill(d, i, accumulatedWindow || [])) {
  				if (accumulatedWindow && accumulatedWindow.length > 0) response.push(accumulator(accumulatedWindow, i, accumulatorIdx++));
  				accumulatedWindow = [value(d)];
  			} else {
  				if (accumulatedWindow) accumulatedWindow.push(value(d));
  			}
  		}
  		if (!discardTillEnd) response.push(accumulator(accumulatedWindow, i, accumulatorIdx));
  		return response;
  	};

  	accumulatingWindow$$1.accumulateTill = function (x) {
  		if (!arguments.length) {
  			return accumulateTill;
  		}
  		accumulateTill = functor(x);
  		return accumulatingWindow$$1;
  	};
  	accumulatingWindow$$1.accumulator = function (x) {
  		if (!arguments.length) {
  			return accumulator;
  		}
  		accumulator = x;
  		return accumulatingWindow$$1;
  	};
  	accumulatingWindow$$1.value = function (x) {
  		if (!arguments.length) {
  			return value;
  		}
  		value = x;
  		return accumulatingWindow$$1;
  	};
  	accumulatingWindow$$1.discardTillStart = function (x) {
  		if (!arguments.length) {
  			return discardTillStart;
  		}
  		discardTillStart = x;
  		return accumulatingWindow$$1;
  	};
  	accumulatingWindow$$1.discardTillEnd = function (x) {
  		if (!arguments.length) {
  			return discardTillEnd;
  		}
  		discardTillEnd = x;
  		return accumulatingWindow$$1;
  	};
  	return accumulatingWindow$$1;
  }

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var PureComponent = function (_React$Component) {
  	_inherits(PureComponent, _React$Component);

  	function PureComponent() {
  		_classCallCheck(this, PureComponent);

  		return _possibleConstructorReturn(this, (PureComponent.__proto__ || Object.getPrototypeOf(PureComponent)).apply(this, arguments));
  	}

  	_createClass(PureComponent, [{
  		key: "shouldComponentUpdate",
  		value: function shouldComponentUpdate(nextProps, nextState, nextContext) {
  			return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState) || !shallowEqual(this.context, nextContext);
  		}
  	}]);

  	return PureComponent;
  }(React__default.Component);

  var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  /**
   * Bar width is based on the amount of items in the plot data and the distance between the first and last of those
   * items.
   * @param props the props passed to the series.
   * @param moreProps an object holding the xScale, xAccessor and plotData.
   * @return {number} the bar width.
   */
  function plotDataLengthBarWidth$$1(props, moreProps) {
  	var widthRatio = props.widthRatio;
  	var xScale = moreProps.xScale;

  	var _xScale$range = xScale.range(),
  	    _xScale$range2 = _slicedToArray(_xScale$range, 2),
  	    l = _xScale$range2[0],
  	    r = _xScale$range2[1];

  	var totalWidth = Math.abs(r - l);
  	if (xScale.invert != null) {
  		var _xScale$domain = xScale.domain(),
  		    _xScale$domain2 = _slicedToArray(_xScale$domain, 2),
  		    dl = _xScale$domain2[0],
  		    dr = _xScale$domain2[1];

  		var width = totalWidth / Math.abs(dl - dr);
  		return width * widthRatio;
  	} else {
  		var _width = totalWidth / xScale.domain().length;
  		return _width * widthRatio;
  	}
  }

  var strokeDashTypes = ["Solid", "ShortDash", "ShortDash2", "ShortDot", "ShortDashDot", "ShortDashDotDot", "Dot", "Dash", "LongDash", "DashDot", "LongDashDot", "LongDashDotDot"];
  var getStrokeDasharray = function getStrokeDasharray(type) {
  	switch (type) {
  		default:
  		case "Solid":
  			return "none";
  		case "ShortDash":
  			return "6, 2";
  		case "ShortDash2":
  			return "6, 3";
  		case "ShortDot":
  			return "2, 2";
  		case "ShortDashDot":
  			return "6, 2, 2, 2";
  		case "ShortDashDotDot":
  			return "6, 2, 2, 2, 2, 2";
  		case "Dot":
  			return "2, 6";
  		case "Dash":
  			return "8, 6";
  		case "LongDash":
  			return "16, 6";
  		case "DashDot":
  			return "8, 6, 2, 6";
  		case "LongDashDot":
  			return "16, 6, 2, 6";
  		case "LongDashDotDot":
  			return "16, 6, 2, 6, 2, 6";
  	}
  };

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  function getLogger(prefix) {
  	var logger = noop;
  	if (process.env.NODE_ENV !== "production") {
  		logger = require("debug")("react-stockcharts:" + prefix);
  	}
  	return logger;
  }

  function sign(x) {
  	return (x > 0) - (x < 0);
  }

  function path() {
  	var loc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  	var key = Array.isArray(loc) ? loc : [loc];
  	var length = key.length;

  	return function (obj, defaultValue) {
  		if (length === 0) return isDefined(obj) ? obj : defaultValue;

  		var index = 0;
  		while (obj != null && index < length) {
  			obj = obj[key[index++]];
  		}
  		return index === length ? obj : defaultValue;
  	};
  }

  function functor(v) {
  	return typeof v === "function" ? v : function () {
  		return v;
  	};
  }

  function find(list, predicate) {
  	var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this;

  	for (var i = 0; i < list.length; ++i) {
  		if (predicate.call(context, list[i], i, list)) {
  			return list[i];
  		}
  	}
  	return undefined;
  }

  function d3Window(node) {
  	var d3win = node && (node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView);
  	return d3win;
  }

  var MOUSEENTER = "mouseenter.interaction";
  var MOUSELEAVE = "mouseleave.interaction";
  var MOUSEMOVE = "mousemove.pan";
  var MOUSEUP = "mouseup.pan";
  var TOUCHMOVE = "touchmove.pan";
  var TOUCHEND = "touchend.pan touchcancel.pan";

  function getTouchProps(touch) {
  	if (!touch) return {};
  	return {
  		pageX: touch.pageX,
  		pageY: touch.pageY,
  		clientX: touch.clientX,
  		clientY: touch.clientY
  	};
  }

  function getClosestItemIndexes(array, value, accessor, log$$1) {
  	var lo = 0,
  	    hi = array.length - 1;
  	while (hi - lo > 1) {
  		var mid = Math.round((lo + hi) / 2);
  		if (accessor(array[mid]) <= value) {
  			lo = mid;
  		} else {
  			hi = mid;
  		}
  	}
  	// for Date object === does not work, so using the <= in combination with >=
  	// the same code works for both dates and numbers
  	if (accessor(array[lo]).valueOf() === value.valueOf()) hi = lo;
  	if (accessor(array[hi]).valueOf() === value.valueOf()) lo = hi;

  	if (accessor(array[lo]) < value && accessor(array[hi]) < value) lo = hi;
  	if (accessor(array[lo]) > value && accessor(array[hi]) > value) hi = lo;
  	// console.log(lo, accessor(array[lo]), value, accessor(array[hi]), hi);
  	// console.log(accessor(array[lo]), lo, value, accessor(array[lo]) >= value);
  	// console.log(value, hi, accessor(array[hi]), accessor(array[lo]) <= value);

  	// var left = value > accessor(array[lo]) ? lo : lo;
  	// var right = gte(value, accessor(array[hi])) ? Math.min(hi + 1, array.length - 1) : hi;

  	// console.log(value, accessor(array[left]), accessor(array[right]));
  	return { left: lo, right: hi };
  }

  function getClosestItem(array, value, accessor, log$$1) {
  	var _getClosestItemIndexe = getClosestItemIndexes(array, value, accessor, log$$1),
  	    left = _getClosestItemIndexe.left,
  	    right = _getClosestItemIndexe.right;

  	if (left === right) {
  		return array[left];
  	}

  	var closest = Math.abs(accessor(array[left]) - value) < Math.abs(accessor(array[right]) - value) ? array[left] : array[right];
  	if (log$$1) {
  		console.log(array[left], array[right], closest, left, right);
  	}
  	return closest;
  }

  var overlayColors = ordinal(schemeCategory10);

  function head(array, accessor) {
  	if (accessor && array) {
  		var value = void 0;
  		for (var i = 0; i < array.length; i++) {
  			value = array[i];
  			if (isDefined(accessor(value))) return value;
  		}
  		return undefined;
  	}
  	return array ? array[0] : undefined;
  }

  var first = head;

  function last(array, accessor) {
  	if (accessor && array) {
  		var value = void 0;
  		for (var i = array.length - 1; i >= 0; i--) {
  			value = array[i];
  			if (isDefined(accessor(value))) return value;
  		}
  		return undefined;
  	}
  	var length = array ? array.length : 0;
  	return length ? array[length - 1] : undefined;
  }

  function isDefined(d) {
  	return d !== null && typeof d != "undefined";
  }

  function isNotDefined(d) {
  	return !isDefined(d);
  }

  function isObject(d) {
  	return isDefined(d) && (typeof d === "undefined" ? "undefined" : _typeof(d)) === "object" && !Array.isArray(d);
  }

  function touchPosition(touch, e) {
  	var container = e.target,
  	    rect = container.getBoundingClientRect(),
  	    x = touch.clientX - rect.left - container.clientLeft,
  	    y = touch.clientY - rect.top - container.clientTop,
  	    xy = [Math.round(x), Math.round(y)];
  	return xy;
  }

  function mousePosition(e, defaultRect) {
  	var container = e.currentTarget;
  	var rect = defaultRect || container.getBoundingClientRect(),
  	    x = e.clientX - rect.left - container.clientLeft,
  	    y = e.clientY - rect.top - container.clientTop,
  	    xy = [Math.round(x), Math.round(y)];
  	return xy;
  }

  function clearCanvas(canvasList, ratio) {
  	canvasList.forEach(function (each) {
  		each.setTransform(1, 0, 0, 1, 0, 0);
  		each.clearRect(-1, -1, each.canvas.width + 2, each.canvas.height + 2);
  		each.scale(ratio, ratio);
  	});
  }

  function hexToRGBA(inputHex, opacity) {
  	var hex = inputHex.replace("#", "");
  	if (inputHex.indexOf("#") > -1 && (hex.length === 3 || hex.length === 6)) {

  		var multiplier = hex.length === 3 ? 1 : 2;

  		var r = parseInt(hex.substring(0, 1 * multiplier), 16);
  		var g = parseInt(hex.substring(1 * multiplier, 2 * multiplier), 16);
  		var b = parseInt(hex.substring(2 * multiplier, 3 * multiplier), 16);

  		var result = "rgba(" + r + ", " + g + ", " + b + ", " + opacity + ")";

  		return result;
  	}
  	return inputHex;
  }

  // copied from https://github.com/lodash/lodash/blob/master/mapObject.js
  function mapObject() {
  	var object = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  	var iteratee = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : identity$4;

  	var props = Object.keys(object);

  	// eslint-disable-next-line prefer-const
  	var result = new Array(props.length);

  	props.forEach(function (key, index) {
  		result[index] = iteratee(object[key], key, object);
  	});
  	return result;
  }

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  /**
   * lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="npm" -o ./`
   * Copyright jQuery Foundation and other contributors <https://jquery.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   */

  /** Used as references for various `Number` constants. */
  var INFINITY = 1 / 0,
      MAX_SAFE_INTEGER = 9007199254740991;

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]';

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal || freeSelf || Function('return this')();

  /**
   * Appends the elements of `values` to `array`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {Array} values The values to append.
   * @returns {Array} Returns `array`.
   */
  function arrayPush(array, values) {
    var index = -1,
        length = values.length,
        offset = array.length;

    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString = objectProto.toString;

  /** Built-in value references. */
  var Symbol$1 = root.Symbol,
      propertyIsEnumerable = objectProto.propertyIsEnumerable,
      spreadableSymbol = Symbol$1 ? Symbol$1.isConcatSpreadable : undefined;

  /**
   * The base implementation of `_.flatten` with support for restricting flattening.
   *
   * @private
   * @param {Array} array The array to flatten.
   * @param {number} depth The maximum recursion depth.
   * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
   * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
   * @param {Array} [result=[]] The initial result value.
   * @returns {Array} Returns the new flattened array.
   */
  function baseFlatten(array, depth, predicate, isStrict, result) {
    var index = -1,
        length = array.length;

    predicate || (predicate = isFlattenable);
    result || (result = []);

    while (++index < length) {
      var value = array[index];
      if (depth > 0 && predicate(value)) {
        if (depth > 1) {
          // Recursively flatten arrays (susceptible to call stack limits).
          baseFlatten(value, depth - 1, predicate, isStrict, result);
        } else {
          arrayPush(result, value);
        }
      } else if (!isStrict) {
        result[result.length] = value;
      }
    }
    return result;
  }

  /**
   * Checks if `value` is a flattenable `arguments` object or array.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
   */
  function isFlattenable(value) {
    return isArray$1(value) || isArguments(value) ||
      !!(spreadableSymbol && value && value[spreadableSymbol]);
  }

  /**
   * Recursively flattens `array`.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Array
   * @param {Array} array The array to flatten.
   * @returns {Array} Returns the new flattened array.
   * @example
   *
   * _.flattenDeep([1, [2, [3, [4]], 5]]);
   * // => [1, 2, 3, 4, 5]
   */
  function flattenDeep(array) {
    var length = array ? array.length : 0;
    return length ? baseFlatten(array, INFINITY) : [];
  }

  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   *  else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  function isArguments(value) {
    // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
    return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
      (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
  }

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray$1 = Array.isArray;

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }

  /**
   * This method is like `_.isArrayLike` except that it also checks if `value`
   * is an object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array-like object,
   *  else `false`.
   * @example
   *
   * _.isArrayLikeObject([1, 2, 3]);
   * // => true
   *
   * _.isArrayLikeObject(document.body.children);
   * // => true
   *
   * _.isArrayLikeObject('abc');
   * // => false
   *
   * _.isArrayLikeObject(_.noop);
   * // => false
   */
  function isArrayLikeObject(value) {
    return isObjectLike(value) && isArrayLike(value);
  }

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction(value) {
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 8-9 which returns 'object' for typed array and other constructors.
    var tag = isObject$1(value) ? objectToString.call(value) : '';
    return tag == funcTag || tag == genTag;
  }

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength(value) {
    return typeof value == 'number' &&
      value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject$1(value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return !!value && typeof value == 'object';
  }

  var lodash_flattendeep = flattenDeep;

  var _slicedToArray$2 = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$1(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var Chart = function (_PureComponent) {
  	_inherits$1(Chart, _PureComponent);

  	function Chart(props, context) {
  		_classCallCheck$1(this, Chart);

  		var _this = _possibleConstructorReturn$1(this, (Chart.__proto__ || Object.getPrototypeOf(Chart)).call(this, props, context));

  		_this.yScale = _this.yScale.bind(_this);
  		_this.listener = _this.listener.bind(_this);
  		return _this;
  	}

  	_createClass$1(Chart, [{
  		key: "componentWillMount",
  		value: function componentWillMount() {
  			var id = this.props.id;
  			var subscribe = this.context.subscribe;

  			subscribe("chart_" + id, {
  				listener: this.listener
  			});
  		}
  	}, {
  		key: "componentWillUnmount",
  		value: function componentWillUnmount() {
  			var id = this.props.id;
  			var unsubscribe = this.context.unsubscribe;

  			unsubscribe("chart_" + id);
  		}
  	}, {
  		key: "listener",
  		value: function listener(type, moreProps, state, e) {
  			var _props = this.props,
  			    id = _props.id,
  			    onContextMenu = _props.onContextMenu;


  			if (type === "contextmenu") {
  				var currentCharts = moreProps.currentCharts;

  				if (currentCharts.indexOf(id) > -1) {
  					onContextMenu(moreProps, e);
  				}
  			}
  		}
  	}, {
  		key: "yScale",
  		value: function yScale() {
  			var _this2 = this;

  			var chartConfig = find(this.context.chartConfig, function (each) {
  				return each.id === _this2.props.id;
  			});
  			return chartConfig.yScale.copy();
  		}
  	}, {
  		key: "getChildContext",
  		value: function getChildContext() {
  			var chartId = this.props.id;

  			var chartConfig = find(this.context.chartConfig, function (each) {
  				return each.id === chartId;
  			});

  			return {
  				chartId: chartId,
  				chartConfig: chartConfig
  			};
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var _this3 = this;

  			var _find = find(this.context.chartConfig, function (each) {
  				return each.id === _this3.props.id;
  			}),
  			    origin = _find.origin;

  			var _origin = _slicedToArray$2(origin, 2),
  			    x = _origin[0],
  			    y = _origin[1];

  			return React__default.createElement(
  				"g",
  				{ transform: "translate(" + x + ", " + y + ")" },
  				this.props.children
  			);
  		}
  	}]);

  	return Chart;
  }(PureComponent);

  Chart.propTypes = {
  	height: PropTypes.number,
  	origin: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
  	id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  	yExtents: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
  	yExtentsCalculator: function yExtentsCalculator(props, propName, componentName) {
  		if (isNotDefined(props.yExtents) && typeof props.yExtentsCalculator !== "function") return new Error("yExtents or yExtentsCalculator must" + (" be present on " + componentName + ". Validation failed."));
  	},
  	onContextMenu: PropTypes.func,
  	yScale: PropTypes.func,

  	flipYScale: PropTypes.bool,
  	padding: PropTypes.oneOfType([PropTypes.number, PropTypes.shape({
  		top: PropTypes.number,
  		bottom: PropTypes.number
  	})]),
  	children: PropTypes.node
  };

  Chart.defaultProps = {
  	id: 0,
  	origin: [0, 0],
  	padding: 0,
  	yScale: linear$1(),
  	flipYScale: false,
  	yPan: true,
  	yPanEnabled: false,
  	onContextMenu: noop
  };

  Chart.contextTypes = {
  	chartConfig: PropTypes.array,
  	subscribe: PropTypes.func.isRequired,
  	unsubscribe: PropTypes.func.isRequired
  };

  Chart.childContextTypes = {
  	chartConfig: PropTypes.object.isRequired,
  	chartId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
  };

  var _extends$1 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  var _slicedToArray$3 = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  function getDimensions(_ref, chartProps) {
  	var width = _ref.width,
  	    height = _ref.height;


  	var chartHeight = chartProps.height || height;

  	return {
  		availableHeight: height,
  		width: width,
  		height: chartHeight
  	};
  }

  function values$1(func) {
  	return function (d) {
  		var obj = func(d);
  		if (isObject(obj)) {
  			return mapObject(obj);
  		}
  		return obj;
  	};
  }

  function isArraySize2AndNumber(yExtentsProp) {
  	if (Array.isArray(yExtentsProp) && yExtentsProp.length === 2) {
  		var _yExtentsProp = _slicedToArray$3(yExtentsProp, 2),
  		    a = _yExtentsProp[0],
  		    b = _yExtentsProp[1];

  		return typeof a == "number" && typeof b == "number";
  	}
  	return false;
  }

  function getNewChartConfig(innerDimension, children) {
  	var existingChartConfig = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  	return React__default.Children.map(children, function (each) {
  		if (each && each.type.toString() === Chart.toString()) {
  			var chartProps = _extends$1({}, Chart.defaultProps, each.props);
  			var id = chartProps.id,
  			    origin = chartProps.origin,
  			    padding = chartProps.padding,
  			    yExtentsProp = chartProps.yExtents,
  			    yScaleProp = chartProps.yScale,
  			    flipYScale = chartProps.flipYScale,
  			    yExtentsCalculator = chartProps.yExtentsCalculator;


  			var yScale = yScaleProp.copy();

  			var _getDimensions = getDimensions(innerDimension, chartProps),
  			    width = _getDimensions.width,
  			    height = _getDimensions.height,
  			    availableHeight = _getDimensions.availableHeight;

  			var yPan = chartProps.yPan;
  			var yPanEnabled = chartProps.yPanEnabled;
  			// var { yMousePointerRectWidth: rectWidth, yMousePointerRectHeight: rectHeight, yMousePointerArrowWidth: arrowWidth } = each.props;
  			// var mouseCoordinates = { at, yDisplayFormat, rectHeight, rectWidth, arrowWidth };

  			var yExtents = isDefined(yExtentsProp) ? (Array.isArray(yExtentsProp) ? yExtentsProp : [yExtentsProp]).map(functor) : undefined;

  			var prevChartConfig = find(existingChartConfig, function (d) {
  				return d.id === id;
  			});

  			if (isArraySize2AndNumber(yExtentsProp)) {
  				if (isDefined(prevChartConfig) && prevChartConfig.yPan && prevChartConfig.yPanEnabled && yPan && yPanEnabled && shallowEqual(prevChartConfig.originalYExtentsProp, yExtentsProp)) {
  					// console.log(prevChartConfig.originalYExtentsProp, yExtentsProp)
  					// console.log(prevChartConfig.yScale.domain())
  					yScale.domain(prevChartConfig.yScale.domain());
  				} else {
  					var _yExtentsProp2 = _slicedToArray$3(yExtentsProp, 2),
  					    a = _yExtentsProp2[0],
  					    b = _yExtentsProp2[1];

  					yScale.domain([a, b]);
  				}
  			} else if (isDefined(prevChartConfig) && prevChartConfig.yPanEnabled) {
  				if (isArraySize2AndNumber(prevChartConfig.originalYExtentsProp)) ; else {
  					yScale.domain(prevChartConfig.yScale.domain());
  					yPanEnabled = true;
  				}
  			}

  			return {
  				id: id,
  				origin: functor(origin)(width, availableHeight),
  				padding: padding,
  				originalYExtentsProp: yExtentsProp,
  				yExtents: yExtents,
  				yExtentsCalculator: yExtentsCalculator,
  				flipYScale: flipYScale,
  				// yScale: setRange(yScale.copy(), height, padding, flipYScale),
  				yScale: yScale,
  				yPan: yPan,
  				yPanEnabled: yPanEnabled,
  				// mouseCoordinates,
  				width: width,
  				height: height
  			};
  		}
  		return undefined;
  	}).filter(function (each) {
  		return isDefined(each);
  	});
  }
  function getCurrentCharts(chartConfig, mouseXY) {
  	var currentCharts = chartConfig.filter(function (eachConfig) {
  		var top = eachConfig.origin[1];
  		var bottom = top + eachConfig.height;
  		return mouseXY[1] > top && mouseXY[1] < bottom;
  	}).map(function (config) {
  		return config.id;
  	});

  	return currentCharts;
  }

  function setRange(scale, height, padding, flipYScale) {
  	if (scale.rangeRoundPoints || isNotDefined(scale.invert)) {
  		if (isNaN(padding)) throw new Error("padding has to be a number for ordinal scale");
  		if (scale.rangeRoundPoints) scale.rangeRoundPoints(flipYScale ? [0, height] : [height, 0], padding);
  		if (scale.rangeRound) scale.range(flipYScale ? [0, height] : [height, 0]).padding(padding);
  	} else {
  		var _ref2 = isNaN(padding) ? padding : { top: padding, bottom: padding },
  		    top = _ref2.top,
  		    bottom = _ref2.bottom;

  		scale.range(flipYScale ? [top, height - bottom] : [height - bottom, top]);
  	}
  	return scale;
  }

  function yDomainFromYExtents(yExtents, yScale, plotData) {
  	var yValues = yExtents.map(function (eachExtent) {
  		return plotData.map(values$1(eachExtent));
  	});

  	var allYValues = lodash_flattendeep(yValues);
  	// console.log(allYValues)
  	var realYDomain = yScale.invert ? extent(allYValues) : set(allYValues).values();

  	return realYDomain;
  }

  function getChartConfigWithUpdatedYScales(chartConfig, _ref3, xDomain, dy, chartsToPan) {
  	var plotData = _ref3.plotData,
  	    xAccessor = _ref3.xAccessor,
  	    displayXAccessor = _ref3.displayXAccessor,
  	    fullData = _ref3.fullData;

  	var yDomains = chartConfig.map(function (_ref4) {
  		var yExtentsCalculator = _ref4.yExtentsCalculator,
  		    yExtents = _ref4.yExtents,
  		    yScale = _ref4.yScale;


  		var realYDomain = isDefined(yExtentsCalculator) ? yExtentsCalculator({ plotData: plotData, xDomain: xDomain, xAccessor: xAccessor, displayXAccessor: displayXAccessor, fullData: fullData }) : yDomainFromYExtents(yExtents, yScale, plotData);

  		// console.log("yScale.domain() ->", yScale.domain())

  		var yDomainDY = isDefined(dy) ? yScale.range().map(function (each) {
  			return each - dy;
  		}).map(yScale.invert) : yScale.domain();
  		return {
  			realYDomain: realYDomain,
  			yDomainDY: yDomainDY,
  			prevYDomain: yScale.domain()
  		};
  	});

  	var combine = zipper().combine(function (config, _ref5) {
  		var realYDomain = _ref5.realYDomain,
  		    yDomainDY = _ref5.yDomainDY,
  		    prevYDomain = _ref5.prevYDomain;
  		var id = config.id,
  		    padding = config.padding,
  		    height = config.height,
  		    yScale = config.yScale,
  		    yPan = config.yPan,
  		    flipYScale = config.flipYScale,
  		    _config$yPanEnabled = config.yPanEnabled,
  		    yPanEnabled = _config$yPanEnabled === undefined ? false : _config$yPanEnabled;


  		var another = isDefined(chartsToPan) ? chartsToPan.indexOf(id) > -1 : true;
  		var domain = yPan && yPanEnabled ? another ? yDomainDY : prevYDomain : realYDomain;

  		// console.log(id, yPan, yPanEnabled, another);
  		// console.log(domain, realYDomain, prevYDomain);
  		var newYScale = setRange(yScale.copy().domain(domain), height, padding, flipYScale);
  		return _extends$1({}, config, {
  			yScale: newYScale,
  			realYDomain: realYDomain
  		});
  		// return { ...config, yScale: yScale.copy().domain(domain).range([height - padding, padding]) };
  	});

  	var updatedChartConfig = combine(chartConfig, yDomains);
  	// console.error(yDomains, dy, chartsToPan, updatedChartConfig.map(d => d.yScale.domain()));
  	// console.log(updatedChartConfig.map(d => ({ id: d.id, domain: d.yScale.domain() })))

  	return updatedChartConfig;
  }

  function getCurrentItem(xScale, xAccessor, mouseXY, plotData) {
  	var xValue = void 0,
  	    item = void 0;
  	if (xScale.invert) {
  		xValue = xScale.invert(mouseXY[0]);
  		item = getClosestItem(plotData, xValue, xAccessor);
  	} else {
  		var d = xScale.range().map(function (d, idx) {
  			return { x: Math.abs(d - mouseXY[0]), idx: idx };
  		}).reduce(function (a, b) {
  			return a.x < b.x ? a : b;
  		});
  		item = isDefined(d) ? plotData[d.idx] : plotData[0];
  		// console.log(d, item);
  	}
  	return item;
  }

  /* eslint-disable no-unused-vars */

  function mouseBasedZoomAnchor(_ref) {
  	var xScale = _ref.xScale,
  	    xAccessor = _ref.xAccessor,
  	    mouseXY = _ref.mouseXY,
  	    plotData = _ref.plotData,
  	    fullData = _ref.fullData;

  	var currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
  	return xAccessor(currentItem);
  }
  /* eslint-enable no-unused-vars */

  var xhtml = "http://www.w3.org/1999/xhtml";

  var namespaces = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: xhtml,
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };

  function namespace(name) {
    var prefix = name += "", i = prefix.indexOf(":");
    if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
    return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name;
  }

  function creatorInherit(name) {
    return function() {
      var document = this.ownerDocument,
          uri = this.namespaceURI;
      return uri === xhtml && document.documentElement.namespaceURI === xhtml
          ? document.createElement(name)
          : document.createElementNS(uri, name);
    };
  }

  function creatorFixed(fullname) {
    return function() {
      return this.ownerDocument.createElementNS(fullname.space, fullname.local);
    };
  }

  function creator(name) {
    var fullname = namespace(name);
    return (fullname.local
        ? creatorFixed
        : creatorInherit)(fullname);
  }

  function none() {}

  function selector(selector) {
    return selector == null ? none : function() {
      return this.querySelector(selector);
    };
  }

  function selection_select(select) {
    if (typeof select !== "function") select = selector(select);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
        }
      }
    }

    return new Selection(subgroups, this._parents);
  }

  function empty() {
    return [];
  }

  function selectorAll(selector) {
    return selector == null ? empty : function() {
      return this.querySelectorAll(selector);
    };
  }

  function selection_selectAll(select) {
    if (typeof select !== "function") select = selectorAll(select);

    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          subgroups.push(select.call(node, node.__data__, i, group));
          parents.push(node);
        }
      }
    }

    return new Selection(subgroups, parents);
  }

  var matcher = function(selector) {
    return function() {
      return this.matches(selector);
    };
  };

  if (typeof document !== "undefined") {
    var element = document.documentElement;
    if (!element.matches) {
      var vendorMatches = element.webkitMatchesSelector
          || element.msMatchesSelector
          || element.mozMatchesSelector
          || element.oMatchesSelector;
      matcher = function(selector) {
        return function() {
          return vendorMatches.call(this, selector);
        };
      };
    }
  }

  var matcher$1 = matcher;

  function selection_filter(match) {
    if (typeof match !== "function") match = matcher$1(match);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }

    return new Selection(subgroups, this._parents);
  }

  function sparse(update) {
    return new Array(update.length);
  }

  function selection_enter() {
    return new Selection(this._enter || this._groups.map(sparse), this._parents);
  }

  function EnterNode(parent, datum) {
    this.ownerDocument = parent.ownerDocument;
    this.namespaceURI = parent.namespaceURI;
    this._next = null;
    this._parent = parent;
    this.__data__ = datum;
  }

  EnterNode.prototype = {
    constructor: EnterNode,
    appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
    insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
    querySelector: function(selector) { return this._parent.querySelector(selector); },
    querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
  };

  function constant$3(x) {
    return function() {
      return x;
    };
  }

  var keyPrefix = "$"; // Protect against keys like “__proto__”.

  function bindIndex(parent, group, enter, update, exit, data) {
    var i = 0,
        node,
        groupLength = group.length,
        dataLength = data.length;

    // Put any non-null nodes that fit into update.
    // Put any null nodes into enter.
    // Put any remaining data into enter.
    for (; i < dataLength; ++i) {
      if (node = group[i]) {
        node.__data__ = data[i];
        update[i] = node;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Put any non-null nodes that don’t fit into exit.
    for (; i < groupLength; ++i) {
      if (node = group[i]) {
        exit[i] = node;
      }
    }
  }

  function bindKey(parent, group, enter, update, exit, data, key) {
    var i,
        node,
        nodeByKeyValue = {},
        groupLength = group.length,
        dataLength = data.length,
        keyValues = new Array(groupLength),
        keyValue;

    // Compute the key for each node.
    // If multiple nodes have the same key, the duplicates are added to exit.
    for (i = 0; i < groupLength; ++i) {
      if (node = group[i]) {
        keyValues[i] = keyValue = keyPrefix + key.call(node, node.__data__, i, group);
        if (keyValue in nodeByKeyValue) {
          exit[i] = node;
        } else {
          nodeByKeyValue[keyValue] = node;
        }
      }
    }

    // Compute the key for each datum.
    // If there a node associated with this key, join and add it to update.
    // If there is not (or the key is a duplicate), add it to enter.
    for (i = 0; i < dataLength; ++i) {
      keyValue = keyPrefix + key.call(parent, data[i], i, data);
      if (node = nodeByKeyValue[keyValue]) {
        update[i] = node;
        node.__data__ = data[i];
        nodeByKeyValue[keyValue] = null;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Add any remaining nodes that were not bound to data to exit.
    for (i = 0; i < groupLength; ++i) {
      if ((node = group[i]) && (nodeByKeyValue[keyValues[i]] === node)) {
        exit[i] = node;
      }
    }
  }

  function selection_data(value, key) {
    if (!value) {
      data = new Array(this.size()), j = -1;
      this.each(function(d) { data[++j] = d; });
      return data;
    }

    var bind = key ? bindKey : bindIndex,
        parents = this._parents,
        groups = this._groups;

    if (typeof value !== "function") value = constant$3(value);

    for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
      var parent = parents[j],
          group = groups[j],
          groupLength = group.length,
          data = value.call(parent, parent && parent.__data__, j, parents),
          dataLength = data.length,
          enterGroup = enter[j] = new Array(dataLength),
          updateGroup = update[j] = new Array(dataLength),
          exitGroup = exit[j] = new Array(groupLength);

      bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

      // Now connect the enter nodes to their following update node, such that
      // appendChild can insert the materialized enter node before this node,
      // rather than at the end of the parent node.
      for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
        if (previous = enterGroup[i0]) {
          if (i0 >= i1) i1 = i0 + 1;
          while (!(next = updateGroup[i1]) && ++i1 < dataLength);
          previous._next = next || null;
        }
      }
    }

    update = new Selection(update, parents);
    update._enter = enter;
    update._exit = exit;
    return update;
  }

  function selection_exit() {
    return new Selection(this._exit || this._groups.map(sparse), this._parents);
  }

  function selection_merge(selection$$1) {

    for (var groups0 = this._groups, groups1 = selection$$1._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }

    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }

    return new Selection(merges, this._parents);
  }

  function selection_order() {

    for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
      for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
        if (node = group[i]) {
          if (next && next !== node.nextSibling) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }

    return this;
  }

  function selection_sort(compare) {
    if (!compare) compare = ascending$1;

    function compareNode(a, b) {
      return a && b ? compare(a.__data__, b.__data__) : !a - !b;
    }

    for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          sortgroup[i] = node;
        }
      }
      sortgroup.sort(compareNode);
    }

    return new Selection(sortgroups, this._parents).order();
  }

  function ascending$1(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function selection_call() {
    var callback = arguments[0];
    arguments[0] = this;
    callback.apply(null, arguments);
    return this;
  }

  function selection_nodes() {
    var nodes = new Array(this.size()), i = -1;
    this.each(function() { nodes[++i] = this; });
    return nodes;
  }

  function selection_node() {

    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
        var node = group[i];
        if (node) return node;
      }
    }

    return null;
  }

  function selection_size() {
    var size = 0;
    this.each(function() { ++size; });
    return size;
  }

  function selection_empty() {
    return !this.node();
  }

  function selection_each(callback) {

    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) callback.call(node, node.__data__, i, group);
      }
    }

    return this;
  }

  function attrRemove(name) {
    return function() {
      this.removeAttribute(name);
    };
  }

  function attrRemoveNS(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }

  function attrConstant(name, value) {
    return function() {
      this.setAttribute(name, value);
    };
  }

  function attrConstantNS(fullname, value) {
    return function() {
      this.setAttributeNS(fullname.space, fullname.local, value);
    };
  }

  function attrFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttribute(name);
      else this.setAttribute(name, v);
    };
  }

  function attrFunctionNS(fullname, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
      else this.setAttributeNS(fullname.space, fullname.local, v);
    };
  }

  function selection_attr(name, value) {
    var fullname = namespace(name);

    if (arguments.length < 2) {
      var node = this.node();
      return fullname.local
          ? node.getAttributeNS(fullname.space, fullname.local)
          : node.getAttribute(fullname);
    }

    return this.each((value == null
        ? (fullname.local ? attrRemoveNS : attrRemove) : (typeof value === "function"
        ? (fullname.local ? attrFunctionNS : attrFunction)
        : (fullname.local ? attrConstantNS : attrConstant)))(fullname, value));
  }

  function defaultView(node) {
    return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
        || (node.document && node) // node is a Window
        || node.defaultView; // node is a Document
  }

  function styleRemove(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }

  function styleConstant(name, value, priority) {
    return function() {
      this.style.setProperty(name, value, priority);
    };
  }

  function styleFunction(name, value, priority) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.style.removeProperty(name);
      else this.style.setProperty(name, v, priority);
    };
  }

  function selection_style(name, value, priority) {
    return arguments.length > 1
        ? this.each((value == null
              ? styleRemove : typeof value === "function"
              ? styleFunction
              : styleConstant)(name, value, priority == null ? "" : priority))
        : styleValue(this.node(), name);
  }

  function styleValue(node, name) {
    return node.style.getPropertyValue(name)
        || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
  }

  function propertyRemove(name) {
    return function() {
      delete this[name];
    };
  }

  function propertyConstant(name, value) {
    return function() {
      this[name] = value;
    };
  }

  function propertyFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) delete this[name];
      else this[name] = v;
    };
  }

  function selection_property(name, value) {
    return arguments.length > 1
        ? this.each((value == null
            ? propertyRemove : typeof value === "function"
            ? propertyFunction
            : propertyConstant)(name, value))
        : this.node()[name];
  }

  function classArray(string) {
    return string.trim().split(/^|\s+/);
  }

  function classList(node) {
    return node.classList || new ClassList(node);
  }

  function ClassList(node) {
    this._node = node;
    this._names = classArray(node.getAttribute("class") || "");
  }

  ClassList.prototype = {
    add: function(name) {
      var i = this._names.indexOf(name);
      if (i < 0) {
        this._names.push(name);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    remove: function(name) {
      var i = this._names.indexOf(name);
      if (i >= 0) {
        this._names.splice(i, 1);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    contains: function(name) {
      return this._names.indexOf(name) >= 0;
    }
  };

  function classedAdd(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.add(names[i]);
  }

  function classedRemove(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.remove(names[i]);
  }

  function classedTrue(names) {
    return function() {
      classedAdd(this, names);
    };
  }

  function classedFalse(names) {
    return function() {
      classedRemove(this, names);
    };
  }

  function classedFunction(names, value) {
    return function() {
      (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
    };
  }

  function selection_classed(name, value) {
    var names = classArray(name + "");

    if (arguments.length < 2) {
      var list = classList(this.node()), i = -1, n = names.length;
      while (++i < n) if (!list.contains(names[i])) return false;
      return true;
    }

    return this.each((typeof value === "function"
        ? classedFunction : value
        ? classedTrue
        : classedFalse)(names, value));
  }

  function textRemove() {
    this.textContent = "";
  }

  function textConstant(value) {
    return function() {
      this.textContent = value;
    };
  }

  function textFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    };
  }

  function selection_text(value) {
    return arguments.length
        ? this.each(value == null
            ? textRemove : (typeof value === "function"
            ? textFunction
            : textConstant)(value))
        : this.node().textContent;
  }

  function htmlRemove() {
    this.innerHTML = "";
  }

  function htmlConstant(value) {
    return function() {
      this.innerHTML = value;
    };
  }

  function htmlFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    };
  }

  function selection_html(value) {
    return arguments.length
        ? this.each(value == null
            ? htmlRemove : (typeof value === "function"
            ? htmlFunction
            : htmlConstant)(value))
        : this.node().innerHTML;
  }

  function raise$1() {
    if (this.nextSibling) this.parentNode.appendChild(this);
  }

  function selection_raise() {
    return this.each(raise$1);
  }

  function lower() {
    if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
  }

  function selection_lower() {
    return this.each(lower);
  }

  function selection_append(name) {
    var create = typeof name === "function" ? name : creator(name);
    return this.select(function() {
      return this.appendChild(create.apply(this, arguments));
    });
  }

  function constantNull() {
    return null;
  }

  function selection_insert(name, before) {
    var create = typeof name === "function" ? name : creator(name),
        select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
    return this.select(function() {
      return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
    });
  }

  function remove() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  }

  function selection_remove() {
    return this.each(remove);
  }

  function selection_cloneShallow() {
    return this.parentNode.insertBefore(this.cloneNode(false), this.nextSibling);
  }

  function selection_cloneDeep() {
    return this.parentNode.insertBefore(this.cloneNode(true), this.nextSibling);
  }

  function selection_clone(deep) {
    return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
  }

  function selection_datum(value) {
    return arguments.length
        ? this.property("__data__", value)
        : this.node().__data__;
  }

  var filterEvents = {};

  var event = null;

  if (typeof document !== "undefined") {
    var element$1 = document.documentElement;
    if (!("onmouseenter" in element$1)) {
      filterEvents = {mouseenter: "mouseover", mouseleave: "mouseout"};
    }
  }

  function filterContextListener(listener, index, group) {
    listener = contextListener(listener, index, group);
    return function(event) {
      var related = event.relatedTarget;
      if (!related || (related !== this && !(related.compareDocumentPosition(this) & 8))) {
        listener.call(this, event);
      }
    };
  }

  function contextListener(listener, index, group) {
    return function(event1) {
      var event0 = event; // Events can be reentrant (e.g., focus).
      event = event1;
      try {
        listener.call(this, this.__data__, index, group);
      } finally {
        event = event0;
      }
    };
  }

  function parseTypenames(typenames) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      return {type: t, name: name};
    });
  }

  function onRemove(typename) {
    return function() {
      var on = this.__on;
      if (!on) return;
      for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
        if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.capture);
        } else {
          on[++i] = o;
        }
      }
      if (++i) on.length = i;
      else delete this.__on;
    };
  }

  function onAdd(typename, value, capture) {
    var wrap = filterEvents.hasOwnProperty(typename.type) ? filterContextListener : contextListener;
    return function(d, i, group) {
      var on = this.__on, o, listener = wrap(value, i, group);
      if (on) for (var j = 0, m = on.length; j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.capture);
          this.addEventListener(o.type, o.listener = listener, o.capture = capture);
          o.value = value;
          return;
        }
      }
      this.addEventListener(typename.type, listener, capture);
      o = {type: typename.type, name: typename.name, value: value, listener: listener, capture: capture};
      if (!on) this.__on = [o];
      else on.push(o);
    };
  }

  function selection_on(typename, value, capture) {
    var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

    if (arguments.length < 2) {
      var on = this.node().__on;
      if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
      return;
    }

    on = value ? onAdd : onRemove;
    if (capture == null) capture = false;
    for (i = 0; i < n; ++i) this.each(on(typenames[i], value, capture));
    return this;
  }

  function dispatchEvent(node, type, params) {
    var window = defaultView(node),
        event = window.CustomEvent;

    if (typeof event === "function") {
      event = new event(type, params);
    } else {
      event = window.document.createEvent("Event");
      if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
      else event.initEvent(type, false, false);
    }

    node.dispatchEvent(event);
  }

  function dispatchConstant(type, params) {
    return function() {
      return dispatchEvent(this, type, params);
    };
  }

  function dispatchFunction(type, params) {
    return function() {
      return dispatchEvent(this, type, params.apply(this, arguments));
    };
  }

  function selection_dispatch(type, params) {
    return this.each((typeof params === "function"
        ? dispatchFunction
        : dispatchConstant)(type, params));
  }

  var root$1 = [null];

  function Selection(groups, parents) {
    this._groups = groups;
    this._parents = parents;
  }

  function selection() {
    return new Selection([[document.documentElement]], root$1);
  }

  Selection.prototype = selection.prototype = {
    constructor: Selection,
    select: selection_select,
    selectAll: selection_selectAll,
    filter: selection_filter,
    data: selection_data,
    enter: selection_enter,
    exit: selection_exit,
    merge: selection_merge,
    order: selection_order,
    sort: selection_sort,
    call: selection_call,
    nodes: selection_nodes,
    node: selection_node,
    size: selection_size,
    empty: selection_empty,
    each: selection_each,
    attr: selection_attr,
    style: selection_style,
    property: selection_property,
    classed: selection_classed,
    text: selection_text,
    html: selection_html,
    raise: selection_raise,
    lower: selection_lower,
    append: selection_append,
    insert: selection_insert,
    remove: selection_remove,
    clone: selection_clone,
    datum: selection_datum,
    on: selection_on,
    dispatch: selection_dispatch
  };

  function select(selector) {
    return typeof selector === "string"
        ? new Selection([[document.querySelector(selector)]], [document.documentElement])
        : new Selection([[selector]], root$1);
  }

  function sourceEvent() {
    var current = event, source;
    while (source = current.sourceEvent) current = source;
    return current;
  }

  function point$1(node, event) {
    var svg = node.ownerSVGElement || node;

    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      point.x = event.clientX, point.y = event.clientY;
      point = point.matrixTransform(node.getScreenCTM().inverse());
      return [point.x, point.y];
    }

    var rect = node.getBoundingClientRect();
    return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
  }

  function mouse(node) {
    var event = sourceEvent();
    if (event.changedTouches) event = event.changedTouches[0];
    return point$1(node, event);
  }

  function touches(node, touches) {
    if (touches == null) touches = sourceEvent().touches;

    for (var i = 0, n = touches ? touches.length : 0, points = new Array(n); i < n; ++i) {
      points[i] = point$1(node, touches[i]);
    }

    return points;
  }

  var _extends$2 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  var _slicedToArray$5 = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

  function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$2(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$2(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
  // import { clearTimeout, setTimeout } from "timers";

  var EventCapture = function (_Component) {
  	_inherits$2(EventCapture, _Component);

  	function EventCapture(props) {
  		_classCallCheck$2(this, EventCapture);

  		var _this = _possibleConstructorReturn$2(this, (EventCapture.__proto__ || Object.getPrototypeOf(EventCapture)).call(this, props));

  		_this.handleEnter = _this.handleEnter.bind(_this);
  		_this.handleLeave = _this.handleLeave.bind(_this);
  		_this.handleWheel = _this.handleWheel.bind(_this);
  		_this.handleMouseMove = _this.handleMouseMove.bind(_this);
  		_this.handleMouseDown = _this.handleMouseDown.bind(_this);
  		_this.handlePanEnd = _this.handlePanEnd.bind(_this);
  		_this.handlePan = _this.handlePan.bind(_this);
  		_this.handleTouchStart = _this.handleTouchStart.bind(_this);
  		_this.handleTouchMove = _this.handleTouchMove.bind(_this);
  		_this.handlePinchZoom = _this.handlePinchZoom.bind(_this);
  		_this.handlePinchZoomEnd = _this.handlePinchZoomEnd.bind(_this);

  		_this.handleClick = _this.handleClick.bind(_this);

  		_this.handleRightClick = _this.handleRightClick.bind(_this);
  		_this.handleDrag = _this.handleDrag.bind(_this);
  		_this.handleDragEnd = _this.handleDragEnd.bind(_this);

  		_this.shouldPan = _this.shouldPan.bind(_this);
  		_this.canPan = _this.canPan.bind(_this);

  		_this.setCursorClass = _this.setCursorClass.bind(_this);
  		_this.saveNode = _this.saveNode.bind(_this);

  		_this.mouseInside = false;

  		_this.mouseInteraction = true;
  		_this.state = {
  			panInProgress: false
  		};
  		return _this;
  	}

  	_createClass$2(EventCapture, [{
  		key: "saveNode",
  		value: function saveNode(node) {
  			this.node = node;
  		}
  	}, {
  		key: "componentWillMount",
  		value: function componentWillMount() {
  			this.focus = this.props.focus;
  		}
  	}, {
  		key: "componentDidMount",
  		value: function componentDidMount() {
  			if (this.node) {
  				select(this.node).on(MOUSEENTER, this.handleEnter).on(MOUSELEAVE, this.handleLeave);
  			}
  		}
  	}, {
  		key: "componentDidUpdate",
  		value: function componentDidUpdate() {
  			this.componentDidMount();
  		}
  	}, {
  		key: "componentWillUnmount",
  		value: function componentWillUnmount() {
  			if (this.node) {
  				select(this.node).on(MOUSEENTER, null).on(MOUSELEAVE, null);
  				var win = d3Window(this.node);
  				select(win).on(MOUSEMOVE, null);
  			}
  		}
  	}, {
  		key: "handleEnter",
  		value: function handleEnter() {
  			var e = event;

  			var onMouseEnter = this.props.onMouseEnter;

  			this.mouseInside = true;
  			if (!this.state.panInProgress && !this.state.dragInProgress) {
  				var win = d3Window(this.node);
  				select(win).on(MOUSEMOVE, this.handleMouseMove);
  			}
  			onMouseEnter(e);
  		}
  	}, {
  		key: "handleLeave",
  		value: function handleLeave(e) {
  			var onMouseLeave = this.props.onMouseLeave;

  			this.mouseInside = false;
  			if (!this.state.panInProgress && !this.state.dragInProgress) {
  				var win = d3Window(this.node);
  				select(win).on(MOUSEMOVE, null);
  			}
  			onMouseLeave(e);
  		}
  	}, {
  		key: "handleWheel",
  		value: function handleWheel(e) {
  			var _props = this.props,
  			    zoom = _props.zoom,
  			    onZoom = _props.onZoom;
  			var panInProgress = this.state.panInProgress;


  			var yZoom = Math.abs(e.deltaY) > Math.abs(e.deltaX) && Math.abs(e.deltaY) > 0;
  			// const xPan = Math.abs(e.deltaY) < Math.abs(e.deltaX) && Math.abs(e.deltaX) > 0;
  			var mouseXY = mousePosition(e);
  			e.preventDefault();

  			if (zoom && this.focus && yZoom && !panInProgress) {
  				var zoomDir = e.deltaY > 0 ? 1 : -1;

  				onZoom(zoomDir, mouseXY, e);
  			} else if (this.focus) {
  				if (this.shouldPan()) {
  					// console.log("Do pan now...")
  					// pan already in progress
  					var _state$panStart = this.state.panStart,
  					    panStartXScale = _state$panStart.panStartXScale,
  					    chartsToPan = _state$panStart.chartsToPan;

  					this.lastNewPos = mouseXY;
  					this.panHappened = true;

  					this.dx += e.deltaX;
  					this.dy += e.deltaY;
  					var dxdy = { dx: this.dx, dy: this.dy };

  					this.props.onPan(mouseXY, panStartXScale, dxdy, chartsToPan, e);
  				} else {
  					// console.log("Pan start...")
  					// pan start

  					var _props2 = this.props,
  					    xScale = _props2.xScale,
  					    chartConfig = _props2.chartConfig;

  					var currentCharts = getCurrentCharts(chartConfig, mouseXY);

  					this.dx = 0;
  					this.dy = 0;
  					this.setState({
  						panInProgress: true,
  						panStart: {
  							panStartXScale: xScale,
  							panOrigin: mouseXY,
  							chartsToPan: currentCharts
  						}
  					});
  				}
  				this.queuePanEnd();
  			}
  		}
  	}, {
  		key: "queuePanEnd",
  		value: function queuePanEnd() {
  			var _this2 = this;

  			if (isDefined(this.panEndTimeout)) {
  				clearTimeout(this.panEndTimeout);
  			}
  			this.panEndTimeout = setTimeout(function () {
  				_this2.handlePanEnd();
  			}, 100);
  		}
  	}, {
  		key: "handleMouseMove",
  		value: function handleMouseMove() {
  			var e = event;

  			var _props3 = this.props,
  			    onMouseMove = _props3.onMouseMove,
  			    mouseMove = _props3.mouseMove;


  			if (this.mouseInteraction && mouseMove && !this.state.panInProgress) {

  				var newPos = mouse(this.node);

  				onMouseMove(newPos, "mouse", e);
  			}
  		}
  	}, {
  		key: "handleClick",
  		value: function handleClick(e) {
  			var _this3 = this;

  			var mouseXY = mousePosition(e);
  			var _props4 = this.props,
  			    onClick = _props4.onClick,
  			    onDoubleClick = _props4.onDoubleClick;


  			if (!this.panHappened && !this.dragHappened) {
  				if (this.clicked) {
  					onDoubleClick(mouseXY, e);
  					this.clicked = false;
  				} else {
  					onClick(mouseXY, e);
  					this.clicked = true;
  					setTimeout(function () {
  						if (_this3.clicked) {
  							_this3.clicked = false;
  						}
  					}, 400);
  				}
  			}
  		}
  	}, {
  		key: "handleRightClick",
  		value: function handleRightClick(e) {
  			e.stopPropagation();
  			e.preventDefault();
  			var _props5 = this.props,
  			    onContextMenu = _props5.onContextMenu,
  			    onPanEnd = _props5.onPanEnd;


  			var mouseXY = mousePosition(e, this.node.getBoundingClientRect());

  			if (isDefined(this.state.panStart)) {
  				var _state$panStart2 = this.state.panStart,
  				    panStartXScale = _state$panStart2.panStartXScale,
  				    panOrigin = _state$panStart2.panOrigin,
  				    chartsToPan = _state$panStart2.chartsToPan;

  				if (this.panHappened) {
  					onPanEnd(mouseXY, panStartXScale, panOrigin, chartsToPan, e);
  				}
  				var win = d3Window(this.node);
  				select(win).on(MOUSEMOVE, null).on(MOUSEUP, null);

  				this.setState({
  					panInProgress: false,
  					panStart: null
  				});
  			}

  			onContextMenu(mouseXY, e);
  		}
  	}, {
  		key: "handleDrag",
  		value: function handleDrag() {
  			var e = event;
  			if (this.props.onDrag) {
  				this.dragHappened = true;
  				var mouseXY = mouse(this.node);
  				this.props.onDrag({
  					startPos: this.state.dragStartPosition,
  					mouseXY: mouseXY
  				}, e);
  			}
  		}
  	}, {
  		key: "cancelDrag",
  		value: function cancelDrag() {
  			var win = d3Window(this.node);
  			select(win).on(MOUSEMOVE, this.mouseInside ? this.handleMouseMove : null).on(MOUSEUP, null);

  			this.setState({
  				dragInProgress: false
  			});
  			this.mouseInteraction = true;
  		}
  	}, {
  		key: "handleDragEnd",
  		value: function handleDragEnd() {
  			var e = event;
  			var mouseXY = mouse(this.node);

  			var win = d3Window(this.node);
  			select(win).on(MOUSEMOVE, this.mouseInside ? this.handleMouseMove : null).on(MOUSEUP, null);

  			if (this.dragHappened) {
  				this.props.onDragComplete({
  					mouseXY: mouseXY
  				}, e);
  			}

  			this.setState({
  				dragInProgress: false
  			});
  			this.mouseInteraction = true;
  		}
  	}, {
  		key: "canPan",
  		value: function canPan() {
  			var getAllPanConditions = this.props.getAllPanConditions;
  			var initialPanEnabled = this.props.pan;

  			var _getAllPanConditions$ = getAllPanConditions().reduce(function (returnObj, a) {
  				return {
  					draggable: returnObj.draggable || a.draggable,
  					panEnabled: returnObj.panEnabled && a.panEnabled
  				};
  			}, {
  				draggable: false,
  				panEnabled: initialPanEnabled
  			}),
  			    panEnabled = _getAllPanConditions$.panEnabled,
  			    somethingSelected = _getAllPanConditions$.draggable;

  			return {
  				panEnabled: panEnabled,
  				somethingSelected: somethingSelected
  			};
  		}
  	}, {
  		key: "handleMouseDown",
  		value: function handleMouseDown(e) {
  			if (e.button !== 0) {
  				return;
  			}
  			var _props6 = this.props,
  			    xScale = _props6.xScale,
  			    chartConfig = _props6.chartConfig,
  			    onMouseDown = _props6.onMouseDown;


  			this.panHappened = false;
  			this.dragHappened = false;
  			this.focus = true;

  			if (!this.state.panInProgress && this.mouseInteraction) {

  				var mouseXY = mousePosition(e);
  				var currentCharts = getCurrentCharts(chartConfig, mouseXY);

  				var _canPan = this.canPan(),
  				    panEnabled = _canPan.panEnabled,
  				    somethingSelected = _canPan.somethingSelected;

  				var pan = panEnabled && !somethingSelected;

  				if (pan) {
  					this.setState({
  						panInProgress: pan,
  						panStart: {
  							panStartXScale: xScale,
  							panOrigin: mouseXY,
  							chartsToPan: currentCharts
  						}
  					});

  					var win = d3Window(this.node);
  					select(win).on(MOUSEMOVE, this.handlePan).on(MOUSEUP, this.handlePanEnd);
  				} else if (somethingSelected) {
  					this.setState({
  						panInProgress: false,
  						dragInProgress: true,
  						panStart: null,
  						dragStartPosition: mouseXY
  					});
  					this.props.onDragStart({ startPos: mouseXY }, e);
  					// this.mouseInteraction = false;

  					var _win = d3Window(this.node);
  					select(_win).on(MOUSEMOVE, this.handleDrag).on(MOUSEUP, this.handleDragEnd);
  				}

  				onMouseDown(mouseXY, currentCharts, e);
  			}
  			e.preventDefault();
  		}
  	}, {
  		key: "shouldPan",
  		value: function shouldPan() {
  			var _props7 = this.props,
  			    panEnabled = _props7.pan,
  			    onPan = _props7.onPan;

  			return panEnabled && onPan && isDefined(this.state.panStart);
  		}
  	}, {
  		key: "handlePan",
  		value: function handlePan() {
  			var e = event;

  			if (this.shouldPan()) {
  				this.panHappened = true;

  				var _state$panStart3 = this.state.panStart,
  				    panStartXScale = _state$panStart3.panStartXScale,
  				    panOrigin = _state$panStart3.panOrigin,
  				    chartsToPan = _state$panStart3.chartsToPan;


  				var mouseXY = this.mouseInteraction ? mouse(this.node) : touches(this.node)[0];

  				this.lastNewPos = mouseXY;
  				var dx = mouseXY[0] - panOrigin[0];
  				var dy = mouseXY[1] - panOrigin[1];

  				this.dx = dx;
  				this.dy = dy;

  				this.props.onPan(mouseXY, panStartXScale, { dx: dx, dy: dy }, chartsToPan, e);
  			}
  		}
  	}, {
  		key: "handlePanEnd",
  		value: function handlePanEnd() {
  			var e = event;
  			var _props8 = this.props,
  			    panEnabled = _props8.pan,
  			    onPanEnd = _props8.onPanEnd;


  			if (isDefined(this.state.panStart)) {
  				var _state$panStart4 = this.state.panStart,
  				    panStartXScale = _state$panStart4.panStartXScale,
  				    chartsToPan = _state$panStart4.chartsToPan;


  				var win = d3Window(this.node);
  				select(win).on(MOUSEMOVE, this.mouseInside ? this.handleMouseMove : null).on(MOUSEUP, null).on(TOUCHMOVE, null).on(TOUCHEND, null);

  				if (this.panHappened
  				// && !this.contextMenuClicked
  				&& panEnabled && onPanEnd) {
  					var dx = this.dx,
  					    dy = this.dy;

  					// console.log(dx, dy)

  					delete this.dx;
  					delete this.dy;
  					onPanEnd(this.lastNewPos, panStartXScale, { dx: dx, dy: dy }, chartsToPan, e);
  				}

  				this.setState({
  					panInProgress: false,
  					panStart: null
  				});
  			}
  		}
  	}, {
  		key: "handleTouchMove",
  		value: function handleTouchMove(e) {
  			var onMouseMove = this.props.onMouseMove;

  			var touchXY = touchPosition(getTouchProps(e.touches[0]), e);
  			onMouseMove(touchXY, "touch", e);
  		}
  	}, {
  		key: "handleTouchStart",
  		value: function handleTouchStart(e) {
  			this.mouseInteraction = false;

  			var _props9 = this.props,
  			    panEnabled = _props9.pan,
  			    chartConfig = _props9.chartConfig,
  			    onMouseMove = _props9.onMouseMove;
  			var _props10 = this.props,
  			    xScale = _props10.xScale,
  			    onPanEnd = _props10.onPanEnd;


  			if (e.touches.length === 1) {

  				this.panHappened = false;
  				var touchXY = touchPosition(getTouchProps(e.touches[0]), e);
  				onMouseMove(touchXY, "touch", e);

  				if (panEnabled) {
  					var currentCharts = getCurrentCharts(chartConfig, touchXY);

  					this.setState({
  						panInProgress: true,
  						panStart: {
  							panStartXScale: xScale,
  							panOrigin: touchXY,
  							chartsToPan: currentCharts
  						}
  					});

  					var win = d3Window(this.node);
  					select(win).on(TOUCHMOVE, this.handlePan, false).on(TOUCHEND, this.handlePanEnd, false);
  				}
  			} else if (e.touches.length === 2) {
  				// pinch zoom begin
  				// do nothing pinch zoom is handled in handleTouchMove
  				var _state = this.state,
  				    panInProgress = _state.panInProgress,
  				    panStart = _state.panStart;


  				if (panInProgress && panEnabled && onPanEnd) {
  					var panStartXScale = panStart.panStartXScale,
  					    panOrigin = panStart.panOrigin,
  					    chartsToPan = panStart.chartsToPan;


  					var _win2 = d3Window(this.node);
  					select(_win2).on(MOUSEMOVE, this.mouseInside ? this.handleMouseMove : null).on(MOUSEUP, null).on(TOUCHMOVE, this.handlePinchZoom, false).on(TOUCHEND, this.handlePinchZoomEnd, false);

  					var touch1Pos = touchPosition(getTouchProps(e.touches[0]), e);
  					var touch2Pos = touchPosition(getTouchProps(e.touches[1]), e);

  					if (this.panHappened
  					// && !this.contextMenuClicked
  					&& panEnabled && onPanEnd) {

  						onPanEnd(this.lastNewPos, panStartXScale, panOrigin, chartsToPan, e);
  					}

  					this.setState({
  						panInProgress: false,
  						pinchZoomStart: {
  							xScale: xScale,
  							touch1Pos: touch1Pos,
  							touch2Pos: touch2Pos,
  							range: xScale.range(),
  							chartsToPan: chartsToPan
  						}
  					});
  				}
  			}
  		}
  	}, {
  		key: "handlePinchZoom",
  		value: function handlePinchZoom() {
  			var e = event;

  			var _touches = touches(this.node),
  			    _touches2 = _slicedToArray$5(_touches, 2),
  			    touch1Pos = _touches2[0],
  			    touch2Pos = _touches2[1];

  			var _props11 = this.props,
  			    xScale = _props11.xScale,
  			    zoomEnabled = _props11.zoom,
  			    onPinchZoom = _props11.onPinchZoom;

  			// eslint-disable-next-line no-unused-vars

  			var _state$pinchZoomStart = this.state.pinchZoomStart,
  			    chartsToPan = _state$pinchZoomStart.chartsToPan,
  			    initialPinch = _objectWithoutProperties(_state$pinchZoomStart, ["chartsToPan"]);

  			if (zoomEnabled && onPinchZoom) {
  				onPinchZoom(initialPinch, {
  					touch1Pos: touch1Pos,
  					touch2Pos: touch2Pos,
  					xScale: xScale
  				}, e);
  			}
  		}
  	}, {
  		key: "handlePinchZoomEnd",
  		value: function handlePinchZoomEnd() {
  			var e = event;

  			var win = d3Window(this.node);
  			select(win).on(TOUCHMOVE, null).on(TOUCHEND, null);

  			var _props12 = this.props,
  			    zoomEnabled = _props12.zoom,
  			    onPinchZoomEnd = _props12.onPinchZoomEnd;

  			// eslint-disable-next-line no-unused-vars

  			var _state$pinchZoomStart2 = this.state.pinchZoomStart,
  			    chartsToPan = _state$pinchZoomStart2.chartsToPan,
  			    initialPinch = _objectWithoutProperties(_state$pinchZoomStart2, ["chartsToPan"]);

  			if (zoomEnabled && onPinchZoomEnd) {
  				onPinchZoomEnd(initialPinch, e);
  			}

  			this.setState({
  				pinchZoomStart: null
  			});
  		}
  	}, {
  		key: "setCursorClass",
  		value: function setCursorClass(cursorOverrideClass) {
  			if (cursorOverrideClass !== this.state.cursorOverrideClass) {
  				this.setState({
  					cursorOverrideClass: cursorOverrideClass
  				});
  			}
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var _props13 = this.props,
  			    height = _props13.height,
  			    width = _props13.width,
  			    disableInteraction = _props13.disableInteraction,
  			    useCrossHairStyleCursor = _props13.useCrossHairStyleCursor;

  			var className = this.state.cursorOverrideClass != null ? this.state.cursorOverrideClass : useCrossHairStyleCursor ? "" : this.state.panInProgress ? "react-stockcharts-grabbing-cursor" : "react-stockcharts-crosshair-cursor";

  			var interactionProps = disableInteraction || {
  				onWheel: this.handleWheel,
  				onMouseDown: this.handleMouseDown,
  				onClick: this.handleClick,
  				onContextMenu: this.handleRightClick,
  				onTouchStart: this.handleTouchStart,
  				onTouchMove: this.handleTouchMove
  			};

  			return React__default.createElement("rect", _extends$2({ ref: this.saveNode,
  				className: className,
  				width: width,
  				height: height,
  				style: { opacity: 0 }
  			}, interactionProps));
  		}
  	}]);

  	return EventCapture;
  }(React.Component);

  // 				onMouseEnter={this.handleEnter}
  //				onMouseLeave={this.handleLeave}


  EventCapture.propTypes = {
  	mouseMove: PropTypes.bool.isRequired,
  	zoom: PropTypes.bool.isRequired,
  	pan: PropTypes.bool.isRequired,
  	panSpeedMultiplier: PropTypes.number.isRequired,
  	focus: PropTypes.bool.isRequired,
  	useCrossHairStyleCursor: PropTypes.bool.isRequired,

  	width: PropTypes.number.isRequired,
  	height: PropTypes.number.isRequired,
  	chartConfig: PropTypes.array,
  	xScale: PropTypes.func.isRequired,
  	xAccessor: PropTypes.func.isRequired,
  	disableInteraction: PropTypes.bool.isRequired,

  	getAllPanConditions: PropTypes.func.isRequired,

  	onMouseMove: PropTypes.func,
  	onMouseEnter: PropTypes.func,
  	onMouseLeave: PropTypes.func,
  	onZoom: PropTypes.func,
  	onPinchZoom: PropTypes.func,
  	onPinchZoomEnd: PropTypes.func.isRequired,
  	onPan: PropTypes.func,
  	onPanEnd: PropTypes.func,
  	onDragStart: PropTypes.func,
  	onDrag: PropTypes.func,
  	onDragComplete: PropTypes.func,

  	onClick: PropTypes.func,
  	onDoubleClick: PropTypes.func,
  	onContextMenu: PropTypes.func,
  	onMouseDown: PropTypes.func,
  	children: PropTypes.node
  };

  EventCapture.defaultProps = {
  	mouseMove: false,
  	zoom: false,
  	pan: false,
  	panSpeedMultiplier: 1,
  	focus: false,
  	onDragComplete: noop,
  	disableInteraction: false
  };

  var _createClass$3 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$3(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$3(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var log$1 = getLogger("CanvasContainer");

  var CanvasContainer = function (_Component) {
  	_inherits$3(CanvasContainer, _Component);

  	function CanvasContainer(props) {
  		_classCallCheck$3(this, CanvasContainer);

  		var _this = _possibleConstructorReturn$3(this, (CanvasContainer.__proto__ || Object.getPrototypeOf(CanvasContainer)).call(this, props));

  		_this.setDrawCanvas = _this.setDrawCanvas.bind(_this);
  		_this.drawCanvas = {};
  		return _this;
  	}

  	_createClass$3(CanvasContainer, [{
  		key: "setDrawCanvas",
  		value: function setDrawCanvas(node) {
  			if (isDefined(node)) this.drawCanvas[node.id] = node.getContext("2d");else this.drawCanvas = {};
  		}
  	}, {
  		key: "getCanvasContexts",
  		value: function getCanvasContexts() {
  			if (isDefined(this.drawCanvas.axes)) {
  				return this.drawCanvas;
  			}
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var _props = this.props,
  			    height = _props.height,
  			    width = _props.width,
  			    type = _props.type,
  			    zIndex = _props.zIndex,
  			    ratio = _props.ratio;

  			if (type === "svg") return null;

  			log$1("using ratio ", ratio);

  			return React__default.createElement(
  				"div",
  				{ style: { position: "absolute", zIndex: zIndex } },
  				React__default.createElement("canvas", { id: "bg", ref: this.setDrawCanvas, width: width * ratio, height: height * ratio,
  					style: { position: "absolute", width: width, height: height } }),
  				React__default.createElement("canvas", { id: "axes", ref: this.setDrawCanvas, width: width * ratio, height: height * ratio,
  					style: { position: "absolute", width: width, height: height } }),
  				React__default.createElement("canvas", { id: "mouseCoord", ref: this.setDrawCanvas, width: width * ratio, height: height * ratio,
  					style: { position: "absolute", width: width, height: height } })
  			);
  		}
  	}]);

  	return CanvasContainer;
  }(React.Component);
  /*
  				<canvas id="hover" ref={this.setDrawCanvas} width={width * ratio} height={height * ratio}
  					style={{ position: "absolute", width: width, height: height }} />
  */


  CanvasContainer.propTypes = {
  	width: PropTypes.number.isRequired,
  	height: PropTypes.number.isRequired,
  	type: PropTypes.string.isRequired,
  	zIndex: PropTypes.number,
  	ratio: PropTypes.number.isRequired
  };

  var _slicedToArray$6 = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var log$2 = getLogger("evaluator");

  function getNewEnd(fallbackEnd, xAccessor, initialXScale, start) {
  	var lastItem = fallbackEnd.lastItem,
  	    lastItemX = fallbackEnd.lastItemX;

  	var lastItemXValue = xAccessor(lastItem);

  	var _initialXScale$range = initialXScale.range(),
  	    _initialXScale$range2 = _slicedToArray$6(_initialXScale$range, 2),
  	    rangeStart = _initialXScale$range2[0],
  	    rangeEnd = _initialXScale$range2[1];

  	var newEnd = (rangeEnd - rangeStart) / (lastItemX - rangeStart) * (lastItemXValue - start) + start;
  	return newEnd;
  }

  function extentsWrapper(useWholeData, clamp, pointsPerPxThreshold, minPointsPerPxThreshold, flipXScale) {
  	function filterData(data, inputDomain, xAccessor, initialXScale) {
  		var _ref = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {},
  		    currentPlotData = _ref.currentPlotData,
  		    currentDomain = _ref.currentDomain,
  		    fallbackStart = _ref.fallbackStart,
  		    fallbackEnd = _ref.fallbackEnd;

  		if (useWholeData) {
  			return { plotData: data, domain: inputDomain };
  		}

  		var left = head(inputDomain);
  		var right = last(inputDomain);
  		var clampedDomain = inputDomain;

  		var filteredData = getFilteredResponse(data, left, right, xAccessor);

  		if (filteredData.length === 1 && isDefined(fallbackStart)) {
  			left = fallbackStart;
  			right = getNewEnd(fallbackEnd, xAccessor, initialXScale, left);

  			clampedDomain = [left, right];
  			filteredData = getFilteredResponse(data, left, right, xAccessor);
  		}

  		if (typeof clamp === "function") {
  			clampedDomain = clamp(clampedDomain, [xAccessor(head(data)), xAccessor(last(data))]);
  		} else {
  			if (clamp === "left" || clamp === "both" || clamp === true) {
  				clampedDomain = [Math.max(left, xAccessor(head(data))), clampedDomain[1]];
  			}

  			if (clamp === "right" || clamp === "both" || clamp === true) {
  				clampedDomain = [clampedDomain[0], Math.min(right, xAccessor(last(data)))];
  			}
  		}

  		if (clampedDomain !== inputDomain) {
  			filteredData = getFilteredResponse(data, clampedDomain[0], clampedDomain[1], xAccessor);
  		}

  		var realInputDomain = clampedDomain;
  		// [xAccessor(head(filteredData)), xAccessor(last(filteredData))];

  		var xScale = initialXScale.copy().domain(realInputDomain);

  		var width = Math.floor(xScale(xAccessor(last(filteredData))) - xScale(xAccessor(head(filteredData))));

  		// prevent negative width when flipXScale
  		if (flipXScale && width < 0) {
  			width = width * -1;
  		}

  		var plotData = void 0,
  		    domain = void 0;

  		var chartWidth = last(xScale.range()) - head(xScale.range());

  		log$2("Trying to show " + filteredData.length + " points in " + width + "px," + (" I can show up to " + (showMaxThreshold(width, pointsPerPxThreshold) - 1) + " points in that width. ") + ("Also FYI the entire chart width is " + chartWidth + "px and pointsPerPxThreshold is " + pointsPerPxThreshold));

  		if (canShowTheseManyPeriods(width, filteredData.length, pointsPerPxThreshold, minPointsPerPxThreshold)) {
  			plotData = filteredData;
  			domain = realInputDomain;
  			log$2("AND IT WORKED");
  		} else {
  			if (chartWidth > showMaxThreshold(width, pointsPerPxThreshold) && isDefined(fallbackEnd)) {
  				plotData = filteredData;
  				var newEnd = getNewEnd(fallbackEnd, xAccessor, initialXScale, head(realInputDomain));
  				domain = [head(realInputDomain), newEnd];
  				// plotData = currentPlotData || filteredData.slice(filteredData.length - showMax(width, pointsPerPxThreshold));
  				// domain = currentDomain || [xAccessor(head(plotData)), xAccessor(last(plotData))];

  				var newXScale = xScale.copy().domain(domain);
  				var newWidth = Math.floor(newXScale(xAccessor(last(plotData))) - newXScale(xAccessor(head(plotData))));

  				log$2("and ouch, that is too much, so instead showing " + plotData.length + " in " + newWidth + "px");
  			} else {
  				plotData = currentPlotData || filteredData.slice(filteredData.length - showMax(width, pointsPerPxThreshold));
  				domain = currentDomain || [xAccessor(head(plotData)), xAccessor(last(plotData))];

  				var _newXScale = xScale.copy().domain(domain);
  				var _newWidth = Math.floor(_newXScale(xAccessor(last(plotData))) - _newXScale(xAccessor(head(plotData))));

  				log$2("and ouch, that is too much, so instead showing " + plotData.length + " in " + _newWidth + "px");
  			}
  		}
  		return { plotData: plotData, domain: domain };
  	}
  	return { filterData: filterData };
  }

  function canShowTheseManyPeriods(width, arrayLength, maxThreshold, minThreshold) {
  	return arrayLength > showMinThreshold(width, minThreshold) && arrayLength < showMaxThreshold(width, maxThreshold);
  }

  function showMinThreshold(width, threshold) {
  	return Math.max(1, Math.ceil(width * threshold));
  }

  function showMaxThreshold(width, threshold) {
  	return Math.floor(width * threshold);
  }

  function showMax(width, threshold) {
  	return Math.floor(showMaxThreshold(width, threshold) * 0.97);
  }

  function getFilteredResponse(data, left, right, xAccessor) {
  	var newLeftIndex = getClosestItemIndexes(data, left, xAccessor).right;
  	var newRightIndex = getClosestItemIndexes(data, right, xAccessor).left;

  	var filteredData = data.slice(newLeftIndex, newRightIndex + 1);
  	// console.log(right, newRightIndex, dataForInterval.length);

  	return filteredData;
  }

  function evaluator (_ref2) {
  	var xScale = _ref2.xScale,
  	    useWholeData = _ref2.useWholeData,
  	    clamp = _ref2.clamp,
  	    pointsPerPxThreshold = _ref2.pointsPerPxThreshold,
  	    minPointsPerPxThreshold = _ref2.minPointsPerPxThreshold,
  	    flipXScale = _ref2.flipXScale;

  	return extentsWrapper(useWholeData || isNotDefined(xScale.invert), clamp, pointsPerPxThreshold, minPointsPerPxThreshold, flipXScale);
  }

  var _createClass$4 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _slicedToArray$7 = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _extends$3 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  function _objectWithoutProperties$1(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

  function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$4(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$4(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var log$3 = getLogger("ChartCanvas");

  var CANDIDATES_FOR_RESET = ["seriesName"];

  function shouldResetChart(thisProps, nextProps) {
  	return !CANDIDATES_FOR_RESET.every(function (key) {
  		var result = shallowEqual(thisProps[key], nextProps[key]);
  		// console.log(key, result);
  		return result;
  	});
  }

  function getCursorStyle() {
  	var tooltipStyle = "\n\t.react-stockcharts-grabbing-cursor {\n\t\tpointer-events: all;\n\t\tcursor: -moz-grabbing;\n\t\tcursor: -webkit-grabbing;\n\t\tcursor: grabbing;\n\t}\n\t.react-stockcharts-crosshair-cursor {\n\t\tpointer-events: all;\n\t\tcursor: crosshair;\n\t}\n\t.react-stockcharts-tooltip-hover {\n\t\tpointer-events: all;\n\t\tcursor: pointer;\n\t}\n\t.react-stockcharts-avoid-interaction {\n\t\tpointer-events: none;\n\t}\n\t.react-stockcharts-enable-interaction {\n\t\tpointer-events: all;\n\t}\n\t.react-stockcharts-tooltip {\n\t\tpointer-events: all;\n\t\tcursor: pointer;\n\t}\n\t.react-stockcharts-default-cursor {\n\t\tcursor: default;\n\t}\n\t.react-stockcharts-move-cursor {\n\t\tcursor: move;\n\t}\n\t.react-stockcharts-pointer-cursor {\n\t\tcursor: pointer;\n\t}\n\t.react-stockcharts-ns-resize-cursor {\n\t\tcursor: ns-resize;\n\t}\n\t.react-stockcharts-ew-resize-cursor {\n\t\tcursor: ew-resize;\n\t}";
  	return React__default.createElement(
  		"style",
  		{ type: "text/css" },
  		tooltipStyle
  	);
  }

  function getDimensions$1(props) {
  	return {
  		height: props.height - props.margin.top - props.margin.bottom,
  		width: props.width - props.margin.left - props.margin.right
  	};
  }

  function getXScaleDirection(flipXScale) {
  	return flipXScale ? -1 : 1;
  }

  function calculateFullData(props) {
  	var fullData = props.data,
  	    plotFull = props.plotFull,
  	    xScale = props.xScale,
  	    clamp = props.clamp,
  	    pointsPerPxThreshold = props.pointsPerPxThreshold,
  	    flipXScale = props.flipXScale;
  	var xAccessor = props.xAccessor,
  	    displayXAccessor = props.displayXAccessor,
  	    minPointsPerPxThreshold = props.minPointsPerPxThreshold;


  	var useWholeData = isDefined(plotFull) ? plotFull : xAccessor === identity$4;

  	var _evaluator = evaluator({
  		xScale: xScale,
  		useWholeData: useWholeData,
  		clamp: clamp,
  		pointsPerPxThreshold: pointsPerPxThreshold,
  		minPointsPerPxThreshold: minPointsPerPxThreshold,
  		flipXScale: flipXScale
  	}),
  	    filterData = _evaluator.filterData;

  	return {
  		xAccessor: xAccessor,
  		displayXAccessor: displayXAccessor || xAccessor,
  		xScale: xScale.copy(),
  		fullData: fullData,
  		filterData: filterData
  	};
  }
  function resetChart(props) {
  	var firstCalculation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  	if (process.env.NODE_ENV !== "production") {
  		if (!firstCalculation) log$3("CHART RESET");
  	}

  	var state = calculateState(props);
  	var xAccessor = state.xAccessor,
  	    displayXAccessor = state.displayXAccessor,
  	    fullData = state.fullData;
  	var initialPlotData = state.plotData,
  	    xScale = state.xScale;
  	var postCalculator = props.postCalculator,
  	    children = props.children;


  	var plotData = postCalculator(initialPlotData);

  	var dimensions = getDimensions$1(props);
  	var chartConfig = getChartConfigWithUpdatedYScales(getNewChartConfig(dimensions, children), { plotData: plotData, xAccessor: xAccessor, displayXAccessor: displayXAccessor, fullData: fullData }, xScale.domain());

  	return _extends$3({}, state, {
  		xScale: xScale,
  		plotData: plotData,
  		chartConfig: chartConfig
  	});
  }

  function updateChart(newState, initialXScale, props, lastItemWasVisible, initialChartConfig) {
  	var fullData = newState.fullData,
  	    xScale = newState.xScale,
  	    xAccessor = newState.xAccessor,
  	    displayXAccessor = newState.displayXAccessor,
  	    filterData = newState.filterData;


  	var lastItem = last(fullData);

  	var _initialXScale$domain = initialXScale.domain(),
  	    _initialXScale$domain2 = _slicedToArray$7(_initialXScale$domain, 2),
  	    start = _initialXScale$domain2[0],
  	    end = _initialXScale$domain2[1];

  	if (process.env.NODE_ENV !== "production") {
  		log$3("TRIVIAL CHANGE");
  	}

  	var postCalculator = props.postCalculator,
  	    children = props.children,
  	    padding = props.padding,
  	    flipXScale = props.flipXScale;
  	var maintainPointsPerPixelOnResize = props.maintainPointsPerPixelOnResize;

  	var direction = getXScaleDirection(flipXScale);
  	var dimensions = getDimensions$1(props);

  	var updatedXScale = setXRange(xScale, dimensions, padding, direction);

  	// console.log("lastItemWasVisible =", lastItemWasVisible, end, xAccessor(lastItem), end >= xAccessor(lastItem));
  	var initialPlotData = void 0;
  	if (!lastItemWasVisible || end >= xAccessor(lastItem)) {
  		// resize comes here...
  		var _initialXScale$range = initialXScale.range(),
  		    _initialXScale$range2 = _slicedToArray$7(_initialXScale$range, 2),
  		    rangeStart = _initialXScale$range2[0],
  		    rangeEnd = _initialXScale$range2[1];

  		var _updatedXScale$range = updatedXScale.range(),
  		    _updatedXScale$range2 = _slicedToArray$7(_updatedXScale$range, 2),
  		    newRangeStart = _updatedXScale$range2[0],
  		    newRangeEnd = _updatedXScale$range2[1];

  		var newDomainExtent = (newRangeEnd - newRangeStart) / (rangeEnd - rangeStart) * (end - start);
  		var newStart = maintainPointsPerPixelOnResize ? end - newDomainExtent : start;

  		var lastItemX = initialXScale(xAccessor(lastItem));
  		// console.log("pointsPerPixel => ", newStart, start, end, updatedXScale(end));
  		var response = filterData(fullData, [newStart, end], xAccessor, updatedXScale, { fallbackStart: start, fallbackEnd: { lastItem: lastItem, lastItemX: lastItemX } });
  		initialPlotData = response.plotData;
  		updatedXScale.domain(response.domain);
  		// console.log("HERE!!!!!", start, end);
  	} else if (lastItemWasVisible && end < xAccessor(lastItem)) {
  		// this is when a new item is added and last item was visible
  		// so slide over and show the new item also

  		// get plotData between [xAccessor(l) - (end - start), xAccessor(l)] and DO change the domain
  		var dx = initialXScale(xAccessor(lastItem)) - initialXScale.range()[1];

  		var _initialXScale$range$ = initialXScale.range().map(function (x) {
  			return x + dx;
  		}).map(initialXScale.invert),
  		    _initialXScale$range$2 = _slicedToArray$7(_initialXScale$range$, 2),
  		    _newStart = _initialXScale$range$2[0],
  		    newEnd = _initialXScale$range$2[1];

  		var _response = filterData(fullData, [_newStart, newEnd], xAccessor, updatedXScale);
  		initialPlotData = _response.plotData;
  		updatedXScale.domain(_response.domain); // if last item was visible, then shift
  	}
  	// plotData = getDataOfLength(fullData, showingInterval, plotData.length)
  	var plotData = postCalculator(initialPlotData);
  	var chartConfig = getChartConfigWithUpdatedYScales(getNewChartConfig(dimensions, children, initialChartConfig), { plotData: plotData, xAccessor: xAccessor, displayXAccessor: displayXAccessor, fullData: fullData }, updatedXScale.domain());

  	return {
  		xScale: updatedXScale,
  		xAccessor: xAccessor,
  		chartConfig: chartConfig,
  		plotData: plotData,
  		fullData: fullData,
  		filterData: filterData
  	};
  }

  function calculateState(props) {
  	var inputXAccesor = props.xAccessor,
  	    xExtentsProp = props.xExtents,
  	    data = props.data,
  	    padding = props.padding,
  	    flipXScale = props.flipXScale;


  	if (process.env.NODE_ENV !== "production" && isDefined(props.xScale.invert)) {
  		for (var i = 1; i < data.length; i++) {
  			var prev = data[i - 1];
  			var curr = data[i];
  			if (inputXAccesor(prev) > inputXAccesor(curr)) {
  				throw new Error("'data' is not sorted on 'xAccessor', send 'data' sorted in ascending order of 'xAccessor'");
  			}
  		}
  	}

  	var direction = getXScaleDirection(flipXScale);
  	var dimensions = getDimensions$1(props);

  	var extent$$1 = typeof xExtentsProp === "function" ? xExtentsProp(data) : extent(xExtentsProp.map(function (d) {
  		return functor(d);
  	}).map(function (each) {
  		return each(data, inputXAccesor);
  	}));

  	var _calculateFullData = calculateFullData(props),
  	    xAccessor = _calculateFullData.xAccessor,
  	    displayXAccessor = _calculateFullData.displayXAccessor,
  	    xScale = _calculateFullData.xScale,
  	    fullData = _calculateFullData.fullData,
  	    filterData = _calculateFullData.filterData;

  	var updatedXScale = setXRange(xScale, dimensions, padding, direction);

  	var _filterData = filterData(fullData, extent$$1, inputXAccesor, updatedXScale),
  	    plotData = _filterData.plotData,
  	    domain = _filterData.domain;

  	if (process.env.NODE_ENV !== "production" && plotData.length <= 1) {
  		throw new Error("Showing " + plotData.length + " datapoints, review the 'xExtents' prop of ChartCanvas");
  	}
  	return {
  		plotData: plotData,
  		xScale: updatedXScale.domain(domain),
  		xAccessor: xAccessor,
  		displayXAccessor: displayXAccessor,
  		fullData: fullData,
  		filterData: filterData
  	};
  }

  function setXRange(xScale, dimensions, padding) {
  	var direction = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

  	if (xScale.rangeRoundPoints) {
  		if (isNaN(padding)) throw new Error("padding has to be a number for ordinal scale");
  		xScale.rangeRoundPoints([0, dimensions.width], padding);
  	} else if (xScale.padding) {
  		if (isNaN(padding)) throw new Error("padding has to be a number for ordinal scale");
  		xScale.range([0, dimensions.width]);
  		xScale.padding(padding / 2);
  	} else {
  		var _ref = isNaN(padding) ? padding : { left: padding, right: padding },
  		    left = _ref.left,
  		    right = _ref.right;

  		if (direction > 0) {
  			xScale.range([left, dimensions.width - right]);
  		} else {
  			xScale.range([dimensions.width - right, left]);
  		}
  	}
  	return xScale;
  }

  function pinchCoordinates(pinch) {
  	var touch1Pos = pinch.touch1Pos,
  	    touch2Pos = pinch.touch2Pos;


  	return {
  		topLeft: [Math.min(touch1Pos[0], touch2Pos[0]), Math.min(touch1Pos[1], touch2Pos[1])],
  		bottomRight: [Math.max(touch1Pos[0], touch2Pos[0]), Math.max(touch1Pos[1], touch2Pos[1])]
  	};
  }

  var ChartCanvas = function (_Component) {
  	_inherits$4(ChartCanvas, _Component);

  	function ChartCanvas() {
  		_classCallCheck$4(this, ChartCanvas);

  		var _this = _possibleConstructorReturn$4(this, (ChartCanvas.__proto__ || Object.getPrototypeOf(ChartCanvas)).call(this));

  		_this.getDataInfo = _this.getDataInfo.bind(_this);
  		_this.getCanvasContexts = _this.getCanvasContexts.bind(_this);

  		_this.handleMouseMove = _this.handleMouseMove.bind(_this);
  		_this.handleMouseEnter = _this.handleMouseEnter.bind(_this);
  		_this.handleMouseLeave = _this.handleMouseLeave.bind(_this);
  		_this.handleZoom = _this.handleZoom.bind(_this);
  		_this.handlePinchZoom = _this.handlePinchZoom.bind(_this);
  		_this.handlePinchZoomEnd = _this.handlePinchZoomEnd.bind(_this);
  		_this.handlePan = _this.handlePan.bind(_this);
  		_this.handlePanEnd = _this.handlePanEnd.bind(_this);
  		_this.handleClick = _this.handleClick.bind(_this);
  		_this.handleMouseDown = _this.handleMouseDown.bind(_this);
  		_this.handleDoubleClick = _this.handleDoubleClick.bind(_this);
  		_this.handleContextMenu = _this.handleContextMenu.bind(_this);
  		_this.handleDragStart = _this.handleDragStart.bind(_this);
  		_this.handleDrag = _this.handleDrag.bind(_this);
  		_this.handleDragEnd = _this.handleDragEnd.bind(_this);

  		_this.panHelper = _this.panHelper.bind(_this);
  		_this.pinchZoomHelper = _this.pinchZoomHelper.bind(_this);
  		_this.xAxisZoom = _this.xAxisZoom.bind(_this);
  		_this.yAxisZoom = _this.yAxisZoom.bind(_this);
  		_this.resetYDomain = _this.resetYDomain.bind(_this);
  		_this.calculateStateForDomain = _this.calculateStateForDomain.bind(_this);
  		_this.generateSubscriptionId = _this.generateSubscriptionId.bind(_this);
  		_this.draw = _this.draw.bind(_this);
  		_this.redraw = _this.redraw.bind(_this);
  		_this.getAllPanConditions = _this.getAllPanConditions.bind(_this);

  		_this.subscriptions = [];
  		_this.subscribe = _this.subscribe.bind(_this);
  		_this.unsubscribe = _this.unsubscribe.bind(_this);
  		_this.amIOnTop = _this.amIOnTop.bind(_this);
  		_this.saveEventCaptureNode = _this.saveEventCaptureNode.bind(_this);
  		_this.saveCanvasContainerNode = _this.saveCanvasContainerNode.bind(_this);
  		_this.setCursorClass = _this.setCursorClass.bind(_this);
  		_this.getMutableState = _this.getMutableState.bind(_this);
  		// this.canvasDrawCallbackList = [];
  		_this.interactiveState = [];
  		_this.panInProgress = false;

  		_this.state = {};
  		_this.mutableState = {};
  		_this.lastSubscriptionId = 0;
  		return _this;
  	}

  	_createClass$4(ChartCanvas, [{
  		key: "saveEventCaptureNode",
  		value: function saveEventCaptureNode(node) {
  			this.eventCaptureNode = node;
  		}
  	}, {
  		key: "saveCanvasContainerNode",
  		value: function saveCanvasContainerNode(node) {
  			this.canvasContainerNode = node;
  		}
  	}, {
  		key: "getMutableState",
  		value: function getMutableState() {
  			return this.mutableState;
  		}
  	}, {
  		key: "getDataInfo",
  		value: function getDataInfo() {
  			return _extends$3({}, this.state, {
  				fullData: this.fullData
  			});
  		}
  	}, {
  		key: "getCanvasContexts",
  		value: function getCanvasContexts() {
  			if (this.canvasContainerNode) {
  				return this.canvasContainerNode.getCanvasContexts();
  			}
  		}
  	}, {
  		key: "generateSubscriptionId",
  		value: function generateSubscriptionId() {
  			this.lastSubscriptionId++;
  			return this.lastSubscriptionId;
  		}
  	}, {
  		key: "clearBothCanvas",
  		value: function clearBothCanvas() {
  			var canvases = this.getCanvasContexts();
  			if (canvases && canvases.axes) {
  				clearCanvas([canvases.axes,
  				// canvases.hover,
  				canvases.mouseCoord], this.props.ratio);
  			}
  		}
  	}, {
  		key: "clearMouseCanvas",
  		value: function clearMouseCanvas() {
  			var canvases = this.getCanvasContexts();
  			if (canvases && canvases.mouseCoord) {
  				clearCanvas([canvases.mouseCoord], this.props.ratio);
  			}
  		}
  	}, {
  		key: "clearThreeCanvas",
  		value: function clearThreeCanvas() {
  			var canvases = this.getCanvasContexts();
  			if (canvases && canvases.axes) {
  				clearCanvas([canvases.axes,
  				// canvases.hover,
  				canvases.mouseCoord, canvases.bg], this.props.ratio);
  			}
  		}
  	}, {
  		key: "subscribe",
  		value: function subscribe(id, rest) {
  			var _rest$getPanCondition = rest.getPanConditions,
  			    getPanConditions = _rest$getPanCondition === undefined ? functor({
  				draggable: false,
  				panEnabled: true
  			}) : _rest$getPanCondition;

  			this.subscriptions = this.subscriptions.concat(_extends$3({
  				id: id
  			}, rest, {
  				getPanConditions: getPanConditions
  			}));
  		}
  	}, {
  		key: "unsubscribe",
  		value: function unsubscribe(id) {
  			this.subscriptions = this.subscriptions.filter(function (each) {
  				return each.id !== id;
  			});
  		}
  	}, {
  		key: "getAllPanConditions",
  		value: function getAllPanConditions() {
  			return this.subscriptions.map(function (each) {
  				return each.getPanConditions();
  			});
  		}
  	}, {
  		key: "setCursorClass",
  		value: function setCursorClass(className) {
  			if (this.eventCaptureNode != null) {
  				this.eventCaptureNode.setCursorClass(className);
  			}
  		}
  	}, {
  		key: "amIOnTop",
  		value: function amIOnTop(id) {
  			var dragableComponents = this.subscriptions.filter(function (each) {
  				return each.getPanConditions().draggable;
  			});

  			return dragableComponents.length > 0 && last(dragableComponents).id === id;
  		}
  	}, {
  		key: "handleContextMenu",
  		value: function handleContextMenu(mouseXY, e) {
  			var _state = this.state,
  			    xAccessor = _state.xAccessor,
  			    chartConfig = _state.chartConfig,
  			    plotData = _state.plotData,
  			    xScale = _state.xScale;


  			var currentCharts = getCurrentCharts(chartConfig, mouseXY);
  			var currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);

  			this.triggerEvent("contextmenu", {
  				mouseXY: mouseXY,
  				currentItem: currentItem,
  				currentCharts: currentCharts
  			}, e);
  		}
  	}, {
  		key: "calculateStateForDomain",
  		value: function calculateStateForDomain(newDomain) {
  			var _state2 = this.state,
  			    xAccessor = _state2.xAccessor,
  			    displayXAccessor = _state2.displayXAccessor,
  			    initialXScale = _state2.xScale,
  			    initialChartConfig = _state2.chartConfig,
  			    initialPlotData = _state2.plotData;
  			var filterData = this.state.filterData;
  			var fullData = this.fullData;
  			var postCalculator = this.props.postCalculator;

  			var _filterData2 = filterData(fullData, newDomain, xAccessor, initialXScale, {
  				currentPlotData: initialPlotData,
  				currentDomain: initialXScale.domain()
  			}),
  			    beforePlotData = _filterData2.plotData,
  			    domain = _filterData2.domain;

  			var plotData = postCalculator(beforePlotData);
  			var updatedScale = initialXScale.copy().domain(domain);
  			var chartConfig = getChartConfigWithUpdatedYScales(initialChartConfig, { plotData: plotData, xAccessor: xAccessor, displayXAccessor: displayXAccessor, fullData: fullData }, updatedScale.domain());

  			return {
  				xScale: updatedScale,
  				plotData: plotData,
  				chartConfig: chartConfig
  			};
  		}
  	}, {
  		key: "pinchZoomHelper",
  		value: function pinchZoomHelper(initialPinch, finalPinch) {
  			var initialPinchXScale = initialPinch.xScale;
  			var _state3 = this.state,
  			    initialXScale = _state3.xScale,
  			    initialChartConfig = _state3.chartConfig,
  			    initialPlotData = _state3.plotData,
  			    xAccessor = _state3.xAccessor,
  			    displayXAccessor = _state3.displayXAccessor;
  			var filterData = this.state.filterData;
  			var fullData = this.fullData;
  			var postCalculator = this.props.postCalculator;

  			var _pinchCoordinates = pinchCoordinates(initialPinch),
  			    iTL = _pinchCoordinates.topLeft,
  			    iBR = _pinchCoordinates.bottomRight;

  			var _pinchCoordinates2 = pinchCoordinates(finalPinch),
  			    fTL = _pinchCoordinates2.topLeft,
  			    fBR = _pinchCoordinates2.bottomRight;

  			var e = initialPinchXScale.range()[1];

  			var xDash = Math.round(-(iBR[0] * fTL[0] - iTL[0] * fBR[0]) / (iTL[0] - iBR[0]));
  			var yDash = Math.round(e + ((e - iBR[0]) * (e - fTL[0]) - (e - iTL[0]) * (e - fBR[0])) / (e - iTL[0] - (e - iBR[0])));

  			var x = Math.round(-xDash * iTL[0] / (-xDash + fTL[0]));
  			var y = Math.round(e - (yDash - e) * (e - iTL[0]) / (yDash + (e - fTL[0])));

  			var newDomain = [x, y].map(initialPinchXScale.invert);
  			// var domainR = initial.right + right;

  			var _filterData3 = filterData(fullData, newDomain, xAccessor, initialPinchXScale, {
  				currentPlotData: initialPlotData,
  				currentDomain: initialXScale.domain()
  			}),
  			    beforePlotData = _filterData3.plotData,
  			    domain = _filterData3.domain;

  			var plotData = postCalculator(beforePlotData);
  			var updatedScale = initialXScale.copy().domain(domain);

  			var mouseXY = finalPinch.touch1Pos;
  			var chartConfig = getChartConfigWithUpdatedYScales(initialChartConfig, { plotData: plotData, xAccessor: xAccessor, displayXAccessor: displayXAccessor, fullData: fullData }, updatedScale.domain());
  			var currentItem = getCurrentItem(updatedScale, xAccessor, mouseXY, plotData);

  			return {
  				chartConfig: chartConfig,
  				xScale: updatedScale,
  				plotData: plotData,
  				mouseXY: mouseXY,
  				currentItem: currentItem
  			};
  		}
  	}, {
  		key: "cancelDrag",
  		value: function cancelDrag() {
  			this.eventCaptureNode.cancelDrag();
  			this.triggerEvent("dragcancel");
  		}
  	}, {
  		key: "handlePinchZoom",
  		value: function handlePinchZoom(initialPinch, finalPinch, e) {
  			var _this2 = this;

  			if (!this.waitingForPinchZoomAnimationFrame) {
  				this.waitingForPinchZoomAnimationFrame = true;
  				var state = this.pinchZoomHelper(initialPinch, finalPinch);

  				this.triggerEvent("pinchzoom", state, e);

  				this.finalPinch = finalPinch;

  				requestAnimationFrame(function () {
  					_this2.clearBothCanvas();
  					_this2.draw({ trigger: "pinchzoom" });
  					_this2.waitingForPinchZoomAnimationFrame = false;
  				});
  			}
  		}
  	}, {
  		key: "handlePinchZoomEnd",
  		value: function handlePinchZoomEnd(initialPinch, e) {
  			var xAccessor = this.state.xAccessor;


  			if (this.finalPinch) {
  				var state = this.pinchZoomHelper(initialPinch, this.finalPinch);
  				var xScale = state.xScale;

  				this.triggerEvent("pinchzoom", state, e);

  				this.finalPinch = null;

  				this.clearThreeCanvas();

  				var fullData = this.fullData;

  				var firstItem = head(fullData);

  				var start = head(xScale.domain());
  				var end = xAccessor(firstItem);
  				var onLoadMore = this.props.onLoadMore;


  				this.setState(state, function () {
  					if (start < end) {
  						onLoadMore(start, end);
  					}
  				});
  			}
  		}
  	}, {
  		key: "handleZoom",
  		value: function handleZoom(zoomDirection, mouseXY, e) {
  			if (this.panInProgress) return;
  			// console.log("zoomDirection ", zoomDirection, " mouseXY ", mouseXY);
  			var _state4 = this.state,
  			    xAccessor = _state4.xAccessor,
  			    initialXScale = _state4.xScale,
  			    initialPlotData = _state4.plotData;
  			var _props = this.props,
  			    zoomMultiplier = _props.zoomMultiplier,
  			    zoomAnchor = _props.zoomAnchor;
  			var fullData = this.fullData;

  			var item = zoomAnchor({
  				xScale: initialXScale,
  				xAccessor: xAccessor,
  				mouseXY: mouseXY,
  				plotData: initialPlotData,
  				fullData: fullData
  			});

  			var cx = initialXScale(item);
  			var c = zoomDirection > 0 ? 1 * zoomMultiplier : 1 / zoomMultiplier;
  			var newDomain = initialXScale.range().map(function (x) {
  				return cx + (x - cx) * c;
  			}).map(initialXScale.invert);

  			var _calculateStateForDom = this.calculateStateForDomain(newDomain),
  			    xScale = _calculateStateForDom.xScale,
  			    plotData = _calculateStateForDom.plotData,
  			    chartConfig = _calculateStateForDom.chartConfig;

  			var currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
  			var currentCharts = getCurrentCharts(chartConfig, mouseXY);

  			this.clearThreeCanvas();

  			var firstItem = head(fullData);

  			var start = head(xScale.domain());
  			var end = xAccessor(firstItem);
  			var onLoadMore = this.props.onLoadMore;


  			this.mutableState = {
  				mouseXY: mouseXY,
  				currentItem: currentItem,
  				currentCharts: currentCharts
  			};

  			this.triggerEvent("zoom", {
  				xScale: xScale,
  				plotData: plotData,
  				chartConfig: chartConfig,
  				mouseXY: mouseXY,
  				currentCharts: currentCharts,
  				currentItem: currentItem,
  				show: true
  			}, e);

  			this.setState({
  				xScale: xScale,
  				plotData: plotData,
  				chartConfig: chartConfig
  			}, function () {
  				if (start < end) {
  					onLoadMore(start, end);
  				}
  			});
  		}
  	}, {
  		key: "xAxisZoom",
  		value: function xAxisZoom(newDomain) {
  			var _calculateStateForDom2 = this.calculateStateForDomain(newDomain),
  			    xScale = _calculateStateForDom2.xScale,
  			    plotData = _calculateStateForDom2.plotData,
  			    chartConfig = _calculateStateForDom2.chartConfig;

  			this.clearThreeCanvas();

  			var xAccessor = this.state.xAccessor;
  			var fullData = this.fullData;

  			var firstItem = head(fullData);
  			var start = head(xScale.domain());
  			var end = xAccessor(firstItem);
  			var onLoadMore = this.props.onLoadMore;


  			this.setState({
  				xScale: xScale,
  				plotData: plotData,
  				chartConfig: chartConfig
  			}, function () {
  				if (start < end) onLoadMore(start, end);
  			});
  		}
  	}, {
  		key: "yAxisZoom",
  		value: function yAxisZoom(chartId, newDomain) {
  			this.clearThreeCanvas();
  			var initialChartConfig = this.state.chartConfig;

  			var chartConfig = initialChartConfig.map(function (each) {
  				if (each.id === chartId) {
  					var yScale = each.yScale;

  					return _extends$3({}, each, {
  						yScale: yScale.copy().domain(newDomain),
  						yPanEnabled: true
  					});
  				} else {
  					return each;
  				}
  			});

  			this.setState({
  				chartConfig: chartConfig
  			});
  		}
  	}, {
  		key: "triggerEvent",
  		value: function triggerEvent(type, props, e) {
  			var _this3 = this;

  			// console.log("triggering ->", type);

  			this.subscriptions.forEach(function (each) {
  				var state = _extends$3({}, _this3.state, {
  					fullData: _this3.fullData,
  					subscriptions: _this3.subscriptions
  				});
  				each.listener(type, props, state, e);
  			});
  		}
  	}, {
  		key: "draw",
  		value: function draw(props) {
  			this.subscriptions.forEach(function (each) {
  				if (isDefined(each.draw)) each.draw(props);
  			});
  		}
  	}, {
  		key: "redraw",
  		value: function redraw() {
  			this.clearThreeCanvas();
  			this.draw({ force: true });
  		}
  	}, {
  		key: "panHelper",
  		value: function panHelper(mouseXY, initialXScale, _ref2, chartsToPan) {
  			var dx = _ref2.dx,
  			    dy = _ref2.dy;
  			var _state5 = this.state,
  			    xAccessor = _state5.xAccessor,
  			    displayXAccessor = _state5.displayXAccessor,
  			    initialChartConfig = _state5.chartConfig;
  			var filterData = this.state.filterData;
  			var fullData = this.fullData;
  			var postCalculator = this.props.postCalculator;

  			// console.log(dx, dy);

  			if (isNotDefined(initialXScale.invert)) throw new Error("xScale provided does not have an invert() method." + "You are likely using an ordinal scale. This scale does not support zoom, pan");

  			var newDomain = initialXScale.range().map(function (x) {
  				return x - dx;
  			}).map(initialXScale.invert);

  			var _filterData4 = filterData(fullData, newDomain, xAccessor, initialXScale, {
  				currentPlotData: this.hackyWayToStopPanBeyondBounds__plotData,
  				currentDomain: this.hackyWayToStopPanBeyondBounds__domain
  			}),
  			    beforePlotData = _filterData4.plotData,
  			    domain = _filterData4.domain;

  			var updatedScale = initialXScale.copy().domain(domain);
  			var plotData = postCalculator(beforePlotData);
  			// console.log(last(plotData));

  			var currentItem = getCurrentItem(updatedScale, xAccessor, mouseXY, plotData);
  			var chartConfig = getChartConfigWithUpdatedYScales(initialChartConfig, { plotData: plotData, xAccessor: xAccessor, displayXAccessor: displayXAccessor, fullData: fullData }, updatedScale.domain(), dy, chartsToPan);
  			var currentCharts = getCurrentCharts(chartConfig, mouseXY);

  			// console.log(initialXScale.domain(), newDomain, updatedScale.domain());
  			return {
  				xScale: updatedScale,
  				plotData: plotData,
  				chartConfig: chartConfig,
  				mouseXY: mouseXY,
  				currentCharts: currentCharts,
  				currentItem: currentItem
  			};
  		}
  	}, {
  		key: "handlePan",
  		value: function handlePan(mousePosition$$1, panStartXScale, dxdy, chartsToPan, e) {
  			var _this4 = this;

  			if (!this.waitingForPanAnimationFrame) {
  				this.waitingForPanAnimationFrame = true;

  				this.hackyWayToStopPanBeyondBounds__plotData = this.hackyWayToStopPanBeyondBounds__plotData || this.state.plotData;
  				this.hackyWayToStopPanBeyondBounds__domain = this.hackyWayToStopPanBeyondBounds__domain || this.state.xScale.domain();

  				var state = this.panHelper(mousePosition$$1, panStartXScale, dxdy, chartsToPan);

  				this.hackyWayToStopPanBeyondBounds__plotData = state.plotData;
  				this.hackyWayToStopPanBeyondBounds__domain = state.xScale.domain();

  				this.panInProgress = true;
  				// console.log(panStartXScale.domain(), state.xScale.domain());

  				this.triggerEvent("pan", state, e);

  				this.mutableState = {
  					mouseXY: state.mouseXY,
  					currentItem: state.currentItem,
  					currentCharts: state.currentCharts
  				};
  				requestAnimationFrame(function () {
  					_this4.waitingForPanAnimationFrame = false;
  					_this4.clearBothCanvas();
  					_this4.draw({ trigger: "pan" });
  				});
  			}
  		}
  	}, {
  		key: "handlePanEnd",
  		value: function handlePanEnd(mousePosition$$1, panStartXScale, dxdy, chartsToPan, e) {
  			var _this5 = this;

  			var state = this.panHelper(mousePosition$$1, panStartXScale, dxdy, chartsToPan);
  			// console.log(this.canvasDrawCallbackList.map(d => d.type));
  			this.hackyWayToStopPanBeyondBounds__plotData = null;
  			this.hackyWayToStopPanBeyondBounds__domain = null;

  			this.panInProgress = false;

  			// console.log("PANEND", panEnd++);
  			var xScale = state.xScale,
  			    plotData = state.plotData,
  			    chartConfig = state.chartConfig;


  			this.triggerEvent("panend", state, e);

  			requestAnimationFrame(function () {
  				var xAccessor = _this5.state.xAccessor;
  				var fullData = _this5.fullData;


  				var firstItem = head(fullData);
  				var start = head(xScale.domain());
  				var end = xAccessor(firstItem);
  				// console.log(start, end, start < end ? "Load more" : "I have it");

  				var onLoadMore = _this5.props.onLoadMore;


  				_this5.clearThreeCanvas();

  				_this5.setState({
  					xScale: xScale,
  					plotData: plotData,
  					chartConfig: chartConfig
  				}, function () {
  					if (start < end) onLoadMore(start, end);
  				});
  			});
  		}
  	}, {
  		key: "handleMouseDown",
  		value: function handleMouseDown(mousePosition$$1, currentCharts, e) {
  			this.triggerEvent("mousedown", this.mutableState, e);
  		}
  	}, {
  		key: "handleMouseEnter",
  		value: function handleMouseEnter(e) {
  			this.triggerEvent("mouseenter", {
  				show: true
  			}, e);
  		}
  	}, {
  		key: "handleMouseMove",
  		value: function handleMouseMove(mouseXY, inputType, e) {
  			var _this6 = this;

  			if (!this.waitingForMouseMoveAnimationFrame) {
  				this.waitingForMouseMoveAnimationFrame = true;

  				var _state6 = this.state,
  				    chartConfig = _state6.chartConfig,
  				    plotData = _state6.plotData,
  				    xScale = _state6.xScale,
  				    xAccessor = _state6.xAccessor;

  				var currentCharts = getCurrentCharts(chartConfig, mouseXY);
  				var currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
  				this.triggerEvent("mousemove", {
  					show: true,
  					mouseXY: mouseXY,
  					// prevMouseXY is used in interactive components
  					prevMouseXY: this.prevMouseXY,
  					currentItem: currentItem,
  					currentCharts: currentCharts
  				}, e);

  				this.prevMouseXY = mouseXY;
  				this.mutableState = {
  					mouseXY: mouseXY,
  					currentItem: currentItem,
  					currentCharts: currentCharts
  				};

  				requestAnimationFrame(function () {
  					_this6.clearMouseCanvas();
  					_this6.draw({ trigger: "mousemove" });
  					_this6.waitingForMouseMoveAnimationFrame = false;
  				});
  			}
  		}
  	}, {
  		key: "handleMouseLeave",
  		value: function handleMouseLeave(e) {
  			this.triggerEvent("mouseleave", { show: false }, e);
  			this.clearMouseCanvas();
  			this.draw({ trigger: "mouseleave" });
  		}
  	}, {
  		key: "handleDragStart",
  		value: function handleDragStart(_ref3, e) {
  			var startPos = _ref3.startPos;

  			this.triggerEvent("dragstart", { startPos: startPos }, e);
  		}
  	}, {
  		key: "handleDrag",
  		value: function handleDrag(_ref4, e) {
  			var _this7 = this;

  			var startPos = _ref4.startPos,
  			    mouseXY = _ref4.mouseXY;
  			var _state7 = this.state,
  			    chartConfig = _state7.chartConfig,
  			    plotData = _state7.plotData,
  			    xScale = _state7.xScale,
  			    xAccessor = _state7.xAccessor;

  			var currentCharts = getCurrentCharts(chartConfig, mouseXY);
  			var currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);

  			this.triggerEvent("drag", {
  				startPos: startPos,
  				mouseXY: mouseXY,
  				currentItem: currentItem,
  				currentCharts: currentCharts
  			}, e);

  			this.mutableState = {
  				mouseXY: mouseXY,
  				currentItem: currentItem,
  				currentCharts: currentCharts
  			};

  			requestAnimationFrame(function () {
  				_this7.clearMouseCanvas();
  				_this7.draw({ trigger: "drag" });
  			});
  		}
  	}, {
  		key: "handleDragEnd",
  		value: function handleDragEnd(_ref5, e) {
  			var _this8 = this;

  			var mouseXY = _ref5.mouseXY;

  			this.triggerEvent("dragend", { mouseXY: mouseXY }, e);

  			requestAnimationFrame(function () {
  				_this8.clearMouseCanvas();
  				_this8.draw({ trigger: "dragend" });
  			});
  		}
  	}, {
  		key: "handleClick",
  		value: function handleClick(mousePosition$$1, e) {
  			var _this9 = this;

  			this.triggerEvent("click", this.mutableState, e);

  			requestAnimationFrame(function () {
  				_this9.clearMouseCanvas();
  				_this9.draw({ trigger: "click" });
  			});
  		}
  	}, {
  		key: "handleDoubleClick",
  		value: function handleDoubleClick(mousePosition$$1, e) {
  			this.triggerEvent("dblclick", {}, e);
  		}
  	}, {
  		key: "getChildContext",
  		value: function getChildContext() {
  			var dimensions = getDimensions$1(this.props);
  			return {
  				fullData: this.fullData,
  				plotData: this.state.plotData,
  				width: dimensions.width,
  				height: dimensions.height,
  				chartConfig: this.state.chartConfig,
  				xScale: this.state.xScale,
  				xAccessor: this.state.xAccessor,
  				displayXAccessor: this.state.displayXAccessor,
  				chartCanvasType: this.props.type,
  				margin: this.props.margin,
  				ratio: this.props.ratio,
  				xAxisZoom: this.xAxisZoom,
  				yAxisZoom: this.yAxisZoom,
  				getCanvasContexts: this.getCanvasContexts,
  				redraw: this.redraw,
  				subscribe: this.subscribe,
  				unsubscribe: this.unsubscribe,
  				generateSubscriptionId: this.generateSubscriptionId,
  				getMutableState: this.getMutableState,
  				amIOnTop: this.amIOnTop,
  				setCursorClass: this.setCursorClass
  			};
  		}
  	}, {
  		key: "componentWillMount",
  		value: function componentWillMount() {
  			var _resetChart = resetChart(this.props, true),
  			    fullData = _resetChart.fullData,
  			    state = _objectWithoutProperties$1(_resetChart, ["fullData"]);

  			this.setState(state);
  			this.fullData = fullData;
  		}
  	}, {
  		key: "componentWillReceiveProps",
  		value: function componentWillReceiveProps(nextProps) {
  			var reset = shouldResetChart(this.props, nextProps);

  			var interaction = isInteractionEnabled(this.state.xScale, this.state.xAccessor, this.state.plotData);
  			var initialChartConfig = this.state.chartConfig;


  			var newState = void 0;
  			if (!interaction || reset || !shallowEqual(this.props.xExtents, nextProps.xExtents)) {
  				if (process.env.NODE_ENV !== "production") {
  					if (!interaction) log$3("RESET CHART, changes to a non interactive chart");else if (reset) log$3("RESET CHART, one or more of these props changed", CANDIDATES_FOR_RESET);else log$3("xExtents changed");
  				}
  				// do reset
  				newState = resetChart(nextProps);
  			} else {
  				var _state$xScale$domain = this.state.xScale.domain(),
  				    _state$xScale$domain2 = _slicedToArray$7(_state$xScale$domain, 2),
  				    start = _state$xScale$domain2[0],
  				    end = _state$xScale$domain2[1];

  				var prevLastItem = last(this.fullData);

  				var calculatedState = calculateFullData(nextProps);
  				var xAccessor = calculatedState.xAccessor;

  				var lastItemWasVisible = xAccessor(prevLastItem) <= end && xAccessor(prevLastItem) >= start;

  				if (process.env.NODE_ENV !== "production") {
  					if (this.props.data !== nextProps.data) log$3("data is changed but seriesName did not, change the seriesName if you wish to reset the chart and lastItemWasVisible = ", lastItemWasVisible);else log$3("Trivial change, may be width/height or type changed, but that does not matter");
  				}

  				newState = updateChart(calculatedState, this.state.xScale, nextProps, lastItemWasVisible, initialChartConfig);
  			}

  			var _newState = newState,
  			    fullData = _newState.fullData,
  			    state = _objectWithoutProperties$1(_newState, ["fullData"]);

  			if (this.panInProgress) {
  				if (process.env.NODE_ENV !== "production") {
  					log$3("Pan is in progress");
  				}
  			} else {
  				/*
      if (!reset) {
      	state.chartConfig
      		.forEach((each) => {
      			// const sourceChartConfig = initialChartConfig.filter(d => d.id === each.id);
      			const prevChartConfig = find(initialChartConfig, d => d.id === each.id);
      			if (isDefined(prevChartConfig) && prevChartConfig.yPanEnabled) {
      				each.yScale.domain(prevChartConfig.yScale.domain());
      				each.yPanEnabled = prevChartConfig.yPanEnabled;
      			}
      		});
      }
      */
  				this.clearThreeCanvas();

  				this.setState(state);
  			}
  			this.fullData = fullData;
  		}
  		/*
    componentDidUpdate(prevProps, prevState) {
    	console.error(this.state.chartConfig, this.state.chartConfig.map(d => d.yScale.domain()));
    }
    */

  	}, {
  		key: "resetYDomain",
  		value: function resetYDomain(chartId) {
  			var chartConfig = this.state.chartConfig;

  			var changed = false;
  			var newChartConfig = chartConfig.map(function (each) {
  				if ((isNotDefined(chartId) || each.id === chartId) && !shallowEqual(each.yScale.domain(), each.realYDomain)) {
  					changed = true;
  					return _extends$3({}, each, {
  						yScale: each.yScale.domain(each.realYDomain),
  						yPanEnabled: false
  					});
  				}
  				return each;
  			});

  			if (changed) {
  				this.clearThreeCanvas();
  				this.setState({
  					chartConfig: newChartConfig
  				});
  			}
  		}
  	}, {
  		key: "shouldComponentUpdate",
  		value: function shouldComponentUpdate() {
  			// console.log("Happneing.....", !this.panInProgress)
  			return !this.panInProgress;
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var _props2 = this.props,
  			    type = _props2.type,
  			    height = _props2.height,
  			    width = _props2.width,
  			    margin = _props2.margin,
  			    className = _props2.className,
  			    zIndex = _props2.zIndex,
  			    defaultFocus = _props2.defaultFocus,
  			    ratio = _props2.ratio,
  			    mouseMoveEvent = _props2.mouseMoveEvent,
  			    panEvent = _props2.panEvent,
  			    zoomEvent = _props2.zoomEvent;
  			var _props3 = this.props,
  			    useCrossHairStyleCursor = _props3.useCrossHairStyleCursor,
  			    onSelect = _props3.onSelect;
  			var _state8 = this.state,
  			    plotData = _state8.plotData,
  			    xScale = _state8.xScale,
  			    xAccessor = _state8.xAccessor,
  			    chartConfig = _state8.chartConfig;

  			var dimensions = getDimensions$1(this.props);

  			var interaction = isInteractionEnabled(xScale, xAccessor, plotData);

  			var cursorStyle = useCrossHairStyleCursor && interaction;
  			var cursor = getCursorStyle();
  			return React__default.createElement(
  				"div",
  				{ style: { position: "relative", width: width, height: height }, className: className, onClick: onSelect },
  				React__default.createElement(CanvasContainer, { ref: this.saveCanvasContainerNode,
  					type: type,
  					ratio: ratio,
  					width: width, height: height, zIndex: zIndex }),
  				React__default.createElement(
  					"svg",
  					{ className: className, width: width, height: height, style: { position: "absolute", zIndex: zIndex + 5 } },
  					cursor,
  					React__default.createElement(
  						"defs",
  						null,
  						React__default.createElement(
  							"clipPath",
  							{ id: "chart-area-clip" },
  							React__default.createElement("rect", { x: "0", y: "0", width: dimensions.width, height: dimensions.height })
  						),
  						chartConfig.map(function (each, idx) {
  							return React__default.createElement(
  								"clipPath",
  								{ key: idx, id: "chart-area-clip-" + each.id },
  								React__default.createElement("rect", { x: "0", y: "0", width: each.width, height: each.height })
  							);
  						})
  					),
  					React__default.createElement(
  						"g",
  						{ transform: "translate(" + (margin.left + 0.5) + ", " + (margin.top + 0.5) + ")" },
  						React__default.createElement(EventCapture, {
  							ref: this.saveEventCaptureNode,
  							useCrossHairStyleCursor: cursorStyle,
  							mouseMove: mouseMoveEvent && interaction,
  							zoom: zoomEvent && interaction,
  							pan: panEvent && interaction,

  							width: dimensions.width,
  							height: dimensions.height,
  							chartConfig: chartConfig,
  							xScale: xScale,
  							xAccessor: xAccessor,
  							focus: defaultFocus,
  							disableInteraction: this.props.disableInteraction,

  							getAllPanConditions: this.getAllPanConditions,
  							onContextMenu: this.handleContextMenu,
  							onClick: this.handleClick,
  							onDoubleClick: this.handleDoubleClick,
  							onMouseDown: this.handleMouseDown,
  							onMouseMove: this.handleMouseMove,
  							onMouseEnter: this.handleMouseEnter,
  							onMouseLeave: this.handleMouseLeave,

  							onDragStart: this.handleDragStart,
  							onDrag: this.handleDrag,
  							onDragComplete: this.handleDragEnd,

  							onZoom: this.handleZoom,
  							onPinchZoom: this.handlePinchZoom,
  							onPinchZoomEnd: this.handlePinchZoomEnd,
  							onPan: this.handlePan,
  							onPanEnd: this.handlePanEnd
  						}),
  						React__default.createElement(
  							"g",
  							{ className: "react-stockcharts-avoid-interaction" },
  							this.props.children
  						)
  					)
  				)
  			);
  		}
  	}]);

  	return ChartCanvas;
  }(React.Component);

  function isInteractionEnabled(xScale, xAccessor, data) {
  	var interaction = !isNaN(xScale(xAccessor(head(data)))) && isDefined(xScale.invert);
  	return interaction;
  }

  ChartCanvas.propTypes = {
  	width: PropTypes.number.isRequired,
  	height: PropTypes.number.isRequired,
  	margin: PropTypes.object,
  	ratio: PropTypes.number.isRequired,
  	// interval: PropTypes.oneOf(["D", "W", "M"]), // ,"m1", "m5", "m15", "W", "M"
  	type: PropTypes.oneOf(["svg", "hybrid"]),
  	pointsPerPxThreshold: PropTypes.number,
  	minPointsPerPxThreshold: PropTypes.number,
  	data: PropTypes.array.isRequired,
  	// initialDisplay: PropTypes.number,
  	xAccessor: PropTypes.func,
  	xExtents: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
  	zoomAnchor: PropTypes.func,

  	className: PropTypes.string,
  	seriesName: PropTypes.string.isRequired,
  	zIndex: PropTypes.number,
  	children: PropTypes.node.isRequired,
  	xScale: PropTypes.func.isRequired,
  	postCalculator: PropTypes.func,
  	flipXScale: PropTypes.bool,
  	useCrossHairStyleCursor: PropTypes.bool,
  	padding: PropTypes.oneOfType([PropTypes.number, PropTypes.shape({
  		left: PropTypes.number,
  		right: PropTypes.number
  	})]),
  	defaultFocus: PropTypes.bool,
  	zoomMultiplier: PropTypes.number,
  	onLoadMore: PropTypes.func,
  	displayXAccessor: function displayXAccessor(props, propName /* , componentName */) {
  		if (isNotDefined(props[propName])) {
  			console.warn("`displayXAccessor` is not defined," + " will use the value from `xAccessor` as `displayXAccessor`." + " This might be ok if you do not use a discontinuous scale" + " but if you do, provide a `displayXAccessor` prop to `ChartCanvas`");
  		} else if (typeof props[propName] !== "function") {
  			return new Error("displayXAccessor has to be a function");
  		}
  	},
  	mouseMoveEvent: PropTypes.bool,
  	panEvent: PropTypes.bool,
  	clamp: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.func]),
  	zoomEvent: PropTypes.bool,
  	onSelect: PropTypes.func,
  	maintainPointsPerPixelOnResize: PropTypes.bool,
  	disableInteraction: PropTypes.bool
  };

  ChartCanvas.defaultProps = {
  	margin: { top: 20, right: 30, bottom: 30, left: 80 },
  	type: "hybrid",
  	pointsPerPxThreshold: 2,
  	minPointsPerPxThreshold: 1 / 100,
  	className: "react-stockchart",
  	zIndex: 1,
  	xExtents: [min, max],
  	postCalculator: identity$4,
  	padding: 0,
  	xAccessor: identity$4,
  	flipXScale: false,
  	useCrossHairStyleCursor: true,
  	defaultFocus: true,
  	onLoadMore: noop,
  	onSelect: noop,
  	mouseMoveEvent: true,
  	panEvent: true,
  	zoomEvent: true,
  	zoomMultiplier: 1.1,
  	clamp: false,
  	zoomAnchor: mouseBasedZoomAnchor,
  	maintainPointsPerPixelOnResize: true,
  	// ratio: 2,
  	disableInteraction: false
  };

  ChartCanvas.childContextTypes = {
  	plotData: PropTypes.array,
  	fullData: PropTypes.array,
  	chartConfig: PropTypes.arrayOf(PropTypes.shape({
  		id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  		origin: PropTypes.arrayOf(PropTypes.number).isRequired,
  		padding: PropTypes.oneOfType([PropTypes.number, PropTypes.shape({
  			top: PropTypes.number,
  			bottom: PropTypes.number
  		})]),
  		yExtents: PropTypes.arrayOf(PropTypes.func),
  		yExtentsProvider: PropTypes.func,
  		yScale: PropTypes.func.isRequired,
  		mouseCoordinates: PropTypes.shape({
  			at: PropTypes.string,
  			format: PropTypes.func
  		}),
  		width: PropTypes.number.isRequired,
  		height: PropTypes.number.isRequired
  	})).isRequired,
  	xScale: PropTypes.func.isRequired,
  	xAccessor: PropTypes.func.isRequired,
  	displayXAccessor: PropTypes.func.isRequired,
  	width: PropTypes.number.isRequired,
  	height: PropTypes.number.isRequired,
  	chartCanvasType: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
  	margin: PropTypes.object.isRequired,
  	ratio: PropTypes.number.isRequired,
  	getCanvasContexts: PropTypes.func,
  	xAxisZoom: PropTypes.func,
  	yAxisZoom: PropTypes.func,
  	amIOnTop: PropTypes.func,
  	redraw: PropTypes.func,
  	subscribe: PropTypes.func,
  	unsubscribe: PropTypes.func,
  	setCursorClass: PropTypes.func,
  	generateSubscriptionId: PropTypes.func,
  	getMutableState: PropTypes.func
  };

  ChartCanvas.ohlcv = function (d) {
  	return { date: d.date, open: d.open, high: d.high, low: d.low, close: d.close, volume: d.volume };
  };

  var _extends$4 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  var _createClass$5 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$5(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$5(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$5(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var aliases = {
  	mouseleave: "mousemove", // to draw interactive after mouse exit
  	panend: "pan",
  	pinchzoom: "pan",
  	mousedown: "mousemove",
  	click: "mousemove",
  	contextmenu: "mousemove",
  	dblclick: "mousemove",
  	dragstart: "drag",
  	dragend: "drag",
  	dragcancel: "drag"
  };

  var GenericComponent = function (_Component) {
  	_inherits$5(GenericComponent, _Component);

  	function GenericComponent(props, context) {
  		_classCallCheck$5(this, GenericComponent);

  		var _this = _possibleConstructorReturn$5(this, (GenericComponent.__proto__ || Object.getPrototypeOf(GenericComponent)).call(this, props, context));

  		_this.drawOnCanvas = _this.drawOnCanvas.bind(_this);
  		_this.getMoreProps = _this.getMoreProps.bind(_this);
  		_this.listener = _this.listener.bind(_this);
  		_this.draw = _this.draw.bind(_this);
  		_this.updateMoreProps = _this.updateMoreProps.bind(_this);
  		_this.evaluateType = _this.evaluateType.bind(_this);
  		_this.isHover = _this.isHover.bind(_this);
  		_this.preCanvasDraw = _this.preCanvasDraw.bind(_this);
  		_this.postCanvasDraw = _this.postCanvasDraw.bind(_this);
  		_this.getPanConditions = _this.getPanConditions.bind(_this);
  		_this.shouldTypeProceed = _this.shouldTypeProceed.bind(_this);
  		_this.preEvaluate = _this.preEvaluate.bind(_this);

  		var generateSubscriptionId = context.generateSubscriptionId;

  		_this.suscriberId = generateSubscriptionId();

  		_this.moreProps = {};

  		_this.state = {
  			updateCount: 0
  		};
  		return _this;
  	}

  	_createClass$5(GenericComponent, [{
  		key: "updateMoreProps",
  		value: function updateMoreProps(moreProps) {
  			var _this2 = this;

  			Object.keys(moreProps).forEach(function (key) {
  				_this2.moreProps[key] = moreProps[key];
  			});
  		}
  	}, {
  		key: "shouldTypeProceed",
  		value: function shouldTypeProceed() {
  			return true;
  		}
  	}, {
  		key: "preEvaluate",
  		value: function preEvaluate() {}
  	}, {
  		key: "listener",
  		value: function listener(type, moreProps, state, e) {
  			// console.log(e.shiftKey)
  			if (isDefined(moreProps)) {
  				this.updateMoreProps(moreProps);
  			}
  			this.evaluationInProgress = true;
  			this.evaluateType(type, e);
  			this.evaluationInProgress = false;
  		}
  	}, {
  		key: "evaluateType",
  		value: function evaluateType(type, e) {
  			var newType = aliases[type] || type;
  			var proceed = this.props.drawOn.indexOf(newType) > -1;

  			// console.log("type ->", type, proceed);

  			if (!proceed) return;
  			// const moreProps = this.getMoreProps();
  			this.preEvaluate(type, this.moreProps, e);
  			if (!this.shouldTypeProceed(type, this.moreProps)) return;

  			switch (type) {
  				case "zoom":
  				case "mouseenter":
  					// DO NOT DRAW FOR THESE EVENTS
  					break;
  				case "mouseleave":
  					{
  						this.moreProps.hovering = false;
  						var moreProps = this.getMoreProps();

  						if (this.props.onUnHover) {
  							this.props.onUnHover(moreProps, e);
  						}
  						break;
  					}
  				case "contextmenu":
  					{
  						if (this.props.onContextMenu) {
  							this.props.onContextMenu(this.getMoreProps(), e);
  						}
  						if (this.moreProps.hovering && this.props.onContextMenuWhenHover) {
  							this.props.onContextMenuWhenHover(this.getMoreProps(), e);
  						}
  						break;
  					}
  				case "mousedown":
  					{
  						if (this.props.onMouseDown) {
  							this.props.onMouseDown(this.getMoreProps(), e);
  						}
  						break;
  					}
  				case "click":
  					{
  						var _moreProps = this.getMoreProps();
  						if (this.moreProps.hovering) {
  							// console.error("TODO use this only for SAR, Line series")
  							this.props.onClickWhenHover(_moreProps, e);
  						} else {
  							this.props.onClickOutside(_moreProps, e);
  						}
  						if (this.props.onClick) {
  							this.props.onClick(_moreProps, e);
  						}
  						break;
  					}
  				case "mousemove":
  					{

  						var prevHover = this.moreProps.hovering;
  						this.moreProps.hovering = this.isHover(e);

  						var _context = this.context,
  						    amIOnTop = _context.amIOnTop,
  						    setCursorClass = _context.setCursorClass;


  						if (this.moreProps.hovering && !this.props.selected
  						/* && !prevHover */
  						&& amIOnTop(this.suscriberId) && isDefined(this.props.onHover)) {
  							setCursorClass("react-stockcharts-pointer-cursor");
  							this.iSetTheCursorClass = true;
  						} else if (this.moreProps.hovering && this.props.selected && amIOnTop(this.suscriberId)) {
  							setCursorClass(this.props.interactiveCursorClass);
  							this.iSetTheCursorClass = true;
  						} else if (prevHover && !this.moreProps.hovering && this.iSetTheCursorClass) {
  							this.iSetTheCursorClass = false;
  							setCursorClass(null);
  						}
  						var _moreProps2 = this.getMoreProps();

  						if (this.moreProps.hovering && !prevHover) {
  							if (this.props.onHover) {
  								this.props.onHover(_moreProps2, e);
  							}
  						}
  						if (prevHover && !this.moreProps.hovering) {
  							if (this.props.onUnHover) {
  								this.props.onUnHover(_moreProps2, e);
  							}
  						}

  						if (this.props.onMouseMove) {
  							this.props.onMouseMove(_moreProps2, e);
  						}
  						break;
  					}
  				case "dblclick":
  					{
  						var _moreProps3 = this.getMoreProps();

  						if (this.props.onDoubleClick) {
  							this.props.onDoubleClick(_moreProps3, e);
  						}
  						if (this.moreProps.hovering && this.props.onDoubleClickWhenHover) {
  							this.props.onDoubleClickWhenHover(_moreProps3, e);
  						}
  						break;
  					}
  				case "pan":
  					{
  						this.moreProps.hovering = false;
  						if (this.props.onPan) {
  							this.props.onPan(this.getMoreProps(), e);
  						}
  						break;
  					}
  				case "panend":
  					{
  						if (this.props.onPanEnd) {
  							this.props.onPanEnd(this.getMoreProps(), e);
  						}
  						break;
  					}
  				case "dragstart":
  					{
  						if (this.getPanConditions().draggable) {
  							var _amIOnTop = this.context.amIOnTop;

  							if (_amIOnTop(this.suscriberId)) {
  								this.dragInProgress = true;
  								this.props.onDragStart(this.getMoreProps(), e);
  							}
  						}
  						this.someDragInProgress = true;
  						break;
  					}
  				case "drag":
  					{
  						if (this.dragInProgress && this.props.onDrag) {
  							this.props.onDrag(this.getMoreProps(), e);
  						}
  						break;
  					}
  				case "dragend":
  					{
  						if (this.dragInProgress && this.props.onDragComplete) {
  							this.props.onDragComplete(this.getMoreProps(), e);
  						}
  						this.dragInProgress = false;
  						this.someDragInProgress = false;
  						break;
  					}
  				case "dragcancel":
  					{
  						if (this.dragInProgress || this.iSetTheCursorClass) {
  							var _setCursorClass = this.context.setCursorClass;

  							_setCursorClass(null);
  						}
  						break;
  					}
  			}
  		}
  	}, {
  		key: "isHover",
  		value: function isHover(e) {
  			return isDefined(this.props.isHover) ? this.props.isHover(this.getMoreProps(), e) : false;
  		}
  	}, {
  		key: "getPanConditions",
  		value: function getPanConditions() {
  			var draggable = !!(this.props.selected && this.moreProps.hovering) || this.props.enableDragOnHover && this.moreProps.hovering;

  			return {
  				draggable: draggable,
  				panEnabled: !this.props.disablePan
  			};
  		}
  	}, {
  		key: "draw",
  		value: function draw() {
  			var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { force: false },
  			    trigger = _ref.trigger,
  			    force = _ref.force;

  			var type = aliases[trigger] || trigger;
  			var proceed = this.props.drawOn.indexOf(type) > -1;

  			if (proceed || this.props.selected /* this is to draw as soon as you select */
  			|| force) {
  				var chartCanvasType = this.context.chartCanvasType;
  				var canvasDraw = this.props.canvasDraw;


  				if (isNotDefined(canvasDraw) || chartCanvasType === "svg") {
  					var updateCount = this.state.updateCount;

  					this.setState({
  						updateCount: updateCount + 1
  					});
  				} else {
  					this.drawOnCanvas();
  				}
  			}
  		}
  	}, {
  		key: "componentWillMount",
  		value: function componentWillMount() {
  			var _context2 = this.context,
  			    subscribe = _context2.subscribe,
  			    chartId = _context2.chartId;
  			var _props = this.props,
  			    clip = _props.clip,
  			    edgeClip = _props.edgeClip;


  			subscribe(this.suscriberId, {
  				chartId: chartId, clip: clip, edgeClip: edgeClip,
  				listener: this.listener,
  				draw: this.draw,
  				getPanConditions: this.getPanConditions
  			});
  			this.componentWillReceiveProps(this.props, this.context);
  		}
  	}, {
  		key: "componentWillUnmount",
  		value: function componentWillUnmount() {
  			var unsubscribe = this.context.unsubscribe;

  			unsubscribe(this.suscriberId);
  			if (this.iSetTheCursorClass) {
  				var setCursorClass = this.context.setCursorClass;

  				setCursorClass(null);
  			}
  		}
  	}, {
  		key: "componentDidMount",
  		value: function componentDidMount() {
  			this.componentDidUpdate(this.props);
  		}
  	}, {
  		key: "componentDidUpdate",
  		value: function componentDidUpdate(prevProps) {
  			var chartCanvasType = this.context.chartCanvasType;
  			var _props2 = this.props,
  			    canvasDraw = _props2.canvasDraw,
  			    selected = _props2.selected,
  			    interactiveCursorClass = _props2.interactiveCursorClass;


  			if (prevProps.selected !== selected) {
  				var setCursorClass = this.context.setCursorClass;

  				if (selected && this.moreProps.hovering) {
  					this.iSetTheCursorClass = true;
  					setCursorClass(interactiveCursorClass);
  				} else {
  					this.iSetTheCursorClass = false;
  					setCursorClass(null);
  				}
  			}
  			if (isDefined(canvasDraw) && !this.evaluationInProgress
  			// && !(this.someDragInProgress && this.props.selected)
  			/*
     prevent double draw of interactive elements
     during dragging / hover / click etc.
     */
  			&& chartCanvasType !== "svg") {

  				this.updateMoreProps(this.moreProps);
  				this.drawOnCanvas();
  			}
  		}
  	}, {
  		key: "componentWillReceiveProps",
  		value: function componentWillReceiveProps(nextProps, nextContext) {
  			var xScale = nextContext.xScale,
  			    plotData = nextContext.plotData,
  			    chartConfig = nextContext.chartConfig,
  			    getMutableState = nextContext.getMutableState;


  			this.props.debug(nextContext);
  			this.moreProps = _extends$4({}, this.moreProps, getMutableState(), {
  				/*
      ^ this is so
      mouseXY, currentCharts, currentItem are available to
      newly created components like MouseHoverText which
      is created right after a new interactive object is drawn
      */
  				xScale: xScale, plotData: plotData, chartConfig: chartConfig
  			});
  		}
  	}, {
  		key: "getMoreProps",
  		value: function getMoreProps() {
  			var _context3 = this.context,
  			    xScale = _context3.xScale,
  			    plotData = _context3.plotData,
  			    chartConfig = _context3.chartConfig,
  			    morePropsDecorator = _context3.morePropsDecorator,
  			    xAccessor = _context3.xAccessor,
  			    displayXAccessor = _context3.displayXAccessor,
  			    width = _context3.width,
  			    height = _context3.height;
  			var _context4 = this.context,
  			    chartId = _context4.chartId,
  			    fullData = _context4.fullData;


  			var moreProps = _extends$4({
  				xScale: xScale, plotData: plotData, chartConfig: chartConfig,
  				xAccessor: xAccessor, displayXAccessor: displayXAccessor,
  				width: width, height: height,
  				chartId: chartId,
  				fullData: fullData
  			}, this.moreProps);

  			return (morePropsDecorator || identity$4)(moreProps);
  		}
  	}, {
  		key: "preCanvasDraw",
  		value: function preCanvasDraw() {
  			// do nothing
  		}
  	}, {
  		key: "postCanvasDraw",
  		value: function postCanvasDraw() {}
  	}, {
  		key: "drawOnCanvas",
  		value: function drawOnCanvas() {
  			var _props3 = this.props,
  			    canvasDraw = _props3.canvasDraw,
  			    canvasToDraw = _props3.canvasToDraw;
  			var getCanvasContexts = this.context.getCanvasContexts;


  			var moreProps = this.getMoreProps();

  			var ctx = canvasToDraw(getCanvasContexts());

  			this.preCanvasDraw(ctx, moreProps);
  			canvasDraw(ctx, moreProps);
  			this.postCanvasDraw(ctx, moreProps);
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var _context5 = this.context,
  			    chartCanvasType = _context5.chartCanvasType,
  			    chartId = _context5.chartId;
  			var _props4 = this.props,
  			    canvasDraw = _props4.canvasDraw,
  			    clip = _props4.clip,
  			    svgDraw = _props4.svgDraw;


  			if (isDefined(canvasDraw) && chartCanvasType !== "svg") {
  				return null;
  			}

  			var suffix = isDefined(chartId) ? "-" + chartId : "";

  			var style = clip ? { "clipPath": "url(#chart-area-clip" + suffix + ")" } : null;

  			return React__default.createElement(
  				"g",
  				{ style: style },
  				svgDraw(this.getMoreProps())
  			);
  		}
  	}]);

  	return GenericComponent;
  }(React.Component);

  GenericComponent.propTypes = {
  	svgDraw: PropTypes.func.isRequired,
  	canvasDraw: PropTypes.func,

  	drawOn: PropTypes.array.isRequired,

  	clip: PropTypes.bool.isRequired,
  	edgeClip: PropTypes.bool.isRequired,
  	interactiveCursorClass: PropTypes.string,

  	selected: PropTypes.bool.isRequired,
  	enableDragOnHover: PropTypes.bool.isRequired,
  	disablePan: PropTypes.bool.isRequired,

  	canvasToDraw: PropTypes.func.isRequired,

  	isHover: PropTypes.func,

  	onClick: PropTypes.func,
  	onClickWhenHover: PropTypes.func,
  	onClickOutside: PropTypes.func,

  	onPan: PropTypes.func,
  	onPanEnd: PropTypes.func,
  	onDragStart: PropTypes.func,
  	onDrag: PropTypes.func,
  	onDragComplete: PropTypes.func,
  	onDoubleClick: PropTypes.func,
  	onDoubleClickWhenHover: PropTypes.func,
  	onContextMenu: PropTypes.func,
  	onContextMenuWhenHover: PropTypes.func,
  	onMouseMove: PropTypes.func,
  	onMouseDown: PropTypes.func,
  	onHover: PropTypes.func,
  	onUnHover: PropTypes.func,

  	debug: PropTypes.func
  	// owner: PropTypes.string.isRequired,
  };

  GenericComponent.defaultProps = {
  	svgDraw: functor(null),
  	draw: [],
  	canvasToDraw: function canvasToDraw(contexts) {
  		return contexts.mouseCoord;
  	},
  	clip: true,
  	edgeClip: false,
  	selected: false,
  	disablePan: false,
  	enableDragOnHover: false,

  	onClickWhenHover: noop,
  	onClickOutside: noop,
  	onDragStart: noop,
  	onMouseMove: noop,
  	onMouseDown: noop,
  	debug: noop
  };

  GenericComponent.contextTypes = {
  	width: PropTypes.number.isRequired,
  	height: PropTypes.number.isRequired,
  	margin: PropTypes.object.isRequired,
  	chartId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  	getCanvasContexts: PropTypes.func,

  	chartCanvasType: PropTypes.string,
  	xScale: PropTypes.func.isRequired,
  	xAccessor: PropTypes.func.isRequired,
  	displayXAccessor: PropTypes.func.isRequired,
  	plotData: PropTypes.array.isRequired,
  	fullData: PropTypes.array.isRequired,

  	chartConfig: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,

  	morePropsDecorator: PropTypes.func,
  	generateSubscriptionId: PropTypes.func,
  	getMutableState: PropTypes.func.isRequired,

  	amIOnTop: PropTypes.func.isRequired,
  	subscribe: PropTypes.func.isRequired,
  	unsubscribe: PropTypes.func.isRequired,
  	setCursorClass: PropTypes.func.isRequired
  };

  function getAxisCanvas(contexts) {
  	return contexts.axes;
  }

  function getMouseCanvas(contexts) {
  	return contexts.mouseCoord;
  }

  var _extends$5 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  var _slicedToArray$8 = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _createClass$6 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  function _classCallCheck$6(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$6(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$6(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var ALWAYS_TRUE_TYPES = ["drag", "dragend"];

  var GenericChartComponent = function (_GenericComponent) {
  	_inherits$6(GenericChartComponent, _GenericComponent);

  	function GenericChartComponent(props, context) {
  		_classCallCheck$6(this, GenericChartComponent);

  		var _this = _possibleConstructorReturn$6(this, (GenericChartComponent.__proto__ || Object.getPrototypeOf(GenericChartComponent)).call(this, props, context));

  		_this.preCanvasDraw = _this.preCanvasDraw.bind(_this);
  		_this.postCanvasDraw = _this.postCanvasDraw.bind(_this);
  		_this.shouldTypeProceed = _this.shouldTypeProceed.bind(_this);
  		_this.preEvaluate = _this.preEvaluate.bind(_this);
  		return _this;
  	}

  	_createClass$6(GenericChartComponent, [{
  		key: "preCanvasDraw",
  		value: function preCanvasDraw(ctx, moreProps) {
  			_get(GenericChartComponent.prototype.__proto__ || Object.getPrototypeOf(GenericChartComponent.prototype), "preCanvasDraw", this).call(this, ctx, moreProps);
  			ctx.save();
  			var _context = this.context,
  			    margin = _context.margin,
  			    ratio = _context.ratio;
  			var chartConfig = moreProps.chartConfig;


  			var canvasOriginX = 0.5 * ratio + chartConfig.origin[0] + margin.left;
  			var canvasOriginY = 0.5 * ratio + chartConfig.origin[1] + margin.top;

  			var _moreProps$chartConfi = moreProps.chartConfig,
  			    width = _moreProps$chartConfi.width,
  			    height = _moreProps$chartConfi.height;
  			var _props = this.props,
  			    clip = _props.clip,
  			    edgeClip = _props.edgeClip;


  			ctx.setTransform(1, 0, 0, 1, 0, 0);
  			ctx.scale(ratio, ratio);
  			if (edgeClip) {
  				ctx.beginPath();
  				ctx.rect(-1, canvasOriginY - 10, width + margin.left + margin.right + 1, height + 20);
  				ctx.clip();
  			}

  			ctx.translate(canvasOriginX, canvasOriginY);

  			if (clip) {
  				ctx.beginPath();
  				ctx.rect(-1, -1, width + 1, height + 1);
  				ctx.clip();
  			}
  		}
  	}, {
  		key: "postCanvasDraw",
  		value: function postCanvasDraw(ctx, moreProps) {
  			_get(GenericChartComponent.prototype.__proto__ || Object.getPrototypeOf(GenericChartComponent.prototype), "postCanvasDraw", this).call(this, ctx, moreProps);
  			ctx.restore();
  		}
  	}, {
  		key: "updateMoreProps",
  		value: function updateMoreProps(moreProps) {
  			_get(GenericChartComponent.prototype.__proto__ || Object.getPrototypeOf(GenericChartComponent.prototype), "updateMoreProps", this).call(this, moreProps);
  			var chartConfigList = moreProps.chartConfig;


  			if (chartConfigList && Array.isArray(chartConfigList)) {
  				var chartId = this.context.chartId;

  				var chartConfig = find(chartConfigList, function (each) {
  					return each.id === chartId;
  				});
  				this.moreProps.chartConfig = chartConfig;
  			}
  			if (isDefined(this.moreProps.chartConfig)) {
  				var _moreProps$chartConfi2 = _slicedToArray$8(this.moreProps.chartConfig.origin, 2),
  				    ox = _moreProps$chartConfi2[0],
  				    oy = _moreProps$chartConfi2[1];

  				if (isDefined(moreProps.mouseXY)) {
  					var _moreProps$mouseXY = _slicedToArray$8(moreProps.mouseXY, 2),
  					    x = _moreProps$mouseXY[0],
  					    y = _moreProps$mouseXY[1];

  					this.moreProps.mouseXY = [x - ox, y - oy];
  				}
  				if (isDefined(moreProps.startPos)) {
  					var _moreProps$startPos = _slicedToArray$8(moreProps.startPos, 2),
  					    _x = _moreProps$startPos[0],
  					    _y = _moreProps$startPos[1];

  					this.moreProps.startPos = [_x - ox, _y - oy];
  				}
  			}
  		}
  	}, {
  		key: "preEvaluate",
  		value: function preEvaluate() /* type, moreProps */{
  			/* if (
     	type === "mousemove"
     	&& this.props.onMouseMove
     	&& isDefined(moreProps)
     	&& isDefined(moreProps.currentCharts)
     ) {
     	if (moreProps.currentCharts.indexOf(this.context.chartId) === -1) {
     		moreProps.show = false;
     	}
     } */
  		}
  	}, {
  		key: "shouldTypeProceed",
  		value: function shouldTypeProceed(type, moreProps) {
  			if ((type === "mousemove" || type === "click") && this.props.disablePan) {
  				return true;
  			}
  			if (ALWAYS_TRUE_TYPES.indexOf(type) === -1 && isDefined(moreProps) && isDefined(moreProps.currentCharts)) {
  				return moreProps.currentCharts.indexOf(this.context.chartId) > -1;
  			}
  			return true;
  		}
  	}]);

  	return GenericChartComponent;
  }(GenericComponent);

  GenericChartComponent.propTypes = GenericComponent.propTypes;

  GenericChartComponent.defaultProps = GenericComponent.defaultProps;

  GenericChartComponent.contextTypes = _extends$5({}, GenericComponent.contextTypes, {
  	canvasOriginX: PropTypes.number,
  	canvasOriginY: PropTypes.number,
  	chartId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  	chartConfig: PropTypes.object.isRequired,
  	ratio: PropTypes.number.isRequired
  });

  var _createClass$7 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$7(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$7(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$7(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var BackgroundText = function (_PureComponent) {
  	_inherits$7(BackgroundText, _PureComponent);

  	function BackgroundText() {
  		_classCallCheck$7(this, BackgroundText);

  		return _possibleConstructorReturn$7(this, (BackgroundText.__proto__ || Object.getPrototypeOf(BackgroundText)).apply(this, arguments));
  	}

  	_createClass$7(BackgroundText, [{
  		key: "componentDidMount",
  		value: function componentDidMount() {
  			if (this.context.chartCanvasType !== "svg" && isDefined(this.context.getCanvasContexts)) {
  				var contexts = this.context.getCanvasContexts();
  				if (contexts) BackgroundText.drawOnCanvas(contexts.bg, this.props, this.context, this.props.children);
  			}
  		}
  	}, {
  		key: "componentDidUpdate",
  		value: function componentDidUpdate() {
  			this.componentDidMount();
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var chartCanvasType = this.context.chartCanvasType;


  			if (chartCanvasType !== "svg") return null;

  			var _props = this.props,
  			    x = _props.x,
  			    y = _props.y,
  			    fill = _props.fill,
  			    opacity = _props.opacity,
  			    stroke = _props.stroke,
  			    strokeOpacity = _props.strokeOpacity,
  			    fontFamily = _props.fontFamily,
  			    fontSize = _props.fontSize,
  			    textAnchor = _props.textAnchor;

  			var props = { x: x, y: y, fill: fill, opacity: opacity, stroke: stroke, strokeOpacity: strokeOpacity, fontFamily: fontFamily, fontSize: fontSize, textAnchor: textAnchor };
  			return React__default.createElement(
  				"text",
  				props,
  				"this.props.children(interval)"
  			);
  		}
  	}]);

  	return BackgroundText;
  }(PureComponent);

  BackgroundText.drawOnCanvas = function (ctx, props, _ref, getText) {
  	var interval = _ref.interval;

  	ctx.clearRect(-1, -1, ctx.canvas.width + 2, ctx.canvas.height + 2);
  	ctx.save();

  	ctx.setTransform(1, 0, 0, 1, 0, 0);
  	ctx.translate(0.5, 0.5);

  	var x = props.x,
  	    y = props.y,
  	    fill = props.fill,
  	    opacity = props.opacity,
  	    stroke = props.stroke,
  	    strokeOpacity = props.strokeOpacity,
  	    fontFamily = props.fontFamily,
  	    fontSize = props.fontSize,
  	    textAnchor = props.textAnchor;


  	var text = getText(interval);

  	ctx.strokeStyle = hexToRGBA(stroke, strokeOpacity);

  	ctx.font = fontSize + "px " + fontFamily;
  	ctx.fillStyle = hexToRGBA(fill, opacity);
  	ctx.textAlign = textAnchor === "middle" ? "center" : textAnchor;

  	if (stroke !== "none") ctx.strokeText(text, x, y);
  	ctx.fillText(text, x, y);

  	ctx.restore();
  };

  BackgroundText.propTypes = {
  	x: PropTypes.number.isRequired,
  	y: PropTypes.number.isRequired,
  	fontFamily: PropTypes.string,
  	fontSize: PropTypes.number.isRequired,
  	fill: PropTypes.string,
  	stroke: PropTypes.string,
  	opacity: PropTypes.number,
  	strokeOpacity: PropTypes.number,
  	textAnchor: PropTypes.string,
  	children: PropTypes.func
  };

  BackgroundText.defaultProps = {
  	opacity: 0.3,
  	fill: "#9E7523",
  	stroke: "#9E7523",
  	strokeOpacity: 1,
  	fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
  	fontSize: 12,
  	textAnchor: "middle"
  };

  BackgroundText.contextTypes = {
  	interval: PropTypes.string.isRequired,
  	getCanvasContexts: PropTypes.func,
  	chartCanvasType: PropTypes.string
  };

  var pi = Math.PI,
      tau = 2 * pi,
      epsilon = 1e-6,
      tauEpsilon = tau - epsilon;

  function Path() {
    this._x0 = this._y0 = // start of current subpath
    this._x1 = this._y1 = null; // end of current subpath
    this._ = "";
  }

  function path$1() {
    return new Path;
  }

  Path.prototype = path$1.prototype = {
    constructor: Path,
    moveTo: function(x, y) {
      this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y);
    },
    closePath: function() {
      if (this._x1 !== null) {
        this._x1 = this._x0, this._y1 = this._y0;
        this._ += "Z";
      }
    },
    lineTo: function(x, y) {
      this._ += "L" + (this._x1 = +x) + "," + (this._y1 = +y);
    },
    quadraticCurveTo: function(x1, y1, x, y) {
      this._ += "Q" + (+x1) + "," + (+y1) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
    },
    bezierCurveTo: function(x1, y1, x2, y2, x, y) {
      this._ += "C" + (+x1) + "," + (+y1) + "," + (+x2) + "," + (+y2) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
    },
    arcTo: function(x1, y1, x2, y2, r) {
      x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
      var x0 = this._x1,
          y0 = this._y1,
          x21 = x2 - x1,
          y21 = y2 - y1,
          x01 = x0 - x1,
          y01 = y0 - y1,
          l01_2 = x01 * x01 + y01 * y01;

      // Is the radius negative? Error.
      if (r < 0) throw new Error("negative radius: " + r);

      // Is this path empty? Move to (x1,y1).
      if (this._x1 === null) {
        this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
      }

      // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
      else if (!(l01_2 > epsilon)) ;

      // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
      // Equivalently, is (x1,y1) coincident with (x2,y2)?
      // Or, is the radius zero? Line to (x1,y1).
      else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
        this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
      }

      // Otherwise, draw an arc!
      else {
        var x20 = x2 - x0,
            y20 = y2 - y0,
            l21_2 = x21 * x21 + y21 * y21,
            l20_2 = x20 * x20 + y20 * y20,
            l21 = Math.sqrt(l21_2),
            l01 = Math.sqrt(l01_2),
            l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
            t01 = l / l01,
            t21 = l / l21;

        // If the start tangent is not coincident with (x0,y0), line to.
        if (Math.abs(t01 - 1) > epsilon) {
          this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
        }

        this._ += "A" + r + "," + r + ",0,0," + (+(y01 * x20 > x01 * y20)) + "," + (this._x1 = x1 + t21 * x21) + "," + (this._y1 = y1 + t21 * y21);
      }
    },
    arc: function(x, y, r, a0, a1, ccw) {
      x = +x, y = +y, r = +r;
      var dx = r * Math.cos(a0),
          dy = r * Math.sin(a0),
          x0 = x + dx,
          y0 = y + dy,
          cw = 1 ^ ccw,
          da = ccw ? a0 - a1 : a1 - a0;

      // Is the radius negative? Error.
      if (r < 0) throw new Error("negative radius: " + r);

      // Is this path empty? Move to (x0,y0).
      if (this._x1 === null) {
        this._ += "M" + x0 + "," + y0;
      }

      // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
      else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) {
        this._ += "L" + x0 + "," + y0;
      }

      // Is this arc empty? We’re done.
      if (!r) return;

      // Does the angle go the wrong way? Flip the direction.
      if (da < 0) da = da % tau + tau;

      // Is this a complete circle? Draw two arcs to complete the circle.
      if (da > tauEpsilon) {
        this._ += "A" + r + "," + r + ",0,1," + cw + "," + (x - dx) + "," + (y - dy) + "A" + r + "," + r + ",0,1," + cw + "," + (this._x1 = x0) + "," + (this._y1 = y0);
      }

      // Is this arc non-empty? Draw an arc!
      else if (da > epsilon) {
        this._ += "A" + r + "," + r + ",0," + (+(da >= pi)) + "," + cw + "," + (this._x1 = x + r * Math.cos(a1)) + "," + (this._y1 = y + r * Math.sin(a1));
      }
    },
    rect: function(x, y, w, h) {
      this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y) + "h" + (+w) + "v" + (+h) + "h" + (-w) + "Z";
    },
    toString: function() {
      return this._;
    }
  };

  var _slicedToArray$9 = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _createClass$8 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$8(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$8(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$8(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var ZoomButtons = function (_Component) {
  	_inherits$8(ZoomButtons, _Component);

  	function ZoomButtons(props) {
  		_classCallCheck$8(this, ZoomButtons);

  		var _this = _possibleConstructorReturn$8(this, (ZoomButtons.__proto__ || Object.getPrototypeOf(ZoomButtons)).call(this, props));

  		_this.handleZoomOut = _this.handleZoomOut.bind(_this);
  		_this.handleZoomIn = _this.handleZoomIn.bind(_this);
  		_this.zoom = _this.zoom.bind(_this);
  		return _this;
  	}

  	_createClass$8(ZoomButtons, [{
  		key: "zoom",
  		value: function zoom$$1(direction) {
  			var _this2 = this;

  			var _context = this.context,
  			    xAxisZoom = _context.xAxisZoom,
  			    xScale = _context.xScale,
  			    plotData = _context.plotData,
  			    xAccessor = _context.xAccessor;

  			var cx = xScale(xAccessor(last(plotData)));
  			// mean(xScale.range());
  			var zoomMultiplier = this.props.zoomMultiplier;


  			var c = direction > 0 ? 1 * zoomMultiplier : 1 / zoomMultiplier;

  			var _xScale$domain = xScale.domain(),
  			    _xScale$domain2 = _slicedToArray$9(_xScale$domain, 2),
  			    start = _xScale$domain2[0],
  			    end = _xScale$domain2[1];

  			var _xScale$range$map$map = xScale.range().map(function (x) {
  				return cx + (x - cx) * c;
  			}).map(xScale.invert),
  			    _xScale$range$map$map2 = _slicedToArray$9(_xScale$range$map$map, 2),
  			    newStart = _xScale$range$map$map2[0],
  			    newEnd = _xScale$range$map$map2[1];

  			var left = number$1(start, newStart);
  			var right = number$1(end, newEnd);

  			var foo = [0.25, 0.3, 0.5, 0.6, 0.75, 1].map(function (i) {
  				return [left(i), right(i)];
  			});

  			this.interval = setInterval(function () {
  				xAxisZoom(foo.shift());
  				if (foo.length === 0) {
  					clearInterval(_this2.interval);
  					delete _this2.interval;
  				}
  			}, 10);
  		}
  	}, {
  		key: "handleZoomOut",
  		value: function handleZoomOut() {
  			if (this.interval) return;
  			this.zoom(1);
  		}
  	}, {
  		key: "handleZoomIn",
  		value: function handleZoomIn() {
  			if (this.interval) return;
  			this.zoom(-1);
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var chartConfig = this.context.chartConfig;
  			var width = chartConfig.width,
  			    height = chartConfig.height;
  			var _props = this.props,
  			    size = _props.size,
  			    heightFromBase = _props.heightFromBase,
  			    rx = _props.rx,
  			    ry = _props.ry;
  			var _props2 = this.props,
  			    stroke = _props2.stroke,
  			    strokeOpacity = _props2.strokeOpacity,
  			    fill = _props2.fill,
  			    strokeWidth = _props2.strokeWidth,
  			    fillOpacity = _props2.fillOpacity;
  			var _props3 = this.props,
  			    textFill = _props3.textFill,
  			    textStrokeWidth = _props3.textStrokeWidth;
  			var onReset = this.props.onReset;

  			var centerX = Math.round(width / 2);
  			var y = height - heightFromBase;

  			var _size = _slicedToArray$9(size, 2),
  			    w = _size[0],
  			    h = _size[1];

  			var hLength = 5;
  			var wLength = 6;

  			var textY = Math.round(y + h / 2);

  			var resetX = centerX;

  			var zoomOut = path$1();
  			var zoomOutX = centerX - w - 2 * strokeWidth;
  			zoomOut.moveTo(zoomOutX - wLength, textY);
  			zoomOut.lineTo(zoomOutX + wLength, textY);
  			zoomOut.closePath();

  			var zoomIn = path$1();
  			var zoomInX = centerX + w + 2 * strokeWidth;

  			zoomIn.moveTo(zoomInX - wLength, textY);
  			zoomIn.lineTo(zoomInX + wLength, textY);

  			zoomIn.moveTo(zoomInX, textY - hLength);
  			zoomIn.lineTo(zoomInX, textY + hLength);
  			// zoomIn.closePath();

  			return React__default.createElement(
  				"g",
  				{ className: "react-stockcharts-zoom-button" },
  				React__default.createElement("rect", {
  					x: zoomOutX - w / 2,
  					y: y,
  					rx: rx,
  					ry: ry,
  					height: h,
  					width: w,
  					fill: fill,
  					fillOpacity: fillOpacity,
  					stroke: stroke,
  					strokeOpacity: strokeOpacity,
  					strokeWidth: strokeWidth
  				}),
  				React__default.createElement("path", { d: zoomOut.toString(),
  					stroke: textFill,
  					strokeWidth: textStrokeWidth
  				}),
  				React__default.createElement("rect", {
  					x: resetX - w / 2,
  					y: y,
  					rx: rx,
  					ry: ry,
  					height: h,
  					width: w,
  					fill: fill,
  					fillOpacity: fillOpacity,
  					stroke: stroke,
  					strokeOpacity: strokeOpacity,
  					strokeWidth: strokeWidth
  				}),
  				React__default.createElement(
  					"g",
  					{ transform: "translate (" + resetX + ", " + (y + h / 4) + ") scale(.14)" },
  					React__default.createElement("path", { d: "M31 13C23.4 5.3 12.8.5 1.1.5c-23.3 0-42.3 19-42.3 42.5s18.9 42.5 42.3 42.5c13.8 0 26-6.6 33.7-16.9l-16.5-1.8C13.5 70.4 7.5 72.5 1 72.5c-16.2 0-29.3-13.2-29.3-29.4S-15.2 13.7 1 13.7c8.1 0 15.4 3.3 20.7 8.6l-10.9 11h32.5V.5L31 13z",
  						fill: textFill
  					})
  				),
  				React__default.createElement("rect", {
  					x: zoomInX - w / 2,
  					y: y,
  					rx: rx,
  					ry: ry,
  					height: h,
  					width: w,
  					fill: fill,
  					fillOpacity: fillOpacity,
  					stroke: stroke,
  					strokeOpacity: strokeOpacity,
  					strokeWidth: strokeWidth
  				}),
  				React__default.createElement("path", { d: zoomIn.toString(),
  					stroke: textFill,
  					strokeWidth: textStrokeWidth
  				}),
  				React__default.createElement("rect", { className: "react-stockcharts-enable-interaction out",
  					onClick: this.handleZoomOut,
  					x: zoomOutX - w / 2,
  					y: y,
  					rx: rx,
  					ry: ry,
  					height: h,
  					width: w,
  					fill: "none"
  				}),
  				React__default.createElement("rect", { className: "react-stockcharts-enable-interaction reset",
  					onClick: onReset,
  					x: resetX - w / 2,
  					y: y,
  					rx: rx,
  					ry: ry,
  					height: h,
  					width: w,
  					fill: "none"
  				}),
  				React__default.createElement("rect", { className: "react-stockcharts-enable-interaction in",
  					onClick: this.handleZoomIn,
  					x: zoomInX - w / 2,
  					y: y,
  					rx: rx,
  					ry: ry,
  					height: h,
  					width: w,
  					fill: "none"
  				})
  			);
  		}
  	}]);

  	return ZoomButtons;
  }(React.Component);

  ZoomButtons.propTypes = {
  	zoomMultiplier: PropTypes.number.isRequired,
  	size: PropTypes.array.isRequired,
  	heightFromBase: PropTypes.number.isRequired,
  	rx: PropTypes.number.isRequired,
  	ry: PropTypes.number.isRequired,
  	stroke: PropTypes.string.isRequired,
  	strokeWidth: PropTypes.number.isRequired,
  	strokeOpacity: PropTypes.number.isRequired,
  	fill: PropTypes.string.isRequired,
  	fillOpacity: PropTypes.number.isRequired,
  	fontSize: PropTypes.number.isRequired,
  	textDy: PropTypes.string.isRequired,
  	textFill: PropTypes.string.isRequired,
  	textStrokeWidth: PropTypes.number.isRequired,
  	onReset: PropTypes.func
  };

  ZoomButtons.defaultProps = {
  	size: [30, 24],
  	heightFromBase: 50,
  	rx: 3,
  	ry: 3,
  	stroke: "#000000",
  	strokeOpacity: 0.3,
  	strokeWidth: 1,
  	fill: "#D6D6D6",
  	fillOpacity: 0.4,
  	fontSize: 16,
  	textDy: ".3em",
  	textFill: "#000000",
  	textStrokeWidth: 2,
  	zoomMultiplier: 1.5,
  	onReset: noop
  };

  ZoomButtons.contextTypes = {
  	xScale: PropTypes.func.isRequired,
  	chartConfig: PropTypes.object.isRequired,
  	plotData: PropTypes.array.isRequired,
  	xAccessor: PropTypes.func.isRequired,
  	xAxisZoom: PropTypes.func.isRequired
  };

  var version = "0.7.6";

  /*
  // chart types & Series
var series = require("./lib/series");
var scale = require("./lib/scale");
var coordinates = require("./lib/coordinates");
var indicator = require("./lib/indicator");
var algorithm = require("./lib/algorithm");
var annotation = require("./lib/annotation");
var axes = require("./lib/axes");
var tooltip = require("./lib/tooltip");
var helper = require("./lib/helper");
var interactive = require("./lib/interactive");
var utils = require("./lib/utils");

  */

  var ReactStockcharts = /*#__PURE__*/Object.freeze({
    version: version,
    ChartCanvas: ChartCanvas,
    Chart: Chart,
    GenericChartComponent: GenericChartComponent,
    GenericComponent: GenericComponent,
    BackgroundText: BackgroundText,
    ZoomButtons: ZoomButtons
  });

  function constant$4(x) {
    return function() {
      return x;
    };
  }

  function jiggle() {
    return (Math.random() - 0.5) * 1e-6;
  }

  function tree_add(d) {
    var x = +this._x.call(null, d),
        y = +this._y.call(null, d);
    return add(this.cover(x, y), x, y, d);
  }

  function add(tree, x, y, d) {
    if (isNaN(x) || isNaN(y)) return tree; // ignore invalid points

    var parent,
        node = tree._root,
        leaf = {data: d},
        x0 = tree._x0,
        y0 = tree._y0,
        x1 = tree._x1,
        y1 = tree._y1,
        xm,
        ym,
        xp,
        yp,
        right,
        bottom,
        i,
        j;

    // If the tree is empty, initialize the root as a leaf.
    if (!node) return tree._root = leaf, tree;

    // Find the existing leaf for the new point, or add it.
    while (node.length) {
      if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
      if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
      if (parent = node, !(node = node[i = bottom << 1 | right])) return parent[i] = leaf, tree;
    }

    // Is the new point is exactly coincident with the existing point?
    xp = +tree._x.call(null, node.data);
    yp = +tree._y.call(null, node.data);
    if (x === xp && y === yp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;

    // Otherwise, split the leaf node until the old and new point are separated.
    do {
      parent = parent ? parent[i] = new Array(4) : tree._root = new Array(4);
      if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
      if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
    } while ((i = bottom << 1 | right) === (j = (yp >= ym) << 1 | (xp >= xm)));
    return parent[j] = node, parent[i] = leaf, tree;
  }

  function addAll(data) {
    var d, i, n = data.length,
        x,
        y,
        xz = new Array(n),
        yz = new Array(n),
        x0 = Infinity,
        y0 = Infinity,
        x1 = -Infinity,
        y1 = -Infinity;

    // Compute the points and their extent.
    for (i = 0; i < n; ++i) {
      if (isNaN(x = +this._x.call(null, d = data[i])) || isNaN(y = +this._y.call(null, d))) continue;
      xz[i] = x;
      yz[i] = y;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }

    // If there were no (valid) points, inherit the existing extent.
    if (x1 < x0) x0 = this._x0, x1 = this._x1;
    if (y1 < y0) y0 = this._y0, y1 = this._y1;

    // Expand the tree to cover the new points.
    this.cover(x0, y0).cover(x1, y1);

    // Add the new points.
    for (i = 0; i < n; ++i) {
      add(this, xz[i], yz[i], data[i]);
    }

    return this;
  }

  function tree_cover(x, y) {
    if (isNaN(x = +x) || isNaN(y = +y)) return this; // ignore invalid points

    var x0 = this._x0,
        y0 = this._y0,
        x1 = this._x1,
        y1 = this._y1;

    // If the quadtree has no extent, initialize them.
    // Integer extent are necessary so that if we later double the extent,
    // the existing quadrant boundaries don’t change due to floating point error!
    if (isNaN(x0)) {
      x1 = (x0 = Math.floor(x)) + 1;
      y1 = (y0 = Math.floor(y)) + 1;
    }

    // Otherwise, double repeatedly to cover.
    else if (x0 > x || x > x1 || y0 > y || y > y1) {
      var z = x1 - x0,
          node = this._root,
          parent,
          i;

      switch (i = (y < (y0 + y1) / 2) << 1 | (x < (x0 + x1) / 2)) {
        case 0: {
          do parent = new Array(4), parent[i] = node, node = parent;
          while (z *= 2, x1 = x0 + z, y1 = y0 + z, x > x1 || y > y1);
          break;
        }
        case 1: {
          do parent = new Array(4), parent[i] = node, node = parent;
          while (z *= 2, x0 = x1 - z, y1 = y0 + z, x0 > x || y > y1);
          break;
        }
        case 2: {
          do parent = new Array(4), parent[i] = node, node = parent;
          while (z *= 2, x1 = x0 + z, y0 = y1 - z, x > x1 || y0 > y);
          break;
        }
        case 3: {
          do parent = new Array(4), parent[i] = node, node = parent;
          while (z *= 2, x0 = x1 - z, y0 = y1 - z, x0 > x || y0 > y);
          break;
        }
      }

      if (this._root && this._root.length) this._root = node;
    }

    // If the quadtree covers the point already, just return.
    else return this;

    this._x0 = x0;
    this._y0 = y0;
    this._x1 = x1;
    this._y1 = y1;
    return this;
  }

  function tree_data() {
    var data = [];
    this.visit(function(node) {
      if (!node.length) do data.push(node.data); while (node = node.next)
    });
    return data;
  }

  function tree_extent(_) {
    return arguments.length
        ? this.cover(+_[0][0], +_[0][1]).cover(+_[1][0], +_[1][1])
        : isNaN(this._x0) ? undefined : [[this._x0, this._y0], [this._x1, this._y1]];
  }

  function Quad(node, x0, y0, x1, y1) {
    this.node = node;
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
  }

  function tree_find(x, y, radius) {
    var data,
        x0 = this._x0,
        y0 = this._y0,
        x1,
        y1,
        x2,
        y2,
        x3 = this._x1,
        y3 = this._y1,
        quads = [],
        node = this._root,
        q,
        i;

    if (node) quads.push(new Quad(node, x0, y0, x3, y3));
    if (radius == null) radius = Infinity;
    else {
      x0 = x - radius, y0 = y - radius;
      x3 = x + radius, y3 = y + radius;
      radius *= radius;
    }

    while (q = quads.pop()) {

      // Stop searching if this quadrant can’t contain a closer node.
      if (!(node = q.node)
          || (x1 = q.x0) > x3
          || (y1 = q.y0) > y3
          || (x2 = q.x1) < x0
          || (y2 = q.y1) < y0) continue;

      // Bisect the current quadrant.
      if (node.length) {
        var xm = (x1 + x2) / 2,
            ym = (y1 + y2) / 2;

        quads.push(
          new Quad(node[3], xm, ym, x2, y2),
          new Quad(node[2], x1, ym, xm, y2),
          new Quad(node[1], xm, y1, x2, ym),
          new Quad(node[0], x1, y1, xm, ym)
        );

        // Visit the closest quadrant first.
        if (i = (y >= ym) << 1 | (x >= xm)) {
          q = quads[quads.length - 1];
          quads[quads.length - 1] = quads[quads.length - 1 - i];
          quads[quads.length - 1 - i] = q;
        }
      }

      // Visit this point. (Visiting coincident points isn’t necessary!)
      else {
        var dx = x - +this._x.call(null, node.data),
            dy = y - +this._y.call(null, node.data),
            d2 = dx * dx + dy * dy;
        if (d2 < radius) {
          var d = Math.sqrt(radius = d2);
          x0 = x - d, y0 = y - d;
          x3 = x + d, y3 = y + d;
          data = node.data;
        }
      }
    }

    return data;
  }

  function tree_remove(d) {
    if (isNaN(x = +this._x.call(null, d)) || isNaN(y = +this._y.call(null, d))) return this; // ignore invalid points

    var parent,
        node = this._root,
        retainer,
        previous,
        next,
        x0 = this._x0,
        y0 = this._y0,
        x1 = this._x1,
        y1 = this._y1,
        x,
        y,
        xm,
        ym,
        right,
        bottom,
        i,
        j;

    // If the tree is empty, initialize the root as a leaf.
    if (!node) return this;

    // Find the leaf node for the point.
    // While descending, also retain the deepest parent with a non-removed sibling.
    if (node.length) while (true) {
      if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
      if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
      if (!(parent = node, node = node[i = bottom << 1 | right])) return this;
      if (!node.length) break;
      if (parent[(i + 1) & 3] || parent[(i + 2) & 3] || parent[(i + 3) & 3]) retainer = parent, j = i;
    }

    // Find the point to remove.
    while (node.data !== d) if (!(previous = node, node = node.next)) return this;
    if (next = node.next) delete node.next;

    // If there are multiple coincident points, remove just the point.
    if (previous) return (next ? previous.next = next : delete previous.next), this;

    // If this is the root point, remove it.
    if (!parent) return this._root = next, this;

    // Remove this leaf.
    next ? parent[i] = next : delete parent[i];

    // If the parent now contains exactly one leaf, collapse superfluous parents.
    if ((node = parent[0] || parent[1] || parent[2] || parent[3])
        && node === (parent[3] || parent[2] || parent[1] || parent[0])
        && !node.length) {
      if (retainer) retainer[j] = node;
      else this._root = node;
    }

    return this;
  }

  function removeAll(data) {
    for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
    return this;
  }

  function tree_root() {
    return this._root;
  }

  function tree_size() {
    var size = 0;
    this.visit(function(node) {
      if (!node.length) do ++size; while (node = node.next)
    });
    return size;
  }

  function tree_visit(callback) {
    var quads = [], q, node = this._root, child, x0, y0, x1, y1;
    if (node) quads.push(new Quad(node, this._x0, this._y0, this._x1, this._y1));
    while (q = quads.pop()) {
      if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1) && node.length) {
        var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
        if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
        if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
        if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
        if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
      }
    }
    return this;
  }

  function tree_visitAfter(callback) {
    var quads = [], next = [], q;
    if (this._root) quads.push(new Quad(this._root, this._x0, this._y0, this._x1, this._y1));
    while (q = quads.pop()) {
      var node = q.node;
      if (node.length) {
        var child, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
        if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
        if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
        if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
        if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
      }
      next.push(q);
    }
    while (q = next.pop()) {
      callback(q.node, q.x0, q.y0, q.x1, q.y1);
    }
    return this;
  }

  function defaultX(d) {
    return d[0];
  }

  function tree_x(_) {
    return arguments.length ? (this._x = _, this) : this._x;
  }

  function defaultY(d) {
    return d[1];
  }

  function tree_y(_) {
    return arguments.length ? (this._y = _, this) : this._y;
  }

  function quadtree(nodes, x, y) {
    var tree = new Quadtree(x == null ? defaultX : x, y == null ? defaultY : y, NaN, NaN, NaN, NaN);
    return nodes == null ? tree : tree.addAll(nodes);
  }

  function Quadtree(x, y, x0, y0, x1, y1) {
    this._x = x;
    this._y = y;
    this._x0 = x0;
    this._y0 = y0;
    this._x1 = x1;
    this._y1 = y1;
    this._root = undefined;
  }

  function leaf_copy(leaf) {
    var copy = {data: leaf.data}, next = copy;
    while (leaf = leaf.next) next = next.next = {data: leaf.data};
    return copy;
  }

  var treeProto = quadtree.prototype = Quadtree.prototype;

  treeProto.copy = function() {
    var copy = new Quadtree(this._x, this._y, this._x0, this._y0, this._x1, this._y1),
        node = this._root,
        nodes,
        child;

    if (!node) return copy;

    if (!node.length) return copy._root = leaf_copy(node), copy;

    nodes = [{source: node, target: copy._root = new Array(4)}];
    while (node = nodes.pop()) {
      for (var i = 0; i < 4; ++i) {
        if (child = node.source[i]) {
          if (child.length) nodes.push({source: child, target: node.target[i] = new Array(4)});
          else node.target[i] = leaf_copy(child);
        }
      }
    }

    return copy;
  };

  treeProto.add = tree_add;
  treeProto.addAll = addAll;
  treeProto.cover = tree_cover;
  treeProto.data = tree_data;
  treeProto.extent = tree_extent;
  treeProto.find = tree_find;
  treeProto.remove = tree_remove;
  treeProto.removeAll = removeAll;
  treeProto.root = tree_root;
  treeProto.size = tree_size;
  treeProto.visit = tree_visit;
  treeProto.visitAfter = tree_visitAfter;
  treeProto.x = tree_x;
  treeProto.y = tree_y;

  function x(d) {
    return d.x + d.vx;
  }

  function y(d) {
    return d.y + d.vy;
  }

  function forceCollide(radius) {
    var nodes,
        radii,
        strength = 1,
        iterations = 1;

    if (typeof radius !== "function") radius = constant$4(radius == null ? 1 : +radius);

    function force() {
      var i, n = nodes.length,
          tree,
          node,
          xi,
          yi,
          ri,
          ri2;

      for (var k = 0; k < iterations; ++k) {
        tree = quadtree(nodes, x, y).visitAfter(prepare);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          ri = radii[node.index], ri2 = ri * ri;
          xi = node.x + node.vx;
          yi = node.y + node.vy;
          tree.visit(apply);
        }
      }

      function apply(quad, x0, y0, x1, y1) {
        var data = quad.data, rj = quad.r, r = ri + rj;
        if (data) {
          if (data.index > node.index) {
            var x = xi - data.x - data.vx,
                y = yi - data.y - data.vy,
                l = x * x + y * y;
            if (l < r * r) {
              if (x === 0) x = jiggle(), l += x * x;
              if (y === 0) y = jiggle(), l += y * y;
              l = (r - (l = Math.sqrt(l))) / l * strength;
              node.vx += (x *= l) * (r = (rj *= rj) / (ri2 + rj));
              node.vy += (y *= l) * r;
              data.vx -= x * (r = 1 - r);
              data.vy -= y * r;
            }
          }
          return;
        }
        return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r;
      }
    }

    function prepare(quad) {
      if (quad.data) return quad.r = radii[quad.data.index];
      for (var i = quad.r = 0; i < 4; ++i) {
        if (quad[i] && quad[i].r > quad.r) {
          quad.r = quad[i].r;
        }
      }
    }

    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length, node;
      radii = new Array(n);
      for (i = 0; i < n; ++i) node = nodes[i], radii[node.index] = +radius(node, i, nodes);
    }

    force.initialize = function(_) {
      nodes = _;
      initialize();
    };

    force.iterations = function(_) {
      return arguments.length ? (iterations = +_, force) : iterations;
    };

    force.strength = function(_) {
      return arguments.length ? (strength = +_, force) : strength;
    };

    force.radius = function(_) {
      return arguments.length ? (radius = typeof _ === "function" ? _ : constant$4(+_), initialize(), force) : radius;
    };

    return force;
  }

  var noop$1 = {value: function() {}};

  function dispatch() {
    for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
      if (!(t = arguments[i] + "") || (t in _)) throw new Error("illegal type: " + t);
      _[t] = [];
    }
    return new Dispatch(_);
  }

  function Dispatch(_) {
    this._ = _;
  }

  function parseTypenames$1(typenames, types) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
      return {type: t, name: name};
    });
  }

  Dispatch.prototype = dispatch.prototype = {
    constructor: Dispatch,
    on: function(typename, callback) {
      var _ = this._,
          T = parseTypenames$1(typename + "", _),
          t,
          i = -1,
          n = T.length;

      // If no callback was specified, return the callback of the given type and name.
      if (arguments.length < 2) {
        while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
        return;
      }

      // If a type was specified, set the callback for the given type and name.
      // Otherwise, if a null callback was specified, remove callbacks of the given name.
      if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
      while (++i < n) {
        if (t = (typename = T[i]).type) _[t] = set$1(_[t], typename.name, callback);
        else if (callback == null) for (t in _) _[t] = set$1(_[t], typename.name, null);
      }

      return this;
    },
    copy: function() {
      var copy = {}, _ = this._;
      for (var t in _) copy[t] = _[t].slice();
      return new Dispatch(copy);
    },
    call: function(type, that) {
      if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    },
    apply: function(type, that, args) {
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    }
  };

  function get(type, name) {
    for (var i = 0, n = type.length, c; i < n; ++i) {
      if ((c = type[i]).name === name) {
        return c.value;
      }
    }
  }

  function set$1(type, name, callback) {
    for (var i = 0, n = type.length; i < n; ++i) {
      if (type[i].name === name) {
        type[i] = noop$1, type = type.slice(0, i).concat(type.slice(i + 1));
        break;
      }
    }
    if (callback != null) type.push({name: name, value: callback});
    return type;
  }

  var frame = 0, // is an animation frame pending?
      timeout = 0, // is a timeout pending?
      interval = 0, // are any timers active?
      pokeDelay = 1000, // how frequently we check for clock skew
      taskHead,
      taskTail,
      clockLast = 0,
      clockNow = 0,
      clockSkew = 0,
      clock = typeof performance === "object" && performance.now ? performance : Date,
      setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

  function now() {
    return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
  }

  function clearNow() {
    clockNow = 0;
  }

  function Timer() {
    this._call =
    this._time =
    this._next = null;
  }

  Timer.prototype = timer.prototype = {
    constructor: Timer,
    restart: function(callback, delay, time) {
      if (typeof callback !== "function") throw new TypeError("callback is not a function");
      time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
      if (!this._next && taskTail !== this) {
        if (taskTail) taskTail._next = this;
        else taskHead = this;
        taskTail = this;
      }
      this._call = callback;
      this._time = time;
      sleep();
    },
    stop: function() {
      if (this._call) {
        this._call = null;
        this._time = Infinity;
        sleep();
      }
    }
  };

  function timer(callback, delay, time) {
    var t = new Timer;
    t.restart(callback, delay, time);
    return t;
  }

  function timerFlush() {
    now(); // Get the current time, if not already set.
    ++frame; // Pretend we’ve set an alarm, if we haven’t already.
    var t = taskHead, e;
    while (t) {
      if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
      t = t._next;
    }
    --frame;
  }

  function wake() {
    clockNow = (clockLast = clock.now()) + clockSkew;
    frame = timeout = 0;
    try {
      timerFlush();
    } finally {
      frame = 0;
      nap();
      clockNow = 0;
    }
  }

  function poke() {
    var now = clock.now(), delay = now - clockLast;
    if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
  }

  function nap() {
    var t0, t1 = taskHead, t2, time = Infinity;
    while (t1) {
      if (t1._call) {
        if (time > t1._time) time = t1._time;
        t0 = t1, t1 = t1._next;
      } else {
        t2 = t1._next, t1._next = null;
        t1 = t0 ? t0._next = t2 : taskHead = t2;
      }
    }
    taskTail = t0;
    sleep(time);
  }

  function sleep(time) {
    if (frame) return; // Soonest alarm already set, or will be.
    if (timeout) timeout = clearTimeout(timeout);
    var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
    if (delay > 24) {
      if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
      if (interval) interval = clearInterval(interval);
    } else {
      if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
      frame = 1, setFrame(wake);
    }
  }

  var initialRadius = 10,
      initialAngle = Math.PI * (3 - Math.sqrt(5));

  function forceSimulation(nodes) {
    var simulation,
        alpha = 1,
        alphaMin = 0.001,
        alphaDecay = 1 - Math.pow(alphaMin, 1 / 300),
        alphaTarget = 0,
        velocityDecay = 0.6,
        forces = map$1(),
        stepper = timer(step),
        event = dispatch("tick", "end");

    if (nodes == null) nodes = [];

    function step() {
      tick();
      event.call("tick", simulation);
      if (alpha < alphaMin) {
        stepper.stop();
        event.call("end", simulation);
      }
    }

    function tick() {
      var i, n = nodes.length, node;

      alpha += (alphaTarget - alpha) * alphaDecay;

      forces.each(function(force) {
        force(alpha);
      });

      for (i = 0; i < n; ++i) {
        node = nodes[i];
        if (node.fx == null) node.x += node.vx *= velocityDecay;
        else node.x = node.fx, node.vx = 0;
        if (node.fy == null) node.y += node.vy *= velocityDecay;
        else node.y = node.fy, node.vy = 0;
      }
    }

    function initializeNodes() {
      for (var i = 0, n = nodes.length, node; i < n; ++i) {
        node = nodes[i], node.index = i;
        if (isNaN(node.x) || isNaN(node.y)) {
          var radius = initialRadius * Math.sqrt(i), angle = i * initialAngle;
          node.x = radius * Math.cos(angle);
          node.y = radius * Math.sin(angle);
        }
        if (isNaN(node.vx) || isNaN(node.vy)) {
          node.vx = node.vy = 0;
        }
      }
    }

    function initializeForce(force) {
      if (force.initialize) force.initialize(nodes);
      return force;
    }

    initializeNodes();

    return simulation = {
      tick: tick,

      restart: function() {
        return stepper.restart(step), simulation;
      },

      stop: function() {
        return stepper.stop(), simulation;
      },

      nodes: function(_) {
        return arguments.length ? (nodes = _, initializeNodes(), forces.each(initializeForce), simulation) : nodes;
      },

      alpha: function(_) {
        return arguments.length ? (alpha = +_, simulation) : alpha;
      },

      alphaMin: function(_) {
        return arguments.length ? (alphaMin = +_, simulation) : alphaMin;
      },

      alphaDecay: function(_) {
        return arguments.length ? (alphaDecay = +_, simulation) : +alphaDecay;
      },

      alphaTarget: function(_) {
        return arguments.length ? (alphaTarget = +_, simulation) : alphaTarget;
      },

      velocityDecay: function(_) {
        return arguments.length ? (velocityDecay = 1 - _, simulation) : 1 - velocityDecay;
      },

      force: function(name, _) {
        return arguments.length > 1 ? ((_ == null ? forces.remove(name) : forces.set(name, initializeForce(_))), simulation) : forces.get(name);
      },

      find: function(x, y, radius) {
        var i = 0,
            n = nodes.length,
            dx,
            dy,
            d2,
            node,
            closest;

        if (radius == null) radius = Infinity;
        else radius *= radius;

        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dx = x - node.x;
          dy = y - node.y;
          d2 = dx * dx + dy * dy;
          if (d2 < radius) closest = node, radius = d2;
        }

        return closest;
      },

      on: function(name, _) {
        return arguments.length > 1 ? (event.on(name, _), simulation) : event.on(name);
      }
    };
  }

  function forceX(x) {
    var strength = constant$4(0.1),
        nodes,
        strengths,
        xz;

    if (typeof x !== "function") x = constant$4(x == null ? 0 : +x);

    function force(alpha) {
      for (var i = 0, n = nodes.length, node; i < n; ++i) {
        node = nodes[i], node.vx += (xz[i] - node.x) * strengths[i] * alpha;
      }
    }

    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length;
      strengths = new Array(n);
      xz = new Array(n);
      for (i = 0; i < n; ++i) {
        strengths[i] = isNaN(xz[i] = +x(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes);
      }
    }

    force.initialize = function(_) {
      nodes = _;
      initialize();
    };

    force.strength = function(_) {
      return arguments.length ? (strength = typeof _ === "function" ? _ : constant$4(+_), initialize(), force) : strength;
    };

    force.x = function(_) {
      return arguments.length ? (x = typeof _ === "function" ? _ : constant$4(+_), initialize(), force) : x;
    };

    return force;
  }

  var _createClass$9 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$9(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$9(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$9(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var AxisZoomCapture = function (_Component) {
  	_inherits$9(AxisZoomCapture, _Component);

  	function AxisZoomCapture(props) {
  		_classCallCheck$9(this, AxisZoomCapture);

  		var _this = _possibleConstructorReturn$9(this, (AxisZoomCapture.__proto__ || Object.getPrototypeOf(AxisZoomCapture)).call(this, props));

  		_this.handleDragStartMouse = _this.handleDragStartMouse.bind(_this);
  		_this.handleDragStartTouch = _this.handleDragStartTouch.bind(_this);
  		_this.handleDrag = _this.handleDrag.bind(_this);
  		_this.handleDragEnd = _this.handleDragEnd.bind(_this);
  		_this.handleRightClick = _this.handleRightClick.bind(_this);
  		_this.saveNode = _this.saveNode.bind(_this);
  		_this.state = {
  			startPosition: null
  		};
  		return _this;
  	}

  	_createClass$9(AxisZoomCapture, [{
  		key: "saveNode",
  		value: function saveNode(node) {
  			this.node = node;
  		}
  	}, {
  		key: "handleRightClick",
  		value: function handleRightClick(e) {
  			e.stopPropagation();
  			e.preventDefault();

  			var onContextMenu = this.props.onContextMenu;


  			var mouseXY = mousePosition(e, this.node.getBoundingClientRect());

  			select(d3Window(this.node)).on(MOUSEMOVE, null).on(MOUSEUP, null);
  			this.setState({
  				startPosition: null
  			});

  			onContextMenu(mouseXY, e);

  			this.contextMenuClicked = true;
  		}
  	}, {
  		key: "handleDragStartMouse",
  		value: function handleDragStartMouse(e) {
  			this.mouseInteraction = true;

  			var _props = this.props,
  			    getScale = _props.getScale,
  			    getMoreProps = _props.getMoreProps;

  			var startScale = getScale(getMoreProps());
  			this.dragHappened = false;

  			if (startScale.invert) {
  				select(d3Window(this.node)).on(MOUSEMOVE, this.handleDrag, false).on(MOUSEUP, this.handleDragEnd, false);

  				var startXY = mousePosition(e);

  				this.setState({
  					startPosition: {
  						startXY: startXY,
  						startScale: startScale
  					}
  				});
  			}
  			e.preventDefault();
  		}
  	}, {
  		key: "handleDragStartTouch",
  		value: function handleDragStartTouch(e) {
  			this.mouseInteraction = false;

  			var _props2 = this.props,
  			    getScale = _props2.getScale,
  			    getMoreProps = _props2.getMoreProps;

  			var startScale = getScale(getMoreProps());
  			this.dragHappened = false;

  			if (e.touches.length === 1 && startScale.invert) {
  				select(d3Window(this.node)).on(TOUCHMOVE, this.handleDrag).on(TOUCHEND, this.handleDragEnd);

  				var startXY = touchPosition(getTouchProps(e.touches[0]), e);

  				this.setState({
  					startPosition: {
  						startXY: startXY,
  						startScale: startScale
  					}
  				});
  			}
  		}
  	}, {
  		key: "handleDrag",
  		value: function handleDrag() {
  			var startPosition = this.state.startPosition;
  			var _props3 = this.props,
  			    getMouseDelta = _props3.getMouseDelta,
  			    inverted = _props3.inverted;


  			this.dragHappened = true;
  			if (isDefined(startPosition)) {
  				var startScale = startPosition.startScale;
  				var startXY = startPosition.startXY;


  				var mouseXY = this.mouseInteraction ? mouse(this.node) : touches(this.node)[0];

  				var diff = getMouseDelta(startXY, mouseXY);

  				var center = mean(startScale.range());

  				var tempRange = startScale.range().map(function (d) {
  					return inverted ? d - sign(d - center) * diff : d + sign(d - center) * diff;
  				});

  				var newDomain = tempRange.map(startScale.invert);

  				if (sign(last(startScale.range()) - first(startScale.range())) === sign(last(tempRange) - first(tempRange))) {
  					var axisZoomCallback = this.props.axisZoomCallback;
  					// console.log(startXScale.domain(), newXDomain)

  					axisZoomCallback(newDomain);
  				}
  			}
  		}
  	}, {
  		key: "handleDragEnd",
  		value: function handleDragEnd() {
  			var _this2 = this;

  			if (!this.dragHappened) {
  				if (this.clicked) {
  					var e = event;
  					var mouseXY = this.mouseInteraction ? mouse(this.node) : touches(this.node)[0];
  					var onDoubleClick = this.props.onDoubleClick;


  					onDoubleClick(mouseXY, e);
  				} else {
  					this.clicked = true;
  					setTimeout(function () {
  						_this2.clicked = false;
  					}, 300);
  				}
  			}

  			select(d3Window(this.node)).on(MOUSEMOVE, null).on(MOUSEUP, null).on(TOUCHMOVE, null).on(TOUCHEND, null);

  			this.setState({
  				startPosition: null
  			});
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var _props4 = this.props,
  			    bg = _props4.bg,
  			    zoomCursorClassName = _props4.zoomCursorClassName;


  			var cursor = isDefined(this.state.startPosition) ? zoomCursorClassName : "react-stockcharts-default-cursor";

  			return React__default.createElement("rect", {
  				className: "react-stockcharts-enable-interaction " + cursor,
  				ref: this.saveNode,
  				x: bg.x, y: bg.y, opacity: 0, height: bg.h, width: bg.w,
  				onContextMenu: this.handleRightClick,
  				onMouseDown: this.handleDragStartMouse,
  				onTouchStart: this.handleDragStartTouch
  			});
  		}
  	}]);

  	return AxisZoomCapture;
  }(React.Component);

  AxisZoomCapture.propTypes = {
  	innerTickSize: PropTypes.number,
  	outerTickSize: PropTypes.number,
  	tickFormat: PropTypes.func,
  	tickPadding: PropTypes.number,
  	tickSize: PropTypes.number,
  	ticks: PropTypes.number,
  	tickValues: PropTypes.array,
  	showDomain: PropTypes.bool,
  	showTicks: PropTypes.bool,
  	className: PropTypes.string,
  	axisZoomCallback: PropTypes.func,
  	inverted: PropTypes.bool,
  	bg: PropTypes.object.isRequired,
  	zoomCursorClassName: PropTypes.string.isRequired,
  	getMoreProps: PropTypes.func.isRequired,
  	getScale: PropTypes.func.isRequired,
  	getMouseDelta: PropTypes.func.isRequired,
  	onDoubleClick: PropTypes.func.isRequired,
  	onContextMenu: PropTypes.func.isRequired
  };

  AxisZoomCapture.defaultProps = {
  	onDoubleClick: noop,
  	onContextMenu: noop,
  	inverted: true
  };

  var _extends$6 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  var _slicedToArray$10 = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _createClass$10 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$10(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$10(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$10(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var Axis = function (_Component) {
  	_inherits$10(Axis, _Component);

  	function Axis(props) {
  		_classCallCheck$10(this, Axis);

  		var _this = _possibleConstructorReturn$10(this, (Axis.__proto__ || Object.getPrototypeOf(Axis)).call(this, props));

  		_this.renderSVG = _this.renderSVG.bind(_this);
  		_this.drawOnCanvas = _this.drawOnCanvas.bind(_this);
  		_this.saveNode = _this.saveNode.bind(_this);
  		_this.getMoreProps = _this.getMoreProps.bind(_this);
  		return _this;
  	}

  	_createClass$10(Axis, [{
  		key: "saveNode",
  		value: function saveNode(node) {
  			this.node = node;
  		}
  	}, {
  		key: "getMoreProps",
  		value: function getMoreProps() {
  			return this.node.getMoreProps();
  		}
  	}, {
  		key: "drawOnCanvas",
  		value: function drawOnCanvas(ctx, moreProps) {
  			var _props = this.props,
  			    showDomain = _props.showDomain,
  			    showTicks = _props.showTicks,
  			    transform = _props.transform,
  			    range$$1 = _props.range,
  			    getScale = _props.getScale;


  			ctx.save();
  			ctx.translate(transform[0], transform[1]);

  			if (showDomain) drawAxisLine(ctx, this.props, range$$1);
  			if (showTicks) {
  				var tickProps = tickHelper(this.props, getScale(moreProps));
  				drawTicks(ctx, tickProps);
  			}

  			ctx.restore();
  		}
  	}, {
  		key: "renderSVG",
  		value: function renderSVG(moreProps) {
  			var className = this.props.className;
  			var _props2 = this.props,
  			    showDomain = _props2.showDomain,
  			    showTicks = _props2.showTicks,
  			    range$$1 = _props2.range,
  			    getScale = _props2.getScale;


  			var ticks$$1 = showTicks ? axisTicksSVG(this.props, getScale(moreProps)) : null;
  			var domain = showDomain ? axisLineSVG(this.props, range$$1) : null;

  			return React__default.createElement(
  				"g",
  				{ className: className },
  				ticks$$1,
  				domain
  			);
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var _props3 = this.props,
  			    bg = _props3.bg,
  			    axisZoomCallback = _props3.axisZoomCallback,
  			    zoomCursorClassName = _props3.zoomCursorClassName,
  			    zoomEnabled = _props3.zoomEnabled,
  			    getScale = _props3.getScale,
  			    inverted = _props3.inverted;
  			var _props4 = this.props,
  			    transform = _props4.transform,
  			    getMouseDelta = _props4.getMouseDelta,
  			    edgeClip = _props4.edgeClip;
  			var _props5 = this.props,
  			    onContextMenu = _props5.onContextMenu,
  			    onDoubleClick = _props5.onDoubleClick;


  			var zoomCapture = zoomEnabled ? React__default.createElement(AxisZoomCapture, {
  				bg: bg,
  				getScale: getScale,
  				getMoreProps: this.getMoreProps,
  				getMouseDelta: getMouseDelta,
  				axisZoomCallback: axisZoomCallback,
  				zoomCursorClassName: zoomCursorClassName,
  				inverted: inverted,
  				onContextMenu: onContextMenu,
  				onDoubleClick: onDoubleClick
  			}) : null;

  			return React__default.createElement(
  				"g",
  				{ transform: "translate(" + transform[0] + ", " + transform[1] + ")" },
  				zoomCapture,
  				React__default.createElement(GenericChartComponent, { ref: this.saveNode,
  					canvasToDraw: getAxisCanvas,
  					clip: false,
  					edgeClip: edgeClip,
  					svgDraw: this.renderSVG,
  					canvasDraw: this.drawOnCanvas,
  					drawOn: ["pan"]
  				})
  			);
  		}
  	}]);

  	return Axis;
  }(React.Component);

  Axis.propTypes = {
  	innerTickSize: PropTypes.number,
  	outerTickSize: PropTypes.number,
  	tickFormat: PropTypes.func,
  	tickPadding: PropTypes.number,
  	tickSize: PropTypes.number,
  	ticks: PropTypes.number,
  	tickLabelFill: PropTypes.string,
  	tickStroke: PropTypes.string,
  	tickStrokeOpacity: PropTypes.number,
  	tickStrokeWidth: PropTypes.number,
  	tickStrokeDasharray: PropTypes.oneOf(strokeDashTypes),
  	tickValues: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
  	tickInterval: PropTypes.number,
  	tickIntervalFunction: PropTypes.func,
  	showDomain: PropTypes.bool,
  	showTicks: PropTypes.bool,
  	className: PropTypes.string,
  	axisZoomCallback: PropTypes.func,
  	zoomEnabled: PropTypes.bool,
  	inverted: PropTypes.bool,
  	zoomCursorClassName: PropTypes.string,
  	transform: PropTypes.arrayOf(PropTypes.number).isRequired,
  	range: PropTypes.arrayOf(PropTypes.number).isRequired,
  	getMouseDelta: PropTypes.func.isRequired,
  	getScale: PropTypes.func.isRequired,
  	bg: PropTypes.object.isRequired,
  	edgeClip: PropTypes.bool.isRequired,
  	onContextMenu: PropTypes.func,
  	onDoubleClick: PropTypes.func
  };

  Axis.defaultProps = {
  	zoomEnabled: false,
  	zoomCursorClassName: "",
  	edgeClip: false
  };

  function tickHelper(props, scale) {
  	var orient = props.orient,
  	    innerTickSize = props.innerTickSize,
  	    tickFormat = props.tickFormat,
  	    tickPadding = props.tickPadding,
  	    tickLabelFill = props.tickLabelFill,
  	    tickStrokeWidth = props.tickStrokeWidth,
  	    tickStrokeDasharray = props.tickStrokeDasharray,
  	    fontSize = props.fontSize,
  	    fontFamily = props.fontFamily,
  	    fontWeight = props.fontWeight,
  	    showTicks = props.showTicks,
  	    flexTicks = props.flexTicks,
  	    showTickLabel = props.showTickLabel;
  	var tickArguments = props.ticks,
  	    tickValuesProp = props.tickValues,
  	    tickStroke = props.tickStroke,
  	    tickStrokeOpacity = props.tickStrokeOpacity,
  	    tickInterval = props.tickInterval,
  	    tickIntervalFunction = props.tickIntervalFunction;

  	// if (tickArguments) tickArguments = [tickArguments];

  	var tickValues = void 0;
  	if (isDefined(tickValuesProp)) {
  		if (typeof tickValuesProp === "function") {
  			tickValues = tickValuesProp(scale.domain());
  		} else {
  			tickValues = tickValuesProp;
  		}
  	} else if (isDefined(tickInterval)) {
  		var _scale$domain = scale.domain(),
  		    _scale$domain2 = _slicedToArray$10(_scale$domain, 2),
  		    min$$1 = _scale$domain2[0],
  		    max$$1 = _scale$domain2[1];

  		var baseTickValues = sequence(min$$1, max$$1, (max$$1 - min$$1) / tickInterval);

  		tickValues = tickIntervalFunction ? tickIntervalFunction(min$$1, max$$1, tickInterval) : baseTickValues;
  	} else if (isDefined(scale.ticks)) {
  		tickValues = scale.ticks(tickArguments, flexTicks);
  	} else {
  		tickValues = scale.domain();
  	}

  	var baseFormat = scale.tickFormat ? scale.tickFormat(tickArguments) : identity$4;

  	var format = isNotDefined(tickFormat) ? baseFormat : function (d) {
  		return tickFormat(d) || "";
  	};

  	var sign$$1 = orient === "top" || orient === "left" ? -1 : 1;
  	var tickSpacing = Math.max(innerTickSize, 0) + tickPadding;

  	var ticks$$1 = void 0,
  	    dy = void 0,
  	    canvas_dy = void 0,
  	    textAnchor = void 0;

  	if (orient === "bottom" || orient === "top") {
  		dy = sign$$1 < 0 ? "0em" : ".71em";
  		canvas_dy = sign$$1 < 0 ? 0 : fontSize * .71;
  		textAnchor = "middle";

  		ticks$$1 = tickValues.map(function (d) {
  			var x = Math.round(scale(d));
  			return {
  				value: d,
  				x1: x,
  				y1: 0,
  				x2: x,
  				y2: sign$$1 * innerTickSize,
  				labelX: x,
  				labelY: sign$$1 * tickSpacing
  			};
  		});

  		if (showTicks && flexTicks) {
  			// console.log(ticks, showTicks);

  			var nodes = ticks$$1.map(function (d) {
  				return { id: d.value, value: d.value, fy: d.y2, origX: d.x1 };
  			});

  			var simulation = forceSimulation(nodes).force("x", forceX(function (d) {
  				return d.origX;
  			}).strength(1)).force("collide", forceCollide(22))
  			// .force("center", forceCenter())
  			.stop();

  			for (var i = 0; i < 100; ++i) {
  				simulation.tick();
  			} // console.log(nodes);

  			var zip$$1 = zipper().combine(function (a, b) {
  				if (Math.abs(b.x - b.origX) > 0.01) {
  					return _extends$6({}, a, {
  						x2: b.x,
  						labelX: b.x
  					});
  				}
  				return a;
  			});

  			ticks$$1 = zip$$1(ticks$$1, nodes);
  		}
  	} else {
  		ticks$$1 = tickValues.map(function (d) {
  			var y = Math.round(scale(d));
  			return {
  				value: d,
  				x1: 0,
  				y1: y,
  				x2: sign$$1 * innerTickSize,
  				y2: y,
  				labelX: sign$$1 * tickSpacing,
  				labelY: y
  			};
  		});

  		dy = ".32em";
  		canvas_dy = fontSize * .32;
  		textAnchor = sign$$1 < 0 ? "end" : "start";
  	}

  	return {
  		ticks: ticks$$1, scale: scale, tickStroke: tickStroke,
  		tickLabelFill: tickLabelFill || tickStroke,
  		tickStrokeOpacity: tickStrokeOpacity,
  		tickStrokeWidth: tickStrokeWidth,
  		tickStrokeDasharray: tickStrokeDasharray,
  		dy: dy,
  		canvas_dy: canvas_dy,
  		textAnchor: textAnchor,
  		fontSize: fontSize,
  		fontFamily: fontFamily,
  		fontWeight: fontWeight,
  		format: format,
  		showTickLabel: showTickLabel
  	};
  }

  /* eslint-disable react/prop-types */
  function axisLineSVG(props, range$$1) {
  	var orient = props.orient,
  	    outerTickSize = props.outerTickSize;
  	var domainClassName = props.domainClassName,
  	    fill = props.fill,
  	    stroke = props.stroke,
  	    strokeWidth = props.strokeWidth,
  	    opacity = props.opacity;


  	var sign$$1 = orient === "top" || orient === "left" ? -1 : 1;

  	var d = void 0;

  	if (orient === "bottom" || orient === "top") {
  		d = "M" + range$$1[0] + "," + sign$$1 * outerTickSize + "V0H" + range$$1[1] + "V" + sign$$1 * outerTickSize;
  	} else {
  		d = "M" + sign$$1 * outerTickSize + "," + range$$1[0] + "H0V" + range$$1[1] + "H" + sign$$1 * outerTickSize;
  	}

  	return React__default.createElement("path", {
  		className: domainClassName,
  		d: d,
  		fill: fill,
  		opacity: opacity,
  		stroke: stroke,
  		strokeWidth: strokeWidth });
  }
  /* eslint-enable react/prop-types */

  function drawAxisLine(ctx, props, range$$1) {
  	// props = { ...AxisLine.defaultProps, ...props };

  	var orient = props.orient,
  	    outerTickSize = props.outerTickSize,
  	    stroke = props.stroke,
  	    strokeWidth = props.strokeWidth,
  	    opacity = props.opacity;


  	var sign$$1 = orient === "top" || orient === "left" ? -1 : 1;
  	var xAxis = orient === "bottom" || orient === "top";

  	// var range = d3_scaleRange(xAxis ? xScale : yScale);

  	ctx.lineWidth = strokeWidth;
  	ctx.strokeStyle = hexToRGBA(stroke, opacity);

  	ctx.beginPath();

  	if (xAxis) {
  		ctx.moveTo(first(range$$1), sign$$1 * outerTickSize);
  		ctx.lineTo(first(range$$1), 0);
  		ctx.lineTo(last(range$$1), 0);
  		ctx.lineTo(last(range$$1), sign$$1 * outerTickSize);
  	} else {
  		ctx.moveTo(sign$$1 * outerTickSize, first(range$$1));
  		ctx.lineTo(0, first(range$$1));
  		ctx.lineTo(0, last(range$$1));
  		ctx.lineTo(sign$$1 * outerTickSize, last(range$$1));
  	}
  	ctx.stroke();
  }

  function Tick(props) {
  	var tickLabelFill = props.tickLabelFill,
  	    tickStroke = props.tickStroke,
  	    tickStrokeOpacity = props.tickStrokeOpacity,
  	    tickStrokeDasharray = props.tickStrokeDasharray,
  	    tickStrokeWidth = props.tickStrokeWidth,
  	    textAnchor = props.textAnchor,
  	    fontSize = props.fontSize,
  	    fontFamily = props.fontFamily,
  	    fontWeight = props.fontWeight;
  	var x1 = props.x1,
  	    y1 = props.y1,
  	    x2 = props.x2,
  	    y2 = props.y2,
  	    labelX = props.labelX,
  	    labelY = props.labelY,
  	    dy = props.dy;

  	return React__default.createElement(
  		"g",
  		{ className: "tick" },
  		React__default.createElement("line", {
  			shapeRendering: "crispEdges",
  			opacity: tickStrokeOpacity,
  			stroke: tickStroke,
  			strokeWidth: tickStrokeWidth,
  			strokeDasharray: getStrokeDasharray(tickStrokeDasharray),
  			x1: x1, y1: y1,
  			x2: x2, y2: y2 }),
  		React__default.createElement(
  			"text",
  			{
  				dy: dy, x: labelX, y: labelY,
  				fill: tickLabelFill,
  				fontSize: fontSize,
  				fontWeight: fontWeight,
  				fontFamily: fontFamily,
  				textAnchor: textAnchor },
  			props.children
  		)
  	);
  }

  Tick.propTypes = {
  	children: PropTypes.string.isRequired,
  	x1: PropTypes.number.isRequired,
  	y1: PropTypes.number.isRequired,
  	x2: PropTypes.number.isRequired,
  	y2: PropTypes.number.isRequired,
  	labelX: PropTypes.number.isRequired,
  	labelY: PropTypes.number.isRequired,
  	dy: PropTypes.string.isRequired,
  	tickStroke: PropTypes.string,
  	tickLabelFill: PropTypes.string,
  	tickStrokeWidth: PropTypes.number,
  	tickStrokeOpacity: PropTypes.number,
  	tickStrokeDasharray: PropTypes.oneOf(strokeDashTypes),
  	textAnchor: PropTypes.string,
  	fontSize: PropTypes.number,
  	fontFamily: PropTypes.string,
  	fontWeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  };

  function axisTicksSVG(props, scale) {
  	var result = tickHelper(props, scale);

  	var tickLabelFill = result.tickLabelFill,
  	    tickStroke = result.tickStroke,
  	    tickStrokeOpacity = result.tickStrokeOpacity,
  	    tickStrokeWidth = result.tickStrokeWidth,
  	    tickStrokeDasharray = result.tickStrokeDasharray,
  	    textAnchor = result.textAnchor;
  	var fontSize = result.fontSize,
  	    fontFamily = result.fontFamily,
  	    fontWeight = result.fontWeight,
  	    ticks$$1 = result.ticks,
  	    format = result.format;
  	var dy = result.dy;


  	return React__default.createElement(
  		"g",
  		null,
  		ticks$$1.map(function (tick, idx) {
  			return React__default.createElement(
  				Tick,
  				{ key: idx,
  					tickStroke: tickStroke,
  					tickLabelFill: tickLabelFill,
  					tickStrokeWidth: tickStrokeWidth,
  					tickStrokeOpacity: tickStrokeOpacity,
  					tickStrokeDasharray: tickStrokeDasharray,
  					dy: dy,
  					x1: tick.x1, y1: tick.y1,
  					x2: tick.x2, y2: tick.y2,
  					labelX: tick.labelX, labelY: tick.labelY,
  					textAnchor: textAnchor,
  					fontSize: fontSize,
  					fontWeight: fontWeight,
  					fontFamily: fontFamily },
  				format(tick.value)
  			);
  		})
  	);
  }

  function drawTicks(ctx, result) {
  	var tickStroke = result.tickStroke,
  	    tickStrokeOpacity = result.tickStrokeOpacity,
  	    tickLabelFill = result.tickLabelFill;
  	var textAnchor = result.textAnchor,
  	    fontSize = result.fontSize,
  	    fontFamily = result.fontFamily,
  	    fontWeight = result.fontWeight,
  	    ticks$$1 = result.ticks,
  	    showTickLabel = result.showTickLabel;


  	ctx.strokeStyle = hexToRGBA(tickStroke, tickStrokeOpacity);

  	ctx.fillStyle = tickStroke;
  	// ctx.textBaseline = 'middle';

  	ticks$$1.forEach(function (tick) {
  		drawEachTick(ctx, tick, result);
  	});

  	ctx.font = fontWeight + " " + fontSize + "px " + fontFamily;
  	ctx.fillStyle = tickLabelFill;
  	ctx.textAlign = textAnchor === "middle" ? "center" : textAnchor;

  	if (showTickLabel) {
  		ticks$$1.forEach(function (tick) {
  			drawEachTickLabel(ctx, tick, result);
  		});
  	}
  }

  function drawEachTick(ctx, tick, result) {
  	var tickStrokeWidth = result.tickStrokeWidth,
  	    tickStrokeDasharray = result.tickStrokeDasharray;


  	ctx.beginPath();

  	ctx.moveTo(tick.x1, tick.y1);
  	ctx.lineTo(tick.x2, tick.y2);
  	ctx.lineWidth = tickStrokeWidth;
  	ctx.setLineDash(getStrokeDasharray(tickStrokeDasharray).split(","));
  	ctx.stroke();
  }

  function drawEachTickLabel(ctx, tick, result) {
  	var canvas_dy = result.canvas_dy,
  	    format = result.format;


  	ctx.beginPath();
  	ctx.fillText(format(tick.value), tick.labelX, tick.labelY + canvas_dy);
  }

  var _extends$7 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  var _createClass$11 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$11(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$11(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$11(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var XAxis = function (_Component) {
  	_inherits$11(XAxis, _Component);

  	function XAxis(props, context) {
  		_classCallCheck$11(this, XAxis);

  		var _this = _possibleConstructorReturn$11(this, (XAxis.__proto__ || Object.getPrototypeOf(XAxis)).call(this, props, context));

  		_this.axisZoomCallback = _this.axisZoomCallback.bind(_this);
  		return _this;
  	}

  	_createClass$11(XAxis, [{
  		key: "axisZoomCallback",
  		value: function axisZoomCallback(newXDomain) {
  			var xAxisZoom = this.context.xAxisZoom;

  			xAxisZoom(newXDomain);
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var showTicks = this.props.showTicks;

  			var moreProps = helper(this.props, this.context);

  			return React__default.createElement(Axis, _extends$7({}, this.props, moreProps, { x: true,
  				zoomEnabled: this.props.zoomEnabled && showTicks,
  				axisZoomCallback: this.axisZoomCallback,
  				zoomCursorClassName: "react-stockcharts-ew-resize-cursor" }));
  		}
  	}]);

  	return XAxis;
  }(React.Component);

  XAxis.propTypes = {
  	axisAt: PropTypes.oneOfType([PropTypes.oneOf(["top", "bottom", "middle"]), PropTypes.number]).isRequired,
  	orient: PropTypes.oneOf(["top", "bottom"]).isRequired,
  	innerTickSize: PropTypes.number,
  	outerTickSize: PropTypes.number,
  	tickFormat: PropTypes.func,
  	tickPadding: PropTypes.number,
  	tickSize: PropTypes.number,
  	ticks: PropTypes.number,
  	tickValues: PropTypes.array,
  	showTicks: PropTypes.bool,
  	className: PropTypes.string,
  	zoomEnabled: PropTypes.bool,
  	onContextMenu: PropTypes.func,
  	onDoubleClick: PropTypes.func
  };

  XAxis.defaultProps = {
  	showTicks: true,
  	showTickLabel: true,
  	showDomain: true,
  	className: "react-stockcharts-x-axis",
  	ticks: 10,
  	outerTickSize: 0,
  	fill: "none",
  	stroke: "#000000", // x axis stroke color
  	strokeWidth: 1,
  	opacity: 1, // x axis opacity
  	domainClassName: "react-stockcharts-axis-domain",
  	innerTickSize: 5,
  	tickPadding: 6,
  	tickStroke: "#000000", // tick/grid stroke
  	tickStrokeOpacity: 1,
  	fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
  	fontSize: 12,
  	fontWeight: 400,
  	xZoomHeight: 25,
  	zoomEnabled: true,
  	getMouseDelta: function getMouseDelta(startXY, mouseXY) {
  		return startXY[0] - mouseXY[0];
  	}
  };

  XAxis.contextTypes = {
  	chartConfig: PropTypes.object.isRequired,
  	xAxisZoom: PropTypes.func.isRequired
  };

  function helper(props, context) {
  	var axisAt = props.axisAt,
  	    xZoomHeight = props.xZoomHeight,
  	    orient = props.orient;
  	var _context$chartConfig = context.chartConfig,
  	    width = _context$chartConfig.width,
  	    height = _context$chartConfig.height;


  	var axisLocation = void 0;
  	var x = 0,
  	    w = width,
  	    h = xZoomHeight;

  	if (axisAt === "top") axisLocation = 0;else if (axisAt === "bottom") axisLocation = height;else if (axisAt === "middle") axisLocation = height / 2;else axisLocation = axisAt;

  	var y = orient === "top" ? -xZoomHeight : 0;

  	return {
  		transform: [0, axisLocation],
  		range: [0, width],
  		getScale: getXScale,
  		bg: { x: x, y: y, h: h, w: w }
  	};
  }

  function getXScale(moreProps) {
  	var scale = moreProps.xScale,
  	    width = moreProps.width;


  	if (scale.invert) {
  		var trueRange = [0, width];
  		var trueDomain = trueRange.map(scale.invert);
  		return scale.copy().domain(trueDomain).range(trueRange);
  	}

  	return scale;
  }

  var _extends$8 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  var _createClass$12 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _objectWithoutProperties$2(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

  function _classCallCheck$12(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$12(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$12(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var YAxis = function (_Component) {
  	_inherits$12(YAxis, _Component);

  	function YAxis(props, context) {
  		_classCallCheck$12(this, YAxis);

  		var _this = _possibleConstructorReturn$12(this, (YAxis.__proto__ || Object.getPrototypeOf(YAxis)).call(this, props, context));

  		_this.axisZoomCallback = _this.axisZoomCallback.bind(_this);
  		return _this;
  	}

  	_createClass$12(YAxis, [{
  		key: "axisZoomCallback",
  		value: function axisZoomCallback(newYDomain) {
  			var _context = this.context,
  			    chartId = _context.chartId,
  			    yAxisZoom = _context.yAxisZoom;

  			yAxisZoom(chartId, newYDomain);
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var _helper = helper$1(this.props, this.context),
  			    zoomEnabled = _helper.zoomEnabled,
  			    moreProps = _objectWithoutProperties$2(_helper, ["zoomEnabled"]);

  			return React__default.createElement(Axis, _extends$8({}, this.props, moreProps, {
  				zoomEnabled: this.props.zoomEnabled && zoomEnabled,
  				edgeClip: true,
  				axisZoomCallback: this.axisZoomCallback,
  				zoomCursorClassName: "react-stockcharts-ns-resize-cursor" }));
  		}
  	}]);

  	return YAxis;
  }(React.Component);

  YAxis.propTypes = {
  	axisAt: PropTypes.oneOfType([PropTypes.oneOf(["left", "right", "middle"]), PropTypes.number]).isRequired,
  	orient: PropTypes.oneOf(["left", "right"]).isRequired,
  	innerTickSize: PropTypes.number,
  	outerTickSize: PropTypes.number,
  	tickFormat: PropTypes.func,
  	tickPadding: PropTypes.number,
  	tickSize: PropTypes.number,
  	ticks: PropTypes.number,
  	yZoomWidth: PropTypes.number,
  	tickValues: PropTypes.array,
  	showTicks: PropTypes.bool,
  	className: PropTypes.string,
  	zoomEnabled: PropTypes.bool,
  	onContextMenu: PropTypes.func,
  	onDoubleClick: PropTypes.func
  };

  YAxis.defaultProps = {
  	showTicks: true,
  	showTickLabel: true,
  	showDomain: true,
  	className: "react-stockcharts-y-axis",
  	ticks: 10,
  	outerTickSize: 0,
  	domainClassName: "react-stockcharts-axis-domain",
  	fill: "none",
  	stroke: "#FFFFFF",
  	strokeWidth: 1,
  	opacity: 1,
  	innerTickSize: 5,
  	tickPadding: 6,
  	tickStroke: "#000000",
  	tickStrokeOpacity: 1,
  	fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
  	fontSize: 12,
  	fontWeight: 400,
  	yZoomWidth: 40,
  	zoomEnabled: true,
  	getMouseDelta: function getMouseDelta(startXY, mouseXY) {
  		return startXY[1] - mouseXY[1];
  	}
  };

  YAxis.contextTypes = {
  	yAxisZoom: PropTypes.func.isRequired,
  	chartId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  	chartConfig: PropTypes.object.isRequired
  };

  function helper$1(props, context) {
  	var axisAt = props.axisAt,
  	    yZoomWidth = props.yZoomWidth,
  	    orient = props.orient;
  	var _context$chartConfig = context.chartConfig,
  	    width = _context$chartConfig.width,
  	    height = _context$chartConfig.height;


  	var axisLocation = void 0;
  	var y = 0,
  	    w = yZoomWidth,
  	    h = height;

  	if (axisAt === "left") {
  		axisLocation = 0;
  	} else if (axisAt === "right") {
  		axisLocation = width;
  	} else if (axisAt === "middle") {
  		axisLocation = width / 2;
  	} else {
  		axisLocation = axisAt;
  	}

  	var x = orient === "left" ? -yZoomWidth : 0;

  	return {
  		transform: [axisLocation, 0],
  		range: [0, height],
  		getScale: getYScale,
  		bg: { x: x, y: y, h: h, w: w },
  		zoomEnabled: context.chartConfig.yPan
  	};
  }

  function getYScale(moreProps) {
  	var _moreProps$chartConfi = moreProps.chartConfig,
  	    scale = _moreProps$chartConfi.yScale,
  	    flipYScale = _moreProps$chartConfi.flipYScale,
  	    height = _moreProps$chartConfi.height;

  	if (scale.invert) {
  		var trueRange = flipYScale ? [0, height] : [height, 0];
  		var trueDomain = trueRange.map(scale.invert);
  		return scale.copy().domain(trueDomain).range(trueRange);
  	}
  	return scale;
  }

  function constant$5(x) {
    return function constant() {
      return x;
    };
  }

  var pi$1 = Math.PI;

  function Linear(context) {
    this._context = context;
  }

  Linear.prototype = {
    areaStart: function() {
      this._line = 0;
    },
    areaEnd: function() {
      this._line = NaN;
    },
    lineStart: function() {
      this._point = 0;
    },
    lineEnd: function() {
      if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
      this._line = 1 - this._line;
    },
    point: function(x, y) {
      x = +x, y = +y;
      switch (this._point) {
        case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
        case 1: this._point = 2; // proceed
        default: this._context.lineTo(x, y); break;
      }
    }
  };

  function curveLinear(context) {
    return new Linear(context);
  }

  function x$2(p) {
    return p[0];
  }

  function y$3(p) {
    return p[1];
  }

  function line() {
    var x$$1 = x$2,
        y$$1 = y$3,
        defined = constant$5(true),
        context = null,
        curve = curveLinear,
        output = null;

    function line(data) {
      var i,
          n = data.length,
          d,
          defined0 = false,
          buffer;

      if (context == null) output = curve(buffer = path$1());

      for (i = 0; i <= n; ++i) {
        if (!(i < n && defined(d = data[i], i, data)) === defined0) {
          if (defined0 = !defined0) output.lineStart();
          else output.lineEnd();
        }
        if (defined0) output.point(+x$$1(d, i, data), +y$$1(d, i, data));
      }

      if (buffer) return output = null, buffer + "" || null;
    }

    line.x = function(_) {
      return arguments.length ? (x$$1 = typeof _ === "function" ? _ : constant$5(+_), line) : x$$1;
    };

    line.y = function(_) {
      return arguments.length ? (y$$1 = typeof _ === "function" ? _ : constant$5(+_), line) : y$$1;
    };

    line.defined = function(_) {
      return arguments.length ? (defined = typeof _ === "function" ? _ : constant$5(!!_), line) : defined;
    };

    line.curve = function(_) {
      return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
    };

    line.context = function(_) {
      return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
    };

    return line;
  }

  function area() {
    var x0 = x$2,
        x1 = null,
        y0 = constant$5(0),
        y1 = y$3,
        defined = constant$5(true),
        context = null,
        curve = curveLinear,
        output = null;

    function area(data) {
      var i,
          j,
          k,
          n = data.length,
          d,
          defined0 = false,
          buffer,
          x0z = new Array(n),
          y0z = new Array(n);

      if (context == null) output = curve(buffer = path$1());

      for (i = 0; i <= n; ++i) {
        if (!(i < n && defined(d = data[i], i, data)) === defined0) {
          if (defined0 = !defined0) {
            j = i;
            output.areaStart();
            output.lineStart();
          } else {
            output.lineEnd();
            output.lineStart();
            for (k = i - 1; k >= j; --k) {
              output.point(x0z[k], y0z[k]);
            }
            output.lineEnd();
            output.areaEnd();
          }
        }
        if (defined0) {
          x0z[i] = +x0(d, i, data), y0z[i] = +y0(d, i, data);
          output.point(x1 ? +x1(d, i, data) : x0z[i], y1 ? +y1(d, i, data) : y0z[i]);
        }
      }

      if (buffer) return output = null, buffer + "" || null;
    }

    function arealine() {
      return line().defined(defined).curve(curve).context(context);
    }

    area.x = function(_) {
      return arguments.length ? (x0 = typeof _ === "function" ? _ : constant$5(+_), x1 = null, area) : x0;
    };

    area.x0 = function(_) {
      return arguments.length ? (x0 = typeof _ === "function" ? _ : constant$5(+_), area) : x0;
    };

    area.x1 = function(_) {
      return arguments.length ? (x1 = _ == null ? null : typeof _ === "function" ? _ : constant$5(+_), area) : x1;
    };

    area.y = function(_) {
      return arguments.length ? (y0 = typeof _ === "function" ? _ : constant$5(+_), y1 = null, area) : y0;
    };

    area.y0 = function(_) {
      return arguments.length ? (y0 = typeof _ === "function" ? _ : constant$5(+_), area) : y0;
    };

    area.y1 = function(_) {
      return arguments.length ? (y1 = _ == null ? null : typeof _ === "function" ? _ : constant$5(+_), area) : y1;
    };

    area.lineX0 =
    area.lineY0 = function() {
      return arealine().x(x0).y(y0);
    };

    area.lineY1 = function() {
      return arealine().x(x0).y(y1);
    };

    area.lineX1 = function() {
      return arealine().x(x1).y(y0);
    };

    area.defined = function(_) {
      return arguments.length ? (defined = typeof _ === "function" ? _ : constant$5(!!_), area) : defined;
    };

    area.curve = function(_) {
      return arguments.length ? (curve = _, context != null && (output = curve(context)), area) : curve;
    };

    area.context = function(_) {
      return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), area) : context;
    };

    return area;
  }

  var slice$2 = Array.prototype.slice;

  function sign$1(x) {
    return x < 0 ? -1 : 1;
  }

  // Calculate the slopes of the tangents (Hermite-type interpolation) based on
  // the following paper: Steffen, M. 1990. A Simple Method for Monotonic
  // Interpolation in One Dimension. Astronomy and Astrophysics, Vol. 239, NO.
  // NOV(II), P. 443, 1990.
  function slope3(that, x2, y2) {
    var h0 = that._x1 - that._x0,
        h1 = x2 - that._x1,
        s0 = (that._y1 - that._y0) / (h0 || h1 < 0 && -0),
        s1 = (y2 - that._y1) / (h1 || h0 < 0 && -0),
        p = (s0 * h1 + s1 * h0) / (h0 + h1);
    return (sign$1(s0) + sign$1(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
  }

  // Calculate a one-sided slope.
  function slope2(that, t) {
    var h = that._x1 - that._x0;
    return h ? (3 * (that._y1 - that._y0) / h - t) / 2 : t;
  }

  // According to https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Representations
  // "you can express cubic Hermite interpolation in terms of cubic Bézier curves
  // with respect to the four values p0, p0 + m0 / 3, p1 - m1 / 3, p1".
  function point$5(that, t0, t1) {
    var x0 = that._x0,
        y0 = that._y0,
        x1 = that._x1,
        y1 = that._y1,
        dx = (x1 - x0) / 3;
    that._context.bezierCurveTo(x0 + dx, y0 + dx * t0, x1 - dx, y1 - dx * t1, x1, y1);
  }

  function MonotoneX(context) {
    this._context = context;
  }

  MonotoneX.prototype = {
    areaStart: function() {
      this._line = 0;
    },
    areaEnd: function() {
      this._line = NaN;
    },
    lineStart: function() {
      this._x0 = this._x1 =
      this._y0 = this._y1 =
      this._t0 = NaN;
      this._point = 0;
    },
    lineEnd: function() {
      switch (this._point) {
        case 2: this._context.lineTo(this._x1, this._y1); break;
        case 3: point$5(this, this._t0, slope2(this, this._t0)); break;
      }
      if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
      this._line = 1 - this._line;
    },
    point: function(x, y) {
      var t1 = NaN;

      x = +x, y = +y;
      if (x === this._x1 && y === this._y1) return; // Ignore coincident points.
      switch (this._point) {
        case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
        case 1: this._point = 2; break;
        case 2: this._point = 3; point$5(this, slope2(this, t1 = slope3(this, x, y)), t1); break;
        default: point$5(this, this._t0, t1 = slope3(this, x, y)); break;
      }

      this._x0 = this._x1, this._x1 = x;
      this._y0 = this._y1, this._y1 = y;
      this._t0 = t1;
    }
  };

  function MonotoneY(context) {
    this._context = new ReflectContext(context);
  }

  (MonotoneY.prototype = Object.create(MonotoneX.prototype)).point = function(x, y) {
    MonotoneX.prototype.point.call(this, y, x);
  };

  function ReflectContext(context) {
    this._context = context;
  }

  ReflectContext.prototype = {
    moveTo: function(x, y) { this._context.moveTo(y, x); },
    closePath: function() { this._context.closePath(); },
    lineTo: function(x, y) { this._context.lineTo(y, x); },
    bezierCurveTo: function(x1, y1, x2, y2, x, y) { this._context.bezierCurveTo(y1, x1, y2, x2, y, x); }
  };

  function Step(context, t) {
    this._context = context;
    this._t = t;
  }

  Step.prototype = {
    areaStart: function() {
      this._line = 0;
    },
    areaEnd: function() {
      this._line = NaN;
    },
    lineStart: function() {
      this._x = this._y = NaN;
      this._point = 0;
    },
    lineEnd: function() {
      if (0 < this._t && this._t < 1 && this._point === 2) this._context.lineTo(this._x, this._y);
      if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
      if (this._line >= 0) this._t = 1 - this._t, this._line = 1 - this._line;
    },
    point: function(x, y) {
      x = +x, y = +y;
      switch (this._point) {
        case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
        case 1: this._point = 2; // proceed
        default: {
          if (this._t <= 0) {
            this._context.lineTo(this._x, y);
            this._context.lineTo(x, y);
          } else {
            var x1 = this._x * (1 - this._t) + x * this._t;
            this._context.lineTo(x1, this._y);
            this._context.lineTo(x1, y);
          }
          break;
        }
      }
      this._x = x, this._y = y;
    }
  };

  function stepBefore(context) {
    return new Step(context, 0);
  }

  function none$1(series, order) {
    if (!((n = series.length) > 1)) return;
    for (var i = 1, j, s0, s1 = series[order[0]], n, m = s1.length; i < n; ++i) {
      s0 = s1, s1 = series[order[i]];
      for (j = 0; j < m; ++j) {
        s1[j][1] += s1[j][0] = isNaN(s0[j][1]) ? s0[j][0] : s0[j][1];
      }
    }
  }

  function none$2(series) {
    var n = series.length, o = new Array(n);
    while (--n >= 0) o[n] = n;
    return o;
  }

  function stackValue(d, key) {
    return d[key];
  }

  function d3Stack() {
    var keys = constant$5([]),
        order = none$2,
        offset = none$1,
        value = stackValue;

    function stack(data) {
      var kz = keys.apply(this, arguments),
          i,
          m = data.length,
          n = kz.length,
          sz = new Array(n),
          oz;

      for (i = 0; i < n; ++i) {
        for (var ki = kz[i], si = sz[i] = new Array(m), j = 0, sij; j < m; ++j) {
          si[j] = sij = [0, +value(data[j], ki, j, data)];
          sij.data = data[j];
        }
        si.key = ki;
      }

      for (i = 0, oz = order(sz); i < n; ++i) {
        sz[oz[i]].index = i;
      }

      offset(sz, oz);
      return sz;
    }

    stack.keys = function(_) {
      return arguments.length ? (keys = typeof _ === "function" ? _ : constant$5(slice$2.call(_)), stack) : keys;
    };

    stack.value = function(_) {
      return arguments.length ? (value = typeof _ === "function" ? _ : constant$5(+_), stack) : value;
    };

    stack.order = function(_) {
      return arguments.length ? (order = _ == null ? none$2 : typeof _ === "function" ? _ : constant$5(slice$2.call(_)), stack) : order;
    };

    stack.offset = function(_) {
      return arguments.length ? (offset = _ == null ? none$1 : _, stack) : offset;
    };

    return stack;
  }

  var _extends$9 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  var _slicedToArray$11 = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _createClass$13 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$13(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$13(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$13(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var LineSeries = function (_Component) {
  	_inherits$13(LineSeries, _Component);

  	function LineSeries(props) {
  		_classCallCheck$13(this, LineSeries);

  		var _this = _possibleConstructorReturn$13(this, (LineSeries.__proto__ || Object.getPrototypeOf(LineSeries)).call(this, props));

  		_this.renderSVG = _this.renderSVG.bind(_this);
  		_this.drawOnCanvas = _this.drawOnCanvas.bind(_this);
  		_this.isHover = _this.isHover.bind(_this);
  		return _this;
  	}

  	_createClass$13(LineSeries, [{
  		key: "isHover",
  		value: function isHover(moreProps) {
  			// console.log("HERE")
  			var _props = this.props,
  			    highlightOnHover = _props.highlightOnHover,
  			    yAccessor = _props.yAccessor,
  			    hoverTolerance = _props.hoverTolerance;


  			if (!highlightOnHover) return false;

  			var mouseXY = moreProps.mouseXY,
  			    currentItem = moreProps.currentItem,
  			    xScale = moreProps.xScale,
  			    plotData = moreProps.plotData;
  			var _moreProps$chartConfi = moreProps.chartConfig,
  			    yScale = _moreProps$chartConfi.yScale,
  			    origin = _moreProps$chartConfi.origin;
  			var xAccessor = moreProps.xAccessor;

  			var _mouseXY = _slicedToArray$11(mouseXY, 2),
  			    x = _mouseXY[0],
  			    y = _mouseXY[1];

  			var radius = hoverTolerance;

  			var _getClosestItemIndexe = getClosestItemIndexes(plotData, xScale.invert(x), xAccessor),
  			    left = _getClosestItemIndexe.left,
  			    right = _getClosestItemIndexe.right;

  			if (left === right) {
  				var cy = yScale(yAccessor(currentItem)) + origin[1];
  				var cx = xScale(xAccessor(currentItem)) + origin[0];

  				var hovering1 = Math.pow(x - cx, 2) + Math.pow(y - cy, 2) < Math.pow(radius, 2);

  				return hovering1;
  			} else {
  				var l = plotData[left];
  				var r = plotData[right];
  				var x1 = xScale(xAccessor(l)) + origin[0];
  				var y1 = yScale(yAccessor(l)) + origin[1];
  				var x2 = xScale(xAccessor(r)) + origin[0];
  				var y2 = yScale(yAccessor(r)) + origin[1];

  				// y = m * x + b
  				var m /* slope */ = (y2 - y1) / (x2 - x1);
  				var b /* y intercept */ = -1 * m * x1 + y1;

  				var desiredY = Math.round(m * x + b);

  				var hovering2 = y >= desiredY - radius && y <= desiredY + radius;

  				return hovering2;
  			}
  		}
  	}, {
  		key: "drawOnCanvas",
  		value: function drawOnCanvas(ctx, moreProps) {
  			var _props2 = this.props,
  			    yAccessor = _props2.yAccessor,
  			    stroke = _props2.stroke,
  			    strokeOpacity = _props2.strokeOpacity,
  			    strokeWidth = _props2.strokeWidth,
  			    hoverStrokeWidth = _props2.hoverStrokeWidth,
  			    defined = _props2.defined,
  			    strokeDasharray = _props2.strokeDasharray,
  			    interpolation = _props2.interpolation,
  			    canvasClip = _props2.canvasClip;
  			var connectNulls = this.props.connectNulls;
  			var xAccessor = moreProps.xAccessor;
  			var xScale = moreProps.xScale,
  			    yScale = moreProps.chartConfig.yScale,
  			    plotData = moreProps.plotData,
  			    hovering = moreProps.hovering;


  			if (canvasClip) {
  				ctx.save();
  				canvasClip(ctx, moreProps);
  			}

  			ctx.lineWidth = hovering ? hoverStrokeWidth : strokeWidth;

  			ctx.strokeStyle = hexToRGBA(stroke, strokeOpacity);
  			ctx.setLineDash(getStrokeDasharray(strokeDasharray).split(","));

  			var dataSeries = line().x(function (d) {
  				return Math.round(xScale(xAccessor(d)));
  			}).y(function (d) {
  				return Math.round(yScale(yAccessor(d)));
  			});

  			if (isDefined(interpolation)) {
  				dataSeries.curve(interpolation);
  			}
  			if (!connectNulls) {
  				dataSeries.defined(function (d) {
  					return defined(yAccessor(d));
  				});
  			}

  			ctx.beginPath();
  			dataSeries.context(ctx)(plotData);
  			ctx.stroke();

  			if (canvasClip) {
  				ctx.restore();
  			}
  		}
  	}, {
  		key: "renderSVG",
  		value: function renderSVG(moreProps) {
  			var _props3 = this.props,
  			    yAccessor = _props3.yAccessor,
  			    stroke = _props3.stroke,
  			    strokeOpacity = _props3.strokeOpacity,
  			    strokeWidth = _props3.strokeWidth,
  			    hoverStrokeWidth = _props3.hoverStrokeWidth,
  			    defined = _props3.defined,
  			    strokeDasharray = _props3.strokeDasharray;
  			var connectNulls = this.props.connectNulls;
  			var _props4 = this.props,
  			    interpolation = _props4.interpolation,
  			    style = _props4.style;
  			var xAccessor = moreProps.xAccessor,
  			    chartConfig = moreProps.chartConfig;
  			var xScale = moreProps.xScale,
  			    plotData = moreProps.plotData,
  			    hovering = moreProps.hovering;
  			var yScale = chartConfig.yScale;

  			var dataSeries = line().x(function (d) {
  				return Math.round(xScale(xAccessor(d)));
  			}).y(function (d) {
  				return Math.round(yScale(yAccessor(d)));
  			});

  			if (isDefined(interpolation)) {
  				dataSeries.curve(interpolation);
  			}
  			if (!connectNulls) {
  				dataSeries.defined(function (d) {
  					return defined(yAccessor(d));
  				});
  			}
  			var d = dataSeries(plotData);

  			var _props5 = this.props,
  			    fill = _props5.fill,
  			    className = _props5.className;


  			return React__default.createElement("path", {
  				style: style,
  				className: className + " " + (stroke ? "" : " line-stroke"),
  				d: d,
  				stroke: stroke,
  				strokeOpacity: strokeOpacity,
  				strokeWidth: hovering ? hoverStrokeWidth : strokeWidth,
  				strokeDasharray: getStrokeDasharray(strokeDasharray),
  				fill: fill
  			});
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var highlightOnHover = this.props.highlightOnHover;

  			var hoverProps = highlightOnHover ? {
  				isHover: this.isHover,
  				drawOn: ["mousemove", "pan"],
  				canvasToDraw: getMouseCanvas
  			} : {
  				drawOn: ["pan"],
  				canvasToDraw: getAxisCanvas
  			};

  			return React__default.createElement(GenericChartComponent, _extends$9({
  				svgDraw: this.renderSVG,

  				canvasDraw: this.drawOnCanvas,

  				onClickWhenHover: this.props.onClick,
  				onDoubleClickWhenHover: this.props.onDoubleClick,
  				onContextMenuWhenHover: this.props.onContextMenu
  			}, hoverProps));
  		}
  	}]);

  	return LineSeries;
  }(React.Component);

  /*
  function segment(points, ctx) {
  	ctx.beginPath();

  	const [x, y] = first(points);
  	ctx.moveTo(x, y);
  	for (let i = 1; i < points.length; i++) {
  		const [x1, y1] = points[i];
  		ctx.lineTo(x1, y1);
  	}

  	ctx.stroke();
  }
  */

  LineSeries.propTypes = {
  	className: PropTypes.string,
  	strokeWidth: PropTypes.number,
  	strokeOpacity: PropTypes.number,
  	stroke: PropTypes.string,
  	hoverStrokeWidth: PropTypes.number,
  	fill: PropTypes.string,
  	defined: PropTypes.func,
  	hoverTolerance: PropTypes.number,
  	strokeDasharray: PropTypes.oneOf(strokeDashTypes),
  	highlightOnHover: PropTypes.bool,
  	onClick: PropTypes.func,
  	onDoubleClick: PropTypes.func,
  	onContextMenu: PropTypes.func,
  	yAccessor: PropTypes.func,
  	connectNulls: PropTypes.bool,
  	interpolation: PropTypes.func,
  	canvasClip: PropTypes.func,
  	style: PropTypes.object
  };

  LineSeries.defaultProps = {
  	className: "line ",
  	strokeWidth: 1,
  	strokeOpacity: 1,
  	hoverStrokeWidth: 4,
  	fill: "none",
  	stroke: "#4682B4",
  	strokeDasharray: "Solid",
  	defined: function defined(d) {
  		return !isNaN(d);
  	},
  	hoverTolerance: 6,
  	highlightOnHover: false,
  	connectNulls: false,
  	onClick: function onClick(e) {
  		console.log("Click", e);
  	},
  	onDoubleClick: function onDoubleClick(e) {
  		console.log("Double Click", e);
  	},
  	onContextMenu: function onContextMenu(e) {
  		console.log("Right Click", e);
  	}
  };

  var _createClass$14 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$14(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$14(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$14(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var AreaOnlySeries = function (_Component) {
  	_inherits$14(AreaOnlySeries, _Component);

  	function AreaOnlySeries(props) {
  		_classCallCheck$14(this, AreaOnlySeries);

  		var _this = _possibleConstructorReturn$14(this, (AreaOnlySeries.__proto__ || Object.getPrototypeOf(AreaOnlySeries)).call(this, props));

  		_this.renderSVG = _this.renderSVG.bind(_this);
  		_this.drawOnCanvas = _this.drawOnCanvas.bind(_this);
  		return _this;
  	}

  	_createClass$14(AreaOnlySeries, [{
  		key: "drawOnCanvas",
  		value: function drawOnCanvas(ctx, moreProps) {
  			var _props = this.props,
  			    yAccessor = _props.yAccessor,
  			    defined = _props.defined,
  			    base = _props.base,
  			    canvasGradient = _props.canvasGradient;
  			var _props2 = this.props,
  			    fill = _props2.fill,
  			    stroke = _props2.stroke,
  			    opacity = _props2.opacity,
  			    interpolation = _props2.interpolation,
  			    canvasClip = _props2.canvasClip;
  			var xScale = moreProps.xScale,
  			    yScale = moreProps.chartConfig.yScale,
  			    plotData = moreProps.plotData,
  			    xAccessor = moreProps.xAccessor;


  			if (canvasClip) {
  				ctx.save();
  				canvasClip(ctx, moreProps);
  			}

  			if (canvasGradient != null) {
  				ctx.fillStyle = canvasGradient(moreProps, ctx);
  			} else {
  				ctx.fillStyle = hexToRGBA(fill, opacity);
  			}
  			ctx.strokeStyle = stroke;

  			ctx.beginPath();
  			var newBase = functor(base);
  			var areaSeries = area().defined(function (d) {
  				return defined(yAccessor(d));
  			}).x(function (d) {
  				return Math.round(xScale(xAccessor(d)));
  			}).y0(function (d) {
  				return newBase(yScale, d, moreProps);
  			}).y1(function (d) {
  				return Math.round(yScale(yAccessor(d)));
  			}).context(ctx);

  			if (isDefined(interpolation)) {
  				areaSeries.curve(interpolation);
  			}
  			areaSeries(plotData);
  			ctx.fill();

  			if (canvasClip) {
  				ctx.restore();
  			}
  		}
  	}, {
  		key: "renderSVG",
  		value: function renderSVG(moreProps) {
  			var _props3 = this.props,
  			    yAccessor = _props3.yAccessor,
  			    defined = _props3.defined,
  			    base = _props3.base,
  			    style = _props3.style;
  			var _props4 = this.props,
  			    stroke = _props4.stroke,
  			    fill = _props4.fill,
  			    className = _props4.className,
  			    opacity = _props4.opacity,
  			    interpolation = _props4.interpolation;
  			var xScale = moreProps.xScale,
  			    yScale = moreProps.chartConfig.yScale,
  			    plotData = moreProps.plotData,
  			    xAccessor = moreProps.xAccessor;


  			var newBase = functor(base);
  			var areaSeries = area().defined(function (d) {
  				return defined(yAccessor(d));
  			}).x(function (d) {
  				return Math.round(xScale(xAccessor(d)));
  			}).y0(function (d) {
  				return newBase(yScale, d, moreProps);
  			}).y1(function (d) {
  				return Math.round(yScale(yAccessor(d)));
  			});

  			if (isDefined(interpolation)) {
  				areaSeries.curve(interpolation);
  			}

  			var d = areaSeries(plotData);
  			var newClassName = className.concat(isDefined(stroke) ? "" : " line-stroke");
  			return React__default.createElement("path", {
  				style: style,
  				d: d,
  				stroke: stroke,
  				fill: hexToRGBA(fill, opacity),
  				className: newClassName

  			});
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			return React__default.createElement(GenericChartComponent, {
  				svgDraw: this.renderSVG,
  				canvasDraw: this.drawOnCanvas,
  				canvasToDraw: getAxisCanvas,
  				drawOn: ["pan"]
  			});
  		}
  	}]);

  	return AreaOnlySeries;
  }(React.Component);

  AreaOnlySeries.propTypes = {
  	className: PropTypes.string,
  	yAccessor: PropTypes.func.isRequired,
  	stroke: PropTypes.string,
  	fill: PropTypes.string,
  	opacity: PropTypes.number,
  	defined: PropTypes.func,
  	base: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
  	interpolation: PropTypes.func,
  	canvasClip: PropTypes.func,
  	style: PropTypes.object,
  	canvasGradient: PropTypes.func
  };

  AreaOnlySeries.defaultProps = {
  	className: "line ",
  	fill: "none",
  	opacity: 1,
  	defined: function defined(d) {
  		return !isNaN(d);
  	},
  	base: function base(yScale /* , d, moreProps */) {
  		return first(yScale.range());
  	}
  };

  function AreaSeries(props) {
  	var yAccessor = props.yAccessor,
  	    baseAt = props.baseAt;
  	var className = props.className,
  	    opacity = props.opacity,
  	    stroke = props.stroke,
  	    strokeWidth = props.strokeWidth,
  	    strokeOpacity = props.strokeOpacity,
  	    strokeDasharray = props.strokeDasharray,
  	    canvasGradient = props.canvasGradient,
  	    fill = props.fill,
  	    interpolation = props.interpolation,
  	    style = props.style,
  	    canvasClip = props.canvasClip;


  	return React__default.createElement(
  		"g",
  		{ className: className },
  		React__default.createElement(AreaOnlySeries, {
  			yAccessor: yAccessor,
  			interpolation: interpolation,
  			base: baseAt,
  			canvasGradient: canvasGradient,
  			fill: fill,
  			opacity: opacity,
  			style: style,
  			canvasClip: canvasClip,
  			stroke: "none"
  		}),
  		React__default.createElement(LineSeries, {
  			yAccessor: yAccessor,
  			stroke: stroke,
  			strokeWidth: strokeWidth,
  			strokeOpacity: strokeOpacity,
  			strokeDasharray: strokeDasharray,
  			interpolation: interpolation,
  			style: style,
  			canvasClip: canvasClip,
  			fill: "none",
  			hoverHighlight: false
  		})
  	);
  }

  AreaSeries.propTypes = {
  	stroke: PropTypes.string,
  	strokeWidth: PropTypes.number,
  	canvasGradient: PropTypes.func,
  	fill: PropTypes.string.isRequired,
  	strokeOpacity: PropTypes.number.isRequired,
  	opacity: PropTypes.number.isRequired,
  	className: PropTypes.string,
  	yAccessor: PropTypes.func.isRequired,
  	baseAt: PropTypes.func,
  	interpolation: PropTypes.func,
  	canvasClip: PropTypes.func,
  	style: PropTypes.object,
  	strokeDasharray: PropTypes.oneOf(strokeDashTypes)
  };

  AreaSeries.defaultProps = {
  	stroke: "#4682B4",
  	strokeWidth: 1,
  	strokeOpacity: 1,
  	strokeDasharray: "Solid",
  	opacity: 0.5,
  	fill: "#4682B4",
  	className: "react-stockcharts-area"
  };

  var _createClass$15 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$15(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$15(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$15(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var SVGComponent = function (_Component) {
  	_inherits$15(SVGComponent, _Component);

  	function SVGComponent() {
  		_classCallCheck$15(this, SVGComponent);

  		return _possibleConstructorReturn$15(this, (SVGComponent.__proto__ || Object.getPrototypeOf(SVGComponent)).apply(this, arguments));
  	}

  	_createClass$15(SVGComponent, [{
  		key: "render",
  		value: function render() {
  			var children = this.props.children;

  			return React__default.createElement(GenericChartComponent, {
  				drawOn: [],
  				svgDraw: children
  			});
  		}
  	}]);

  	return SVGComponent;
  }(React.Component);

  SVGComponent.propTypes = {
  	children: PropTypes.func.isRequired
  };

  var _createClass$16 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$16(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$16(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$16(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var AlternatingFillAreaSeries = function (_Component) {
  	_inherits$16(AlternatingFillAreaSeries, _Component);

  	function AlternatingFillAreaSeries(props) {
  		_classCallCheck$16(this, AlternatingFillAreaSeries);

  		var _this = _possibleConstructorReturn$16(this, (AlternatingFillAreaSeries.__proto__ || Object.getPrototypeOf(AlternatingFillAreaSeries)).call(this, props));

  		_this.renderClip = _this.renderClip.bind(_this);
  		_this.topClip = _this.topClip.bind(_this);
  		_this.bottomClip = _this.bottomClip.bind(_this);
  		_this.baseAt = _this.baseAt.bind(_this);

  		var id1 = String(Math.round(Math.random() * 10000 * 10000));
  		_this.clipPathId1 = "alternating-area-clip-" + id1;

  		var id2 = String(Math.round(Math.random() * 10000 * 10000));
  		_this.clipPathId2 = "alternating-area-clip-" + id2;
  		return _this;
  	}

  	_createClass$16(AlternatingFillAreaSeries, [{
  		key: "topClip",
  		value: function topClip(ctx, moreProps) {
  			var chartConfig = moreProps.chartConfig;
  			var baseAt = this.props.baseAt;
  			var yScale = chartConfig.yScale,
  			    width = chartConfig.width;


  			ctx.beginPath();
  			ctx.rect(0, 0, width, yScale(baseAt));
  			ctx.clip();
  		}
  	}, {
  		key: "bottomClip",
  		value: function bottomClip(ctx, moreProps) {
  			var chartConfig = moreProps.chartConfig;
  			var baseAt = this.props.baseAt;
  			var yScale = chartConfig.yScale,
  			    width = chartConfig.width,
  			    height = chartConfig.height;


  			ctx.beginPath();
  			ctx.rect(0, yScale(baseAt), width, height - yScale(baseAt));
  			ctx.clip();
  		}
  	}, {
  		key: "renderClip",
  		value: function renderClip(moreProps) {
  			var chartConfig = moreProps.chartConfig;
  			var baseAt = this.props.baseAt;
  			var yScale = chartConfig.yScale,
  			    width = chartConfig.width,
  			    height = chartConfig.height;


  			return React__default.createElement(
  				"defs",
  				null,
  				React__default.createElement(
  					"clipPath",
  					{ id: this.clipPathId1 },
  					React__default.createElement("rect", {
  						x: 0,
  						y: 0,
  						width: width,
  						height: yScale(baseAt)
  					})
  				),
  				React__default.createElement(
  					"clipPath",
  					{ id: this.clipPathId2 },
  					React__default.createElement("rect", {
  						x: 0,
  						y: yScale(baseAt),
  						width: width,
  						height: height - yScale(baseAt)
  					})
  				)
  			);
  		}
  	}, {
  		key: "baseAt",
  		value: function baseAt(yScale) {
  			return yScale(this.props.baseAt);
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var _props = this.props,
  			    className = _props.className,
  			    yAccessor = _props.yAccessor,
  			    interpolation = _props.interpolation;
  			var _props2 = this.props,
  			    stroke = _props2.stroke,
  			    strokeWidth = _props2.strokeWidth,
  			    strokeOpacity = _props2.strokeOpacity,
  			    strokeDasharray = _props2.strokeDasharray,
  			    fill = _props2.fill,
  			    fillOpacity = _props2.fillOpacity;


  			var style1 = { "clipPath": "url(#" + this.clipPathId1 + ")" };
  			var style2 = { "clipPath": "url(#" + this.clipPathId2 + ")" };

  			return React__default.createElement(
  				"g",
  				{ className: className },
  				React__default.createElement(
  					SVGComponent,
  					null,
  					this.renderClip
  				),
  				React__default.createElement(AreaSeries, {
  					style: style1,
  					canvasClip: this.topClip,

  					yAccessor: yAccessor,
  					interpolation: interpolation,
  					baseAt: this.baseAt,

  					fill: fill.top,
  					opacity: fillOpacity.top,
  					stroke: stroke.top,
  					strokeOpacity: strokeOpacity.top,
  					strokeDasharray: strokeDasharray.top,
  					strokeWidth: strokeWidth.top
  				}),
  				React__default.createElement(AreaSeries, {
  					style: style2,
  					canvasClip: this.bottomClip,

  					yAccessor: yAccessor,
  					interpolation: interpolation,
  					baseAt: this.baseAt,

  					fill: fill.bottom,
  					opacity: fillOpacity.bottom,
  					stroke: stroke.bottom,
  					strokeOpacity: strokeOpacity.bottom,
  					strokeDasharray: strokeDasharray.bottom,
  					strokeWidth: strokeWidth.bottom
  				})
  			);
  		}
  	}]);

  	return AlternatingFillAreaSeries;
  }(React.Component);

  AlternatingFillAreaSeries.propTypes = {
  	stroke: PropTypes.shape({
  		top: PropTypes.string,
  		bottom: PropTypes.string
  	}),

  	strokeWidth: PropTypes.shape({
  		top: PropTypes.number,
  		bottom: PropTypes.number
  	}),
  	strokeOpacity: PropTypes.shape({
  		top: PropTypes.number,
  		bottom: PropTypes.number
  	}),
  	fill: PropTypes.shape({
  		top: PropTypes.string,
  		bottom: PropTypes.string
  	}),
  	fillOpacity: PropTypes.shape({
  		top: PropTypes.number,
  		bottom: PropTypes.number
  	}),
  	strokeDasharray: PropTypes.shape({
  		top: PropTypes.oneOf(strokeDashTypes),
  		bottom: PropTypes.oneOf(strokeDashTypes)
  	}).isRequired,

  	className: PropTypes.string,
  	yAccessor: PropTypes.func.isRequired,

  	baseAt: PropTypes.number.isRequired,

  	interpolation: PropTypes.func
  };

  AlternatingFillAreaSeries.defaultProps = {
  	stroke: {
  		top: "#38C172",
  		bottom: "#E3342F"
  	},
  	strokeWidth: {
  		top: 2,
  		bottom: 2
  	},
  	strokeOpacity: {
  		top: 1,
  		bottom: 1
  	},
  	fill: {
  		top: "#A2F5BF",
  		bottom: "#EF5753"
  	},
  	fillOpacity: {
  		top: 0.5,
  		bottom: 0.5
  	},
  	strokeDasharray: {
  		top: "Solid",
  		bottom: "Solid"
  	},
  	className: "react-stockcharts-alternating-area"
  };

  var _extends$10 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  var _createClass$17 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$17(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$17(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$17(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var ScatterSeries = function (_Component) {
  	_inherits$17(ScatterSeries, _Component);

  	function ScatterSeries(props) {
  		_classCallCheck$17(this, ScatterSeries);

  		var _this = _possibleConstructorReturn$17(this, (ScatterSeries.__proto__ || Object.getPrototypeOf(ScatterSeries)).call(this, props));

  		_this.renderSVG = _this.renderSVG.bind(_this);
  		_this.drawOnCanvas = _this.drawOnCanvas.bind(_this);
  		return _this;
  	}

  	_createClass$17(ScatterSeries, [{
  		key: "drawOnCanvas",
  		value: function drawOnCanvas(ctx, moreProps) {
  			var xAccessor = moreProps.xAccessor;


  			var points = helper$2(this.props, moreProps, xAccessor);

  			_drawOnCanvas(ctx, this.props, points);
  		}
  	}, {
  		key: "renderSVG",
  		value: function renderSVG(moreProps) {
  			var _props = this.props,
  			    className = _props.className,
  			    markerProps = _props.markerProps;
  			var xAccessor = moreProps.xAccessor;


  			var points = helper$2(this.props, moreProps, xAccessor);

  			return React__default.createElement(
  				"g",
  				{ className: className },
  				points.map(function (point, idx) {
  					var Marker = point.marker;

  					return React__default.createElement(Marker, _extends$10({ key: idx }, markerProps, { point: point }));
  				})
  			);
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			return React__default.createElement(GenericChartComponent, {
  				svgDraw: this.renderSVG,
  				canvasDraw: this.drawOnCanvas,
  				canvasToDraw: getAxisCanvas,
  				drawOn: ["pan"]
  			});
  		}
  	}]);

  	return ScatterSeries;
  }(React.Component);

  ScatterSeries.propTypes = {
  	className: PropTypes.string,
  	yAccessor: PropTypes.func.isRequired,
  	marker: PropTypes.func,
  	markerProvider: PropTypes.func,
  	markerProps: PropTypes.object
  };

  ScatterSeries.defaultProps = {
  	className: "react-stockcharts-scatter"
  };

  function helper$2(props, moreProps, xAccessor) {
  	var yAccessor = props.yAccessor,
  	    markerProvider = props.markerProvider,
  	    markerProps = props.markerProps;
  	var Marker = props.marker;
  	var xScale = moreProps.xScale,
  	    yScale = moreProps.chartConfig.yScale,
  	    plotData = moreProps.plotData;


  	if (!(markerProvider || Marker)) throw new Error("required prop, either marker or markerProvider missing");

  	return plotData.map(function (d) {

  		if (markerProvider) Marker = markerProvider(d);

  		var mProps = _extends$10({}, Marker.defaultProps, markerProps);

  		var fill = functor(mProps.fill);
  		var stroke = functor(mProps.stroke);

  		return {
  			x: xScale(xAccessor(d)),
  			y: yScale(yAccessor(d)),
  			fill: hexToRGBA(fill(d), mProps.opacity),
  			stroke: stroke(d),
  			datum: d,
  			marker: Marker
  		};
  	});
  }

  function _drawOnCanvas(ctx, props, points) {
  	var markerProps = props.markerProps;


  	var nest$$1 = nest().key(function (d) {
  		return d.fill;
  	}).key(function (d) {
  		return d.stroke;
  	}).entries(points);

  	nest$$1.forEach(function (fillGroup) {
  		var fillKey = fillGroup.key,
  		    fillValues = fillGroup.values;


  		if (fillKey !== "none") {
  			ctx.fillStyle = fillKey;
  		}

  		fillValues.forEach(function (strokeGroup) {
  			// var { key: strokeKey, values: strokeValues } = strokeGroup;
  			var strokeValues = strokeGroup.values;


  			strokeValues.forEach(function (point) {
  				var marker = point.marker;

  				marker.drawOnCanvas(_extends$10({}, marker.defaultProps, markerProps, { fill: fillKey }), point, ctx);
  			});
  		});
  	});
  }

  function Circle(props) {
  	var className = props.className,
  	    stroke = props.stroke,
  	    strokeWidth = props.strokeWidth,
  	    opacity = props.opacity,
  	    fill = props.fill,
  	    point = props.point,
  	    r = props.r;

  	var radius = functor(r)(point.datum);
  	return React__default.createElement("circle", { className: className,
  		cx: point.x, cy: point.y,
  		stroke: stroke, strokeWidth: strokeWidth,
  		fillOpacity: opacity, fill: fill, r: radius });
  }

  Circle.propTypes = {
  	stroke: PropTypes.string,
  	fill: PropTypes.string.isRequired,
  	opacity: PropTypes.number.isRequired,
  	point: PropTypes.shape({
  		x: PropTypes.number.isRequired,
  		y: PropTypes.number.isRequired,
  		datum: PropTypes.object.isRequired
  	}).isRequired,
  	className: PropTypes.string,
  	strokeWidth: PropTypes.number,
  	r: PropTypes.oneOfType([PropTypes.number, PropTypes.func]).isRequired
  };

  Circle.defaultProps = {
  	stroke: "#4682B4",
  	strokeWidth: 1,
  	opacity: 0.5,
  	fill: "#4682B4",
  	className: "react-stockcharts-marker-circle"
  };

  Circle.drawOnCanvas = function (props, point, ctx) {
  	var stroke = props.stroke,
  	    fill = props.fill,
  	    opacity = props.opacity,
  	    strokeWidth = props.strokeWidth;


  	ctx.strokeStyle = stroke;
  	ctx.lineWidth = strokeWidth;

  	if (fill !== "none") {
  		ctx.fillStyle = hexToRGBA(fill, opacity);
  	}

  	Circle.drawOnCanvasWithNoStateChange(props, point, ctx);
  };

  Circle.drawOnCanvasWithNoStateChange = function (props, point, ctx) {
  	var r = props.r;

  	var radius = functor(r)(point.datum);

  	ctx.moveTo(point.x, point.y);
  	ctx.beginPath();
  	ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
  	ctx.stroke();
  	ctx.fill();
  };

  function Triangle(props) {
  	var className = props.className,
  	    strokeWidth = props.strokeWidth,
  	    opacity = props.opacity,
  	    point = props.point,
  	    width = props.width;


  	var rotation = getRotationInDegrees(props, point);
  	if (rotation == null) return null;

  	var fillColor = getFillColor(props);
  	var strokeColor = getStrokeColor(props);

  	var w = functor(width)(point.datum);
  	var x = point.x,
  	    y = point.y;

  	var _getTrianglePoints = getTrianglePoints(w),
  	    innerOpposite = _getTrianglePoints.innerOpposite,
  	    innerHypotenuse = _getTrianglePoints.innerHypotenuse;

  	var points = "\n\t\t" + x + " " + (y - innerHypotenuse) + ",\n\t\t" + (x + w / 2) + " " + (y + innerOpposite) + ",\n\t\t" + (x - w / 2) + " " + (y + innerOpposite) + "\n\t";

  	return React__default.createElement("polygon", {
  		className: className,
  		points: points,
  		stroke: strokeColor,
  		strokeWidth: strokeWidth,
  		fillOpacity: opacity,
  		fill: fillColor,
  		transform: rotation !== 0 ? "rotate(" + rotation + ", " + x + ", " + y + ")" : null
  	});
  }
  Triangle.propTypes = {
  	direction: PropTypes.oneOfType([PropTypes.oneOf(["top", "bottom", "left", "right", "hide"]), PropTypes.func]).isRequired,
  	stroke: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  	fill: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  	opacity: PropTypes.number.isRequired,
  	point: PropTypes.shape({
  		x: PropTypes.number.isRequired,
  		y: PropTypes.number.isRequired,
  		datum: PropTypes.object.isRequired
  	}).isRequired,
  	className: PropTypes.string,
  	strokeWidth: PropTypes.number,
  	width: PropTypes.oneOfType([PropTypes.number, PropTypes.func]).isRequired
  };
  Triangle.defaultProps = {
  	direction: "top",
  	stroke: "#4682B4",
  	strokeWidth: 1,
  	opacity: 0.5,
  	fill: "#4682B4",
  	className: "react-stockcharts-marker-triangle"
  };
  Triangle.drawOnCanvas = function (props, point, ctx) {
  	var stroke = props.stroke,
  	    fill = props.fill,
  	    opacity = props.opacity,
  	    strokeWidth = props.strokeWidth;

  	ctx.strokeStyle = stroke;
  	ctx.lineWidth = strokeWidth;
  	if (fill !== "none") {
  		ctx.fillStyle = hexToRGBA(fill, opacity);
  	}
  	Triangle.drawOnCanvasWithNoStateChange(props, point, ctx);
  };
  Triangle.drawOnCanvasWithNoStateChange = function (props, point, ctx) {
  	var width = props.width;

  	var w = functor(width)(point.datum);
  	var x = point.x,
  	    y = point.y;

  	var _getTrianglePoints2 = getTrianglePoints(w),
  	    innerOpposite = _getTrianglePoints2.innerOpposite,
  	    innerHypotenuse = _getTrianglePoints2.innerHypotenuse;

  	var rotationDeg = getRotationInDegrees(props, point);

  	ctx.beginPath();
  	ctx.moveTo(x, y - innerHypotenuse);
  	ctx.lineTo(x + w / 2, y + innerOpposite);
  	ctx.lineTo(x - w / 2, y + innerOpposite);
  	ctx.stroke();

  	// TODO: rotation does not work
  	// example: https://gist.github.com/geoffb/6392450
  	if (rotationDeg !== null && rotationDeg !== 0) {
  		ctx.save();
  		ctx.translate(x, y);
  		ctx.rotate(rotationDeg * Math.PI / 180); // 45 degrees
  		ctx.fill();
  		ctx.restore();
  	}
  	ctx.fill();
  };

  function getTrianglePoints(width) {
  	var innerHypotenuse = width / 2 * (1 / Math.cos(30 * Math.PI / 180));
  	var innerOpposite = width / 2 * (1 / Math.tan(60 * Math.PI / 180));
  	return {
  		innerOpposite: innerOpposite,
  		innerHypotenuse: innerHypotenuse
  	};
  }

  function getFillColor(props) {
  	var fill = props.fill,
  	    point = props.point;

  	return fill instanceof Function ? fill(point.datum) : fill;
  }

  function getStrokeColor(props) {
  	var stroke = props.stroke,
  	    point = props.point;

  	return stroke instanceof Function ? stroke(point.datum) : stroke;
  }

  function getRotationInDegrees(props, point) {
  	var direction = props.direction;

  	var directionVal = direction instanceof Function ? direction(point.datum) : direction;
  	if (directionVal === "hide") return null;

  	var rotate = 0;
  	switch (directionVal) {
  		case "bottom":
  			rotate = 180;
  			break;
  		case "left":
  			rotate = -90;
  			break;
  		case "right":
  			rotate = 90;
  			break;
  	}
  	return rotate;
  }

  function Square(props) {
  	var className = props.className,
  	    stroke = props.stroke,
  	    strokeWidth = props.strokeWidth,
  	    opacity = props.opacity,
  	    fill = props.fill,
  	    point = props.point,
  	    width = props.width;

  	var w = functor(width)(point.datum);
  	var x = point.x - w / 2;
  	var y = point.y - w / 2;
  	return React__default.createElement("rect", {
  		className: className,
  		x: x,
  		y: y,
  		stroke: stroke,
  		strokeWidth: strokeWidth,
  		fillOpacity: opacity,
  		fill: fill,
  		width: w,
  		height: w
  	});
  }
  Square.propTypes = {
  	stroke: PropTypes.string,
  	fill: PropTypes.string.isRequired,
  	opacity: PropTypes.number.isRequired,
  	point: PropTypes.shape({
  		x: PropTypes.number.isRequired,
  		y: PropTypes.number.isRequired,
  		datum: PropTypes.object.isRequired
  	}).isRequired,
  	className: PropTypes.string,
  	strokeWidth: PropTypes.number,
  	width: PropTypes.oneOfType([PropTypes.number, PropTypes.func]).isRequired
  };
  Square.defaultProps = {
  	stroke: "#4682B4",
  	strokeWidth: 1,
  	opacity: 0.5,
  	fill: "#4682B4",
  	className: "react-stockcharts-marker-rect"
  };
  Square.drawOnCanvas = function (props, point, ctx) {
  	var stroke = props.stroke,
  	    fill = props.fill,
  	    opacity = props.opacity,
  	    strokeWidth = props.strokeWidth;

  	ctx.strokeStyle = stroke;
  	ctx.lineWidth = strokeWidth;
  	if (fill !== "none") {
  		ctx.fillStyle = hexToRGBA(fill, opacity);
  	}
  	Square.drawOnCanvasWithNoStateChange(props, point, ctx);
  };
  Square.drawOnCanvasWithNoStateChange = function (props, point, ctx) {
  	var width = props.width;

  	var w = functor(width)(point.datum);
  	var x = point.x - w / 2;
  	var y = point.y - w / 2;
  	ctx.beginPath();
  	ctx.rect(x, y, w, w);
  	ctx.stroke();
  	ctx.fill();
  };

  var _createClass$18 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$18(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$18(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$18(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var CandlestickSeries = function (_Component) {
  	_inherits$18(CandlestickSeries, _Component);

  	function CandlestickSeries(props) {
  		_classCallCheck$18(this, CandlestickSeries);

  		var _this = _possibleConstructorReturn$18(this, (CandlestickSeries.__proto__ || Object.getPrototypeOf(CandlestickSeries)).call(this, props));

  		_this.renderSVG = _this.renderSVG.bind(_this);
  		_this.drawOnCanvas = _this.drawOnCanvas.bind(_this);
  		return _this;
  	}

  	_createClass$18(CandlestickSeries, [{
  		key: "drawOnCanvas",
  		value: function drawOnCanvas(ctx, moreProps) {
  			_drawOnCanvas$1(ctx, this.props, moreProps);
  		}
  	}, {
  		key: "renderSVG",
  		value: function renderSVG(moreProps) {
  			var _props = this.props,
  			    className = _props.className,
  			    wickClassName = _props.wickClassName,
  			    candleClassName = _props.candleClassName;
  			var xScale = moreProps.xScale,
  			    yScale = moreProps.chartConfig.yScale,
  			    plotData = moreProps.plotData,
  			    xAccessor = moreProps.xAccessor;


  			var candleData = getCandleData(this.props, xAccessor, xScale, yScale, plotData);

  			return React__default.createElement(
  				"g",
  				{ className: className },
  				React__default.createElement(
  					"g",
  					{ className: wickClassName, key: "wicks" },
  					getWicksSVG(candleData)
  				),
  				React__default.createElement(
  					"g",
  					{ className: candleClassName, key: "candles" },
  					getCandlesSVG(this.props, candleData)
  				)
  			);
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var clip = this.props.clip;

  			return React__default.createElement(GenericChartComponent, {
  				clip: clip,
  				svgDraw: this.renderSVG,
  				canvasDraw: this.drawOnCanvas,
  				canvasToDraw: getAxisCanvas,
  				drawOn: ["pan"]
  			});
  		}
  	}]);

  	return CandlestickSeries;
  }(React.Component);

  CandlestickSeries.propTypes = {
  	className: PropTypes.string,
  	wickClassName: PropTypes.string,
  	candleClassName: PropTypes.string,
  	widthRatio: PropTypes.number,
  	width: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  	classNames: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  	fill: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  	stroke: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  	wickStroke: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  	yAccessor: PropTypes.func,
  	clip: PropTypes.bool
  };

  CandlestickSeries.defaultProps = {
  	className: "react-stockcharts-candlestick",
  	wickClassName: "react-stockcharts-candlestick-wick",
  	candleClassName: "react-stockcharts-candlestick-candle",
  	yAccessor: function yAccessor(d) {
  		return { open: d.open, high: d.high, low: d.low, close: d.close };
  	},
  	classNames: function classNames(d) {
  		return d.close > d.open ? "up" : "down";
  	},
  	width: plotDataLengthBarWidth$$1,
  	wickStroke: "#000000",
  	// wickStroke: d => d.close > d.open ? "#6BA583" : "#FF0000",
  	fill: function fill(d) {
  		return d.close > d.open ? "#6BA583" : "#FF0000";
  	},
  	// stroke: d => d.close > d.open ? "#6BA583" : "#FF0000",
  	stroke: "#000000",
  	candleStrokeWidth: 0.5,
  	// stroke: "none",
  	widthRatio: 0.8,
  	opacity: 0.5,
  	clip: true
  };

  function getWicksSVG(candleData) {

  	var wicks = candleData.map(function (each, idx) {
  		var d = each.wick;
  		return React__default.createElement("path", { key: idx,
  			className: each.className,
  			stroke: d.stroke,
  			d: "M" + d.x + "," + d.y1 + " L" + d.x + "," + d.y2 + " M" + d.x + "," + d.y3 + " L" + d.x + "," + d.y4 });
  	});

  	return wicks;
  }

  function getCandlesSVG(props, candleData) {

  	/* eslint-disable react/prop-types */
  	var opacity = props.opacity,
  	    candleStrokeWidth = props.candleStrokeWidth;
  	/* eslint-enable react/prop-types */

  	var candles = candleData.map(function (d, idx) {
  		if (d.width <= 1) return React__default.createElement("line", { className: d.className, key: idx,
  			x1: d.x, y1: d.y, x2: d.x, y2: d.y + d.height,
  			stroke: d.fill });else if (d.height === 0) return React__default.createElement("line", { key: idx,
  			x1: d.x, y1: d.y, x2: d.x + d.width, y2: d.y + d.height,
  			stroke: d.fill });
  		return React__default.createElement("rect", { key: idx, className: d.className,
  			fillOpacity: opacity,
  			x: d.x, y: d.y, width: d.width, height: d.height,
  			fill: d.fill, stroke: d.stroke, strokeWidth: candleStrokeWidth });
  	});
  	return candles;
  }

  function _drawOnCanvas$1(ctx, props, moreProps) {
  	var opacity = props.opacity,
  	    candleStrokeWidth = props.candleStrokeWidth;
  	var xScale = moreProps.xScale,
  	    yScale = moreProps.chartConfig.yScale,
  	    plotData = moreProps.plotData,
  	    xAccessor = moreProps.xAccessor;

  	// const wickData = getWickData(props, xAccessor, xScale, yScale, plotData);

  	var candleData = getCandleData(props, xAccessor, xScale, yScale, plotData);

  	var wickNest = nest().key(function (d) {
  		return d.wick.stroke;
  	}).entries(candleData);

  	wickNest.forEach(function (outer) {
  		var key = outer.key,
  		    values$$1 = outer.values;

  		ctx.strokeStyle = key;
  		ctx.fillStyle = key;
  		values$$1.forEach(function (each) {
  			/*
     ctx.moveTo(d.x, d.y1);
     ctx.lineTo(d.x, d.y2);
     	ctx.beginPath();
     ctx.moveTo(d.x, d.y3);
     ctx.lineTo(d.x, d.y4);
     ctx.stroke(); */
  			var d = each.wick;

  			ctx.fillRect(d.x - 0.5, d.y1, 1, d.y2 - d.y1);
  			ctx.fillRect(d.x - 0.5, d.y3, 1, d.y4 - d.y3);
  		});
  	});

  	// const candleData = getCandleData(props, xAccessor, xScale, yScale, plotData);

  	var candleNest = nest().key(function (d) {
  		return d.stroke;
  	}).key(function (d) {
  		return d.fill;
  	}).entries(candleData);

  	candleNest.forEach(function (outer) {
  		var strokeKey = outer.key,
  		    strokeValues = outer.values;

  		if (strokeKey !== "none") {
  			ctx.strokeStyle = strokeKey;
  			ctx.lineWidth = candleStrokeWidth;
  		}
  		strokeValues.forEach(function (inner) {
  			var key = inner.key,
  			    values$$1 = inner.values;

  			var fillStyle = head(values$$1).width <= 1 ? key : hexToRGBA(key, opacity);
  			ctx.fillStyle = fillStyle;

  			values$$1.forEach(function (d) {
  				if (d.width <= 1) {
  					// <line className={d.className} key={idx} x1={d.x} y1={d.y} x2={d.x} y2={d.y + d.height}/>
  					/*
       ctx.beginPath();
       ctx.moveTo(d.x, d.y);
       ctx.lineTo(d.x, d.y + d.height);
       ctx.stroke();
       */
  					ctx.fillRect(d.x - 0.5, d.y, 1, d.height);
  				} else if (d.height === 0) {
  					// <line key={idx} x1={d.x} y1={d.y} x2={d.x + d.width} y2={d.y + d.height} />
  					/*
       ctx.beginPath();
       ctx.moveTo(d.x, d.y);
       ctx.lineTo(d.x + d.width, d.y + d.height);
       ctx.stroke();
       */
  					ctx.fillRect(d.x, d.y - 0.5, d.width, 1);
  				} else {
  					/*
       ctx.beginPath();
       ctx.rect(d.x, d.y, d.width, d.height);
       ctx.closePath();
       ctx.fill();
       if (strokeKey !== "none") ctx.stroke();
       */
  					ctx.fillRect(d.x, d.y, d.width, d.height);
  					if (strokeKey !== "none") ctx.strokeRect(d.x, d.y, d.width, d.height);
  				}
  			});
  		});
  	});
  }
  /*
  function getWickData(props, xAccessor, xScale, yScale, plotData) {

  	const { classNames: classNameProp, wickStroke: wickStrokeProp, yAccessor } = props;
  	const wickStroke = functor(wickStrokeProp);
  	const className = functor(classNameProp);
  	const wickData = plotData
  			.filter(d => isDefined(yAccessor(d).close))
  			.map(d => {
  				// console.log(yAccessor);
  				const ohlc = yAccessor(d);

  				const x = Math.round(xScale(xAccessor(d))),
  					y1 = yScale(ohlc.high),
  					y2 = yScale(Math.max(ohlc.open, ohlc.close)),
  					y3 = yScale(Math.min(ohlc.open, ohlc.close)),
  					y4 = yScale(ohlc.low);

  				return {
  					x,
  					y1,
  					y2,
  					y3,
  					y4,
  					className: className(ohlc),
  					direction: (ohlc.close - ohlc.open),
  					stroke: wickStroke(ohlc),
  				};
  			});
  	return wickData;
  }
  */

  function getCandleData(props, xAccessor, xScale, yScale, plotData) {
  	var wickStrokeProp = props.wickStroke;

  	var wickStroke = functor(wickStrokeProp);

  	var classNames = props.classNames,
  	    fillProp = props.fill,
  	    strokeProp = props.stroke,
  	    yAccessor = props.yAccessor;

  	var className = functor(classNames);

  	var fill = functor(fillProp);
  	var stroke = functor(strokeProp);

  	var widthFunctor = functor(props.width);
  	var width = widthFunctor(props, {
  		xScale: xScale,
  		xAccessor: xAccessor,
  		plotData: plotData
  	});

  	/*
   const candleWidth = Math.round(width);
   const offset = Math.round(candleWidth === 1 ? 0 : 0.5 * width);
   */
  	var trueOffset = 0.5 * width;
  	var offset = trueOffset > 0.7 ? Math.round(trueOffset) : Math.floor(trueOffset);

  	// eslint-disable-next-line prefer-const
  	var candles = [];

  	for (var i = 0; i < plotData.length; i++) {
  		var d = plotData[i];
  		if (isDefined(yAccessor(d).close)) {
  			var x = Math.round(xScale(xAccessor(d)));
  			// const x = Math.round(xScale(xAccessor(d)) - offset);

  			var ohlc = yAccessor(d);
  			var y = Math.round(yScale(Math.max(ohlc.open, ohlc.close)));
  			var height = Math.round(Math.abs(yScale(ohlc.open) - yScale(ohlc.close)));

  			candles.push({
  				// type: "line"
  				x: x - offset,
  				y: y,
  				wick: {
  					stroke: wickStroke(ohlc),
  					x: x,
  					y1: Math.round(yScale(ohlc.high)),
  					y2: y,
  					y3: y + height, // Math.round(yScale(Math.min(ohlc.open, ohlc.close))),
  					y4: Math.round(yScale(ohlc.low))
  				},
  				height: height,
  				width: offset * 2,
  				className: className(ohlc),
  				fill: fill(ohlc),
  				stroke: stroke(ohlc),
  				direction: ohlc.close - ohlc.open
  			});
  		}
  	}

  	return candles;
  }

  var _createClass$19 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$19(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$19(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$19(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var OHLCSeries = function (_Component) {
  	_inherits$19(OHLCSeries, _Component);

  	function OHLCSeries(props) {
  		_classCallCheck$19(this, OHLCSeries);

  		var _this = _possibleConstructorReturn$19(this, (OHLCSeries.__proto__ || Object.getPrototypeOf(OHLCSeries)).call(this, props));

  		_this.renderSVG = _this.renderSVG.bind(_this);
  		_this.drawOnCanvas = _this.drawOnCanvas.bind(_this);
  		return _this;
  	}

  	_createClass$19(OHLCSeries, [{
  		key: "drawOnCanvas",
  		value: function drawOnCanvas(ctx, moreProps) {
  			var yAccessor = this.props.yAccessor;
  			var xAccessor = moreProps.xAccessor;
  			var xScale = moreProps.xScale,
  			    yScale = moreProps.chartConfig.yScale,
  			    plotData = moreProps.plotData;


  			var barData = getOHLCBars(this.props, xAccessor, yAccessor, xScale, yScale, plotData);
  			_drawOnCanvas$2(ctx, barData);
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var clip = this.props.clip;


  			return React__default.createElement(GenericChartComponent, {
  				svgDraw: this.renderSVG,
  				canvasToDraw: getAxisCanvas,
  				canvasDraw: this.drawOnCanvas,
  				clip: clip,
  				drawOn: ["pan"]
  			});
  		}
  	}, {
  		key: "renderSVG",
  		value: function renderSVG(moreProps) {
  			var _props = this.props,
  			    className = _props.className,
  			    yAccessor = _props.yAccessor;
  			var xAccessor = moreProps.xAccessor;
  			var xScale = moreProps.xScale,
  			    yScale = moreProps.chartConfig.yScale,
  			    plotData = moreProps.plotData;


  			var barData = getOHLCBars(this.props, xAccessor, yAccessor, xScale, yScale, plotData);

  			var strokeWidth = barData.strokeWidth,
  			    bars = barData.bars;


  			return React__default.createElement(
  				"g",
  				{ className: className },
  				bars.map(function (d, idx) {
  					return React__default.createElement("path", { key: idx,
  						className: d.className, stroke: d.stroke, strokeWidth: strokeWidth,
  						d: "M" + d.openX1 + " " + d.openY + " L" + d.openX2 + " " + d.openY + " M" + d.x + " " + d.y1 + " L" + d.x + " " + d.y2 + " M" + d.closeX1 + " " + d.closeY + " L" + d.closeX2 + " " + d.closeY });
  				})
  			);
  		}
  	}]);

  	return OHLCSeries;
  }(React.Component);

  OHLCSeries.propTypes = {
  	className: PropTypes.string,
  	classNames: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
  	stroke: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
  	yAccessor: PropTypes.func.isRequired,
  	clip: PropTypes.bool.isRequired
  };

  OHLCSeries.defaultProps = {
  	className: "react-stockcharts-ohlc",
  	yAccessor: function yAccessor(d) {
  		return { open: d.open, high: d.high, low: d.low, close: d.close };
  	},
  	classNames: function classNames(d) {
  		return isDefined(d.absoluteChange) ? d.absoluteChange > 0 ? "up" : "down" : "firstbar";
  	},
  	stroke: function stroke(d) {
  		return isDefined(d.absoluteChange) ? d.absoluteChange > 0 ? "#6BA583" : "#FF0000" : "#000000";
  	},
  	clip: true
  };

  function _drawOnCanvas$2(ctx, barData) {
  	var strokeWidth = barData.strokeWidth,
  	    bars = barData.bars;


  	var wickNest = nest().key(function (d) {
  		return d.stroke;
  	}).entries(bars);

  	ctx.lineWidth = strokeWidth;

  	wickNest.forEach(function (outer) {
  		var key = outer.key,
  		    values$$1 = outer.values;

  		ctx.strokeStyle = key;
  		values$$1.forEach(function (d) {
  			ctx.beginPath();
  			ctx.moveTo(d.x, d.y1);
  			ctx.lineTo(d.x, d.y2);

  			ctx.moveTo(d.openX1, d.openY);
  			ctx.lineTo(d.openX2, d.openY);

  			ctx.moveTo(d.closeX1, d.closeY);
  			ctx.lineTo(d.closeX2, d.closeY);

  			ctx.stroke();
  		});
  	});
  }

  function getOHLCBars(props, xAccessor, yAccessor, xScale, yScale, plotData) {
  	var classNamesProp = props.classNames,
  	    strokeProp = props.stroke;


  	var strokeFunc = functor(strokeProp);
  	var classNameFunc = functor(classNamesProp);

  	var width = xScale(xAccessor(plotData[plotData.length - 1])) - xScale(xAccessor(plotData[0]));

  	var barWidth = Math.max(1, Math.round(width / (plotData.length - 1) / 2) - 1.5);
  	var strokeWidth = Math.min(barWidth, 6);

  	var bars = plotData.filter(function (d) {
  		return isDefined(yAccessor(d).close);
  	}).map(function (d) {
  		var ohlc = yAccessor(d),
  		    x = Math.round(xScale(xAccessor(d))),
  		    y1 = yScale(ohlc.high),
  		    y2 = yScale(ohlc.low),
  		    openX1 = x - barWidth,
  		    openX2 = x + strokeWidth / 2,
  		    openY = yScale(ohlc.open),
  		    closeX1 = x - strokeWidth / 2,
  		    closeX2 = x + barWidth,
  		    closeY = yScale(ohlc.close),
  		    className = classNameFunc(d),
  		    stroke = strokeFunc(d);

  		return { x: x, y1: y1, y2: y2, openX1: openX1, openX2: openX2, openY: openY, closeX1: closeX1, closeX2: closeX2, closeY: closeY, stroke: stroke, className: className };
  	});
  	return { barWidth: barWidth, strokeWidth: strokeWidth, bars: bars };
  }

  var _extends$11 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  var _createClass$20 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$20(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$20(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$20(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var StackedBarSeries = function (_Component) {
  	_inherits$20(StackedBarSeries, _Component);

  	function StackedBarSeries(props) {
  		_classCallCheck$20(this, StackedBarSeries);

  		var _this = _possibleConstructorReturn$20(this, (StackedBarSeries.__proto__ || Object.getPrototypeOf(StackedBarSeries)).call(this, props));

  		_this.renderSVG = _this.renderSVG.bind(_this);
  		_this.drawOnCanvas = _this.drawOnCanvas.bind(_this);
  		return _this;
  	}

  	_createClass$20(StackedBarSeries, [{
  		key: "drawOnCanvas",
  		value: function drawOnCanvas(ctx, moreProps) {
  			var xAccessor = moreProps.xAccessor;
  			// var { xScale, chartConfig: { yScale }, plotData } = moreProps;

  			drawOnCanvasHelper(ctx, this.props, moreProps, xAccessor, d3Stack);
  		}
  	}, {
  		key: "renderSVG",
  		value: function renderSVG(moreProps) {
  			var xAccessor = moreProps.xAccessor;


  			return React__default.createElement(
  				"g",
  				null,
  				svgHelper(this.props, moreProps, xAccessor, d3Stack)
  			);
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var clip = this.props.clip;


  			return React__default.createElement(GenericChartComponent, {
  				clip: clip,
  				svgDraw: this.renderSVG,
  				canvasDraw: this.drawOnCanvas,
  				canvasToDraw: getAxisCanvas,
  				drawOn: ["pan"]
  			});
  		}
  	}]);

  	return StackedBarSeries;
  }(React.Component);

  StackedBarSeries.propTypes = {
  	baseAt: PropTypes.oneOfType([PropTypes.number, PropTypes.func]).isRequired,
  	direction: PropTypes.oneOf(["up", "down"]).isRequired,
  	stroke: PropTypes.bool.isRequired,
  	width: PropTypes.oneOfType([PropTypes.number, PropTypes.func]).isRequired,
  	opacity: PropTypes.number.isRequired,
  	fill: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
  	className: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
  	clip: PropTypes.bool.isRequired
  };

  StackedBarSeries.defaultProps = {
  	baseAt: function baseAt(xScale, yScale /* , d*/) {
  		return head(yScale.range());
  	},
  	direction: "up",
  	className: "bar",
  	stroke: true,
  	fill: "#4682B4",
  	opacity: 0.5,
  	width: plotDataLengthBarWidth$$1,
  	widthRatio: 0.8,
  	clip: true,
  	swapScales: false
  };

  function identityStack() {
  	var keys$$1 = [];
  	function stack$$1(data) {
  		var response = keys$$1.map(function (key, i) {
  			// eslint-disable-next-line prefer-const
  			var arrays = data.map(function (d) {
  				// eslint-disable-next-line prefer-const
  				var array = [0, d[key]];
  				array.data = d;
  				return array;
  			});
  			arrays.key = key;
  			arrays.index = i;
  			return arrays;
  		});
  		return response;
  	}
  	stack$$1.keys = function (x) {
  		if (!arguments.length) {
  			return keys$$1;
  		}
  		keys$$1 = x;
  		return stack$$1;
  	};
  	return stack$$1;
  }

  function drawOnCanvasHelper(ctx, props, moreProps, xAccessor, stackFn) {
  	var defaultPostAction = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : identity$4;
  	var postRotateAction = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : rotateXY;
  	var xScale = moreProps.xScale,
  	    yScale = moreProps.chartConfig.yScale,
  	    plotData = moreProps.plotData;


  	var bars = doStuff(props, xAccessor, plotData, xScale, yScale, stackFn, postRotateAction, defaultPostAction);

  	drawOnCanvas2(props, ctx, bars);
  }

  function convertToArray(item) {
  	return Array.isArray(item) ? item : [item];
  }

  function svgHelper(props, moreProps, xAccessor, stackFn) {
  	var defaultPostAction = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : identity$4;
  	var postRotateAction = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : rotateXY;
  	var xScale = moreProps.xScale,
  	    yScale = moreProps.chartConfig.yScale,
  	    plotData = moreProps.plotData;

  	var bars = doStuff(props, xAccessor, plotData, xScale, yScale, stackFn, postRotateAction, defaultPostAction);
  	return getBarsSVG2(props, bars);
  }

  function doStuff(props, xAccessor, plotData, xScale, yScale, stackFn, postRotateAction, defaultPostAction) {
  	var yAccessor = props.yAccessor,
  	    swapScales = props.swapScales;


  	var modifiedYAccessor = swapScales ? convertToArray(props.xAccessor) : convertToArray(yAccessor);
  	var modifiedXAccessor = swapScales ? yAccessor : xAccessor;

  	var modifiedXScale = swapScales ? yScale : xScale;
  	var modifiedYScale = swapScales ? xScale : yScale;

  	var postProcessor = swapScales ? postRotateAction : defaultPostAction;

  	var bars = getBars(props, modifiedXAccessor, modifiedYAccessor, modifiedXScale, modifiedYScale, plotData, stackFn, postProcessor);

  	return bars;
  }

  var rotateXY = function rotateXY(array) {
  	return array.map(function (each) {
  		return _extends$11({}, each, {
  			x: each.y,
  			y: each.x,
  			height: each.width,
  			width: each.height
  		});
  	});
  };

  function getBarsSVG2(props, bars) {
  	/* eslint-disable react/prop-types */
  	var opacity = props.opacity;
  	/* eslint-enable react/prop-types */

  	return bars.map(function (d, idx) {
  		if (d.width <= 1) {
  			return React__default.createElement("line", { key: idx, className: d.className,
  				stroke: d.fill,
  				x1: d.x, y1: d.y,
  				x2: d.x, y2: d.y + d.height });
  		}
  		return React__default.createElement("rect", { key: idx, className: d.className,
  			stroke: d.stroke,
  			fill: d.fill,
  			x: d.x,
  			y: d.y,
  			width: d.width,
  			fillOpacity: opacity,
  			height: d.height });
  	});
  }

  function drawOnCanvas2(props, ctx, bars) {
  	var stroke = props.stroke;


  	var nest$$1 = nest().key(function (d) {
  		return d.fill;
  	}).entries(bars);

  	nest$$1.forEach(function (outer) {
  		var key = outer.key,
  		    values$$1 = outer.values;

  		if (head(values$$1).width > 1) {
  			ctx.strokeStyle = key;
  		}
  		var fillStyle = head(values$$1).width <= 1 ? key : hexToRGBA(key, props.opacity);
  		ctx.fillStyle = fillStyle;

  		values$$1.forEach(function (d) {
  			if (d.width <= 1) {
  				/* <line key={idx} className={d.className}
      			stroke={stroke}
      			fill={fill}
      			x1={d.x} y1={d.y}
      			x2={d.x} y2={d.y + d.height} />*/
  				/*
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x, d.y + d.height);
      ctx.stroke();
      */
  				ctx.fillRect(d.x - 0.5, d.y, 1, d.height);
  			} else {
  				/* <rect key={idx} className={d.className}
      		stroke={stroke}
      		fill={fill}
      		x={d.x}
      		y={d.y}
      		width={d.width}
      		height={d.height} /> */
  				/*
      ctx.beginPath();
      ctx.rect(d.x, d.y, d.width, d.height);
      ctx.fill();
      */
  				ctx.fillRect(d.x, d.y, d.width, d.height);
  				if (stroke) ctx.strokeRect(d.x, d.y, d.width, d.height);
  			}
  		});
  	});
  }

  function getBars(props, xAccessor, yAccessor, xScale, yScale, plotData) {
  	var stack$$1 = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : identityStack;
  	var after = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : identity$4;
  	var baseAt = props.baseAt,
  	    className = props.className,
  	    fill = props.fill,
  	    stroke = props.stroke,
  	    _props$spaceBetweenBa = props.spaceBetweenBar,
  	    spaceBetweenBar = _props$spaceBetweenBa === undefined ? 0 : _props$spaceBetweenBa;


  	var getClassName = functor(className);
  	var getFill = functor(fill);
  	var getBase = functor(baseAt);

  	var widthFunctor = functor(props.width);
  	var width = widthFunctor(props, {
  		xScale: xScale,
  		xAccessor: xAccessor,
  		plotData: plotData
  	});

  	var barWidth = Math.round(width);

  	var eachBarWidth = (barWidth - spaceBetweenBar * (yAccessor.length - 1)) / yAccessor.length;

  	var offset = barWidth === 1 ? 0 : 0.5 * width;

  	var ds = plotData.map(function (each) {
  		// eslint-disable-next-line prefer-const
  		var d = {
  			appearance: {},
  			x: xAccessor(each)
  		};
  		yAccessor.forEach(function (eachYAccessor, i) {
  			var key = "y" + i;
  			d[key] = eachYAccessor(each);
  			var appearance = {
  				className: getClassName(each, i),
  				stroke: stroke ? getFill(each, i) : "none",
  				fill: getFill(each, i)
  			};
  			d.appearance[key] = appearance;
  		});
  		return d;
  	});

  	var keys$$1 = yAccessor.map(function (_, i) {
  		return "y" + i;
  	});

  	// console.log(ds);

  	var data = stack$$1().keys(keys$$1)(ds);

  	// console.log(data);

  	var newData = data.map(function (each, i) {
  		var key = each.key;
  		return each.map(function (d) {
  			// eslint-disable-next-line prefer-const
  			var array = [d[0], d[1]];
  			array.data = {
  				x: d.data.x,
  				i: i,
  				appearance: d.data.appearance[key]
  			};
  			return array;
  		});
  	});
  	// console.log(newData);
  	// console.log(merge(newData));

  	var bars = merge(newData)
  	// .filter(d => isDefined(d.y))
  	.map(function (d) {
  		// let baseValue = yScale.invert(getBase(xScale, yScale, d.datum));
  		var y = yScale(d[1]);
  		/* let h = isDefined(d.y0) && d.y0 !== 0 && !isNaN(d.y0)
    		? yScale(d.y0) - y
    		: getBase(xScale, yScale, d.datum) - yScale(d.y)*/
  		var h = getBase(xScale, yScale, d.data) - yScale(d[1] - d[0]);
  		// console.log(d.y, yScale.domain(), yScale.range())
  		// let h = ;
  		// if (d.y < 0) h = -h;
  		// console.log(d, y, h)
  		if (h < 0) {
  			y = y + h;
  			h = -h;
  		}
  		// console.log(d.data.i, Math.round(offset - (d.data.i > 0 ? (eachBarWidth + spaceBetweenBar) * d.data.i : 0)))
  		/* console.log(d.series, d.datum.date, d.x,
    		getBase(xScale, yScale, d.datum), `d.y=${d.y}, d.y0=${d.y0}, y=${y}, h=${h}`)*/
  		return _extends$11({}, d.data.appearance, {
  			// series: d.series,
  			// i: d.x,
  			x: Math.round(xScale(d.data.x) - width / 2),
  			y: y,
  			groupOffset: Math.round(offset - (d.data.i > 0 ? (eachBarWidth + spaceBetweenBar) * d.data.i : 0)),
  			groupWidth: Math.round(eachBarWidth),
  			offset: Math.round(offset),
  			height: h,
  			width: barWidth
  		});
  	}).filter(function (bar) {
  		return !isNaN(bar.y);
  	});

  	return after(bars);
  }

  var _createClass$21 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$21(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$21(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$21(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var BarSeries = function (_Component) {
  	_inherits$21(BarSeries, _Component);

  	function BarSeries(props) {
  		_classCallCheck$21(this, BarSeries);

  		var _this = _possibleConstructorReturn$21(this, (BarSeries.__proto__ || Object.getPrototypeOf(BarSeries)).call(this, props));

  		_this.renderSVG = _this.renderSVG.bind(_this);
  		_this.drawOnCanvas = _this.drawOnCanvas.bind(_this);
  		return _this;
  	}

  	_createClass$21(BarSeries, [{
  		key: "drawOnCanvas",
  		value: function drawOnCanvas(ctx, moreProps) {
  			if (this.props.swapScales) {
  				var xAccessor = moreProps.xAccessor;

  				drawOnCanvasHelper(ctx, this.props, moreProps, xAccessor, identityStack);
  			} else {
  				var bars = getBars$1(this.props, moreProps);
  				drawOnCanvas2(this.props, ctx, bars);
  			}
  		}
  	}, {
  		key: "renderSVG",
  		value: function renderSVG(moreProps) {
  			if (this.props.swapScales) {
  				var xAccessor = moreProps.xAccessor;

  				return React__default.createElement(
  					"g",
  					null,
  					svgHelper(this.props, moreProps, xAccessor, identityStack)
  				);
  			} else {
  				var bars = getBars$1(this.props, moreProps);
  				return React__default.createElement(
  					"g",
  					null,
  					getBarsSVG2(this.props, bars)
  				);
  			}
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var clip = this.props.clip;


  			return React__default.createElement(GenericChartComponent, {
  				clip: clip,
  				svgDraw: this.renderSVG,

  				canvasToDraw: getAxisCanvas,
  				canvasDraw: this.drawOnCanvas,

  				drawOn: ["pan"]
  			});
  		}
  	}]);

  	return BarSeries;
  }(React.Component);

  BarSeries.propTypes = {
  	baseAt: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  	stroke: PropTypes.bool,
  	width: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  	yAccessor: PropTypes.func.isRequired,
  	opacity: PropTypes.number,
  	fill: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  	className: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  	clip: PropTypes.bool,
  	swapScales: PropTypes.bool
  };

  BarSeries.defaultProps = StackedBarSeries.defaultProps;

  /*
   Initially, this program was using StackedBarSeries.getBars
   to benefit from code reuse and having a single place that
   contains the logic for drawing all types of bar charts
   simple, grouped, horizontal, but turnes out
   making it highly cuztimizable also made it slow for the
   most simple case, a regular bar chart.
   This function contains just the necessary logic
   to create bars
  */
  function getBars$1(props, moreProps) {
  	var baseAt = props.baseAt,
  	    fill = props.fill,
  	    stroke = props.stroke,
  	    yAccessor = props.yAccessor;
  	var xScale = moreProps.xScale,
  	    xAccessor = moreProps.xAccessor,
  	    plotData = moreProps.plotData,
  	    yScale = moreProps.chartConfig.yScale;


  	var getFill = functor(fill);
  	var getBase = functor(baseAt);

  	var widthFunctor = functor(props.width);

  	var width = widthFunctor(props, {
  		xScale: xScale,
  		xAccessor: xAccessor,
  		plotData: plotData
  	});
  	/*
   const barWidth = Math.round(width);
   const offset = Math.round(barWidth === 1 ? 0 : 0.5 * barWidth);
   */
  	var offset = Math.floor(0.5 * width);

  	var bars = plotData.filter(function (d) {
  		return isDefined(yAccessor(d));
  	}).map(function (d) {
  		var yValue = yAccessor(d);
  		var y = yScale(yValue);

  		var x = Math.round(xScale(xAccessor(d))) - offset;
  		var h = getBase(xScale, yScale, d) - yScale(yValue);

  		if (h < 0) {
  			y = y + h;
  			h = -h;
  		}

  		return {
  			// type: "line"
  			x: x,
  			y: Math.round(y),
  			height: Math.round(h),
  			width: offset * 2,
  			fill: getFill(d, 0),
  			stroke: stroke ? getFill(d, 0) : "none"
  		};
  	});

  	return bars;
  }

  var _extends$12 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  var _createClass$22 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$22(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$22(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$22(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var GroupedBarSeries = function (_Component) {
  	_inherits$22(GroupedBarSeries, _Component);

  	function GroupedBarSeries(props) {
  		_classCallCheck$22(this, GroupedBarSeries);

  		var _this = _possibleConstructorReturn$22(this, (GroupedBarSeries.__proto__ || Object.getPrototypeOf(GroupedBarSeries)).call(this, props));

  		_this.renderSVG = _this.renderSVG.bind(_this);
  		_this.drawOnCanvas = _this.drawOnCanvas.bind(_this);
  		return _this;
  	}

  	_createClass$22(GroupedBarSeries, [{
  		key: "drawOnCanvas",
  		value: function drawOnCanvas(ctx, moreProps) {
  			var xAccessor = moreProps.xAccessor;


  			drawOnCanvasHelper(ctx, this.props, moreProps, xAccessor, identityStack, postProcessor);
  		}
  	}, {
  		key: "renderSVG",
  		value: function renderSVG(moreProps) {
  			var xAccessor = moreProps.xAccessor;


  			return React__default.createElement(
  				"g",
  				{ className: "react-stockcharts-grouped-bar-series" },
  				svgHelper(this.props, moreProps, xAccessor, identityStack, postProcessor)
  			);
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			return React__default.createElement(GenericChartComponent, {
  				svgDraw: this.renderSVG,
  				canvasDraw: this.drawOnCanvas,
  				canvasToDraw: getAxisCanvas,
  				drawOn: ["pan"]
  			});
  		}
  	}]);

  	return GroupedBarSeries;
  }(React.Component);

  GroupedBarSeries.propTypes = {
  	baseAt: PropTypes.oneOfType([PropTypes.number, PropTypes.func]).isRequired,
  	direction: PropTypes.oneOf(["up", "down"]).isRequired,
  	stroke: PropTypes.bool.isRequired,
  	widthRatio: PropTypes.number.isRequired,
  	opacity: PropTypes.number.isRequired,
  	fill: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
  	className: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
  	yAccessor: PropTypes.arrayOf(PropTypes.func)
  };

  GroupedBarSeries.defaultProps = _extends$12({}, StackedBarSeries.defaultProps, {
  	widthRatio: 0.8,
  	spaceBetweenBar: 5
  });

  function postProcessor(array) {
  	return array.map(function (each) {
  		return _extends$12({}, each, {
  			x: each.x + each.offset - each.groupOffset,
  			width: each.groupWidth
  		});
  	});
  }

  var _createClass$23 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$23(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$23(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$23(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var KagiSeries = function (_Component) {
  	_inherits$23(KagiSeries, _Component);

  	function KagiSeries(props) {
  		_classCallCheck$23(this, KagiSeries);

  		var _this = _possibleConstructorReturn$23(this, (KagiSeries.__proto__ || Object.getPrototypeOf(KagiSeries)).call(this, props));

  		_this.renderSVG = _this.renderSVG.bind(_this);
  		_this.drawOnCanvas = _this.drawOnCanvas.bind(_this);
  		return _this;
  	}

  	_createClass$23(KagiSeries, [{
  		key: "drawOnCanvas",
  		value: function drawOnCanvas(ctx, moreProps) {
  			var xAccessor = moreProps.xAccessor;


  			_drawOnCanvas$3(ctx, this.props, moreProps, xAccessor);
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			return React__default.createElement(GenericChartComponent, {
  				svgDraw: this.renderSVG,
  				canvasToDraw: getAxisCanvas,
  				canvasDraw: this.drawOnCanvas,
  				drawOn: ["pan"]
  			});
  		}
  	}, {
  		key: "renderSVG",
  		value: function renderSVG(moreProps) {
  			var xAccessor = moreProps.xAccessor;
  			var xScale = moreProps.xScale,
  			    yScale = moreProps.chartConfig.yScale,
  			    plotData = moreProps.plotData;
  			var _props = this.props,
  			    className = _props.className,
  			    stroke = _props.stroke,
  			    fill = _props.fill,
  			    strokeWidth = _props.strokeWidth;


  			var paths = helper$3(plotData, xAccessor).map(function (each, i) {
  				var dataSeries = line().x(function (item) {
  					return xScale(item[0]);
  				}).y(function (item) {
  					return yScale(item[1]);
  				}).curve(stepBefore);

  				dataSeries(each.plot);

  				return React__default.createElement("path", { key: i, d: dataSeries(each.plot), className: each.type,
  					stroke: stroke[each.type], fill: fill[each.type], strokeWidth: strokeWidth });
  			});
  			return React__default.createElement(
  				"g",
  				{ className: className },
  				paths
  			);
  		}
  	}]);

  	return KagiSeries;
  }(React.Component);

  KagiSeries.propTypes = {
  	className: PropTypes.string,
  	stroke: PropTypes.object,
  	fill: PropTypes.object,
  	strokeWidth: PropTypes.number.isRequired
  };

  KagiSeries.defaultProps = {
  	className: "react-stockcharts-kagi",
  	strokeWidth: 2,
  	stroke: {
  		yang: "#6BA583",
  		yin: "#E60000"
  	},
  	fill: {
  		yang: "none",
  		yin: "none"
  	},
  	currentValueStroke: "#000000"
  };

  function _drawOnCanvas$3(ctx, props, moreProps, xAccessor) {
  	var stroke = props.stroke,
  	    strokeWidth = props.strokeWidth,
  	    currentValueStroke = props.currentValueStroke;
  	var xScale = moreProps.xScale,
  	    yScale = moreProps.chartConfig.yScale,
  	    plotData = moreProps.plotData;


  	var paths = helper$3(plotData, xAccessor);

  	var begin = true;

  	paths.forEach(function (each) {
  		ctx.strokeStyle = stroke[each.type];
  		ctx.lineWidth = strokeWidth;

  		ctx.beginPath();
  		var prevX = void 0;
  		each.plot.forEach(function (d) {
  			var _ref = [xScale(d[0]), yScale(d[1])],
  			    x = _ref[0],
  			    y = _ref[1];

  			if (begin) {
  				ctx.moveTo(x, y);
  				begin = false;
  			} else {
  				if (isDefined(prevX)) {
  					ctx.lineTo(prevX, y);
  				}
  				ctx.lineTo(x, y);
  			}
  			prevX = x;
  			// console.log(d);
  		});
  		ctx.stroke();
  	});
  	var lastPlot = paths[paths.length - 1].plot;
  	var last$$1 = lastPlot[lastPlot.length - 1];
  	ctx.beginPath();
  	// ctx.strokeStyle = "black";
  	ctx.lineWidth = 1;

  	var _ref2 = [xScale(last$$1[0]), yScale(last$$1[2]), yScale(last$$1[3])],
  	    x = _ref2[0],
  	    y1 = _ref2[1],
  	    y2 = _ref2[2];
  	// console.log(last, x, y);

  	ctx.moveTo(x, y1);
  	ctx.lineTo(x + 10, y1);
  	ctx.stroke();

  	ctx.beginPath();
  	ctx.strokeStyle = currentValueStroke;
  	ctx.moveTo(x - 10, y2);
  	ctx.lineTo(x, y2);
  	ctx.stroke();
  }

  function helper$3(plotData, xAccessor) {
  	var kagiLine = [];
  	var kagi = {};
  	var d = plotData[0];
  	var idx = xAccessor(d);

  	for (var i = 0; i < plotData.length; i++) {
  		d = plotData[i];

  		if (isNotDefined(d.close)) continue;
  		if (isNotDefined(kagi.type)) kagi.type = d.startAs;
  		if (isNotDefined(kagi.plot)) kagi.plot = [];

  		idx = xAccessor(d);
  		kagi.plot.push([idx, d.open]);

  		if (isDefined(d.changeTo)) {
  			kagi.plot.push([idx, d.changePoint]);
  			kagi.added = true;
  			kagiLine.push(kagi);

  			kagi = {
  				type: d.changeTo,
  				plot: [],
  				added: false
  			};
  			kagi.plot.push([idx, d.changePoint]);
  		}
  	}

  	if (!kagi.added) {
  		kagi.plot.push([idx, d.close, d.current, d.reverseAt]);
  		kagiLine.push(kagi);
  	}

  	// console.log(d.reverseAt);

  	return kagiLine;
  }

  var _slicedToArray$12 = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _createClass$24 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$24(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$24(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$24(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var PointAndFigureSeries = function (_Component) {
  	_inherits$24(PointAndFigureSeries, _Component);

  	function PointAndFigureSeries(props) {
  		_classCallCheck$24(this, PointAndFigureSeries);

  		var _this = _possibleConstructorReturn$24(this, (PointAndFigureSeries.__proto__ || Object.getPrototypeOf(PointAndFigureSeries)).call(this, props));

  		_this.renderSVG = _this.renderSVG.bind(_this);
  		_this.drawOnCanvas = _this.drawOnCanvas.bind(_this);
  		return _this;
  	}

  	_createClass$24(PointAndFigureSeries, [{
  		key: "drawOnCanvas",
  		value: function drawOnCanvas(ctx, moreProps) {
  			var xAccessor = moreProps.xAccessor;
  			var xScale = moreProps.xScale,
  			    yScale = moreProps.chartConfig.yScale,
  			    plotData = moreProps.plotData;

  			var columns = getColumns(xScale, xAccessor, yScale, plotData);

  			_drawOnCanvas$4(ctx, this.props, columns);
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var clip = this.props.clip;


  			return React__default.createElement(GenericChartComponent, {
  				clip: clip,
  				svgDraw: this.renderSVG,
  				canvasDraw: this.drawOnCanvas,
  				canvasToDraw: getAxisCanvas,
  				drawOn: ["pan"]
  			});
  		}
  	}, {
  		key: "renderSVG",
  		value: function renderSVG(moreProps) {
  			var xAccessor = moreProps.xAccessor;
  			var xScale = moreProps.xScale,
  			    yScale = moreProps.chartConfig.yScale,
  			    plotData = moreProps.plotData;
  			var _props = this.props,
  			    stroke = _props.stroke,
  			    fill = _props.fill,
  			    strokeWidth = _props.strokeWidth,
  			    className = _props.className;


  			var columns = getColumns(xScale, xAccessor, yScale, plotData);

  			return React__default.createElement(
  				"g",
  				{ className: className },
  				columns.map(function (col, idx) {
  					return React__default.createElement(
  						"g",
  						{ key: idx, className: col.className, transform: "translate(" + col.offset[0] + ", " + col.offset[1] + ")" },
  						col.boxes.map(function (box, i) {
  							if (col.direction > 0) {
  								return React__default.createElement(
  									"g",
  									{ key: idx + "-" + i },
  									React__default.createElement("line", { className: "up", strokeWidth: strokeWidth, stroke: stroke.up, fill: fill.up,
  										x1: 0, y1: box.open, x2: box.columnWidth, y2: box.close }),
  									React__default.createElement("line", { className: "up", strokeWidth: strokeWidth, stroke: stroke.up, fill: fill.up,
  										x1: 0, y1: box.close, x2: box.columnWidth, y2: box.open })
  								);
  							}
  							return React__default.createElement("ellipse", { key: idx + "-" + i,
  								className: "down", strokeWidth: strokeWidth, stroke: stroke.down, fill: fill.down,
  								cx: box.columnWidth / 2, cy: (box.open + box.close) / 2,
  								rx: box.columnWidth / 2, ry: box.boxHeight / 2 });
  						})
  					);
  				})
  			);
  		}
  	}]);

  	return PointAndFigureSeries;
  }(React.Component);

  PointAndFigureSeries.propTypes = {
  	className: PropTypes.string,
  	strokeWidth: PropTypes.number.isRequired,
  	stroke: PropTypes.object.isRequired,
  	fill: PropTypes.object.isRequired,
  	clip: PropTypes.bool.isRequired
  };

  PointAndFigureSeries.defaultProps = {
  	className: "react-stockcharts-point-and-figure",
  	strokeWidth: 1,
  	stroke: {
  		up: "#6BA583",
  		down: "#FF0000"
  	},
  	fill: {
  		up: "none",
  		down: "none"
  	},
  	clip: true
  };

  function _drawOnCanvas$4(ctx, props, columns) {
  	var stroke = props.stroke,
  	    fill = props.fill,
  	    strokeWidth = props.strokeWidth;


  	ctx.lineWidth = strokeWidth;

  	columns.forEach(function (col) {
  		var _col$offset = _slicedToArray$12(col.offset, 2),
  		    offsetX = _col$offset[0],
  		    offsetY = _col$offset[1];

  		col.boxes.forEach(function (box) {
  			if (col.direction > 0) {
  				ctx.fillStyle = fill.up;
  				ctx.strokeStyle = stroke.up;

  				ctx.beginPath();

  				ctx.moveTo(offsetX, offsetY + box.open);
  				ctx.lineTo(offsetX + box.columnWidth, offsetY + box.close);
  				ctx.moveTo(offsetX, offsetY + box.close);
  				ctx.lineTo(offsetX + box.columnWidth, offsetY + box.open);

  				ctx.stroke();
  			} else {
  				ctx.fillStyle = fill.down;
  				ctx.strokeStyle = stroke.down;

  				ctx.beginPath();

  				var x = offsetX + box.columnWidth / 2,
  				    y = offsetY + box.open + box.boxHeight / 2;
  				var rx = box.columnWidth / 2,
  				    ry = box.boxHeight / 2;


  				ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
  				ctx.stroke();
  			}
  		});
  	});

  	ctx.stroke();
  }

  function getColumns(xScale, xAccessor, yScale, plotData) {

  	var width = xScale(xAccessor(plotData[plotData.length - 1])) - xScale(xAccessor(plotData[0]));

  	var columnWidth = width / (plotData.length - 1);

  	var anyBox = void 0,
  	    j = 0;
  	while (isNotDefined(anyBox)) {
  		if (isDefined(plotData[j].close)) {
  			anyBox = plotData[j].boxes[0];
  		} else {
  			break;
  		}
  		j++;
  	}

  	var boxHeight = Math.abs(yScale(anyBox.open) - yScale(anyBox.close));

  	var columns = plotData.filter(function (d) {
  		return isDefined(d.close);
  	}).map(function (d) {
  		var boxes = d.boxes.map(function (box) {
  			return {
  				columnWidth: columnWidth,
  				boxHeight: boxHeight,
  				open: yScale(box.open),
  				close: yScale(box.close)
  			};
  		});

  		var xOffset = xScale(xAccessor(d)) - columnWidth / 2;
  		return {
  			boxes: boxes,
  			direction: d.direction,
  			offset: [xOffset, 0]
  		};
  	});
  	return columns;
  }

  var _createClass$25 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$25(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$25(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$25(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var RenkoSeries = function (_Component) {
  	_inherits$25(RenkoSeries, _Component);

  	function RenkoSeries(props) {
  		_classCallCheck$25(this, RenkoSeries);

  		var _this = _possibleConstructorReturn$25(this, (RenkoSeries.__proto__ || Object.getPrototypeOf(RenkoSeries)).call(this, props));

  		_this.renderSVG = _this.renderSVG.bind(_this);
  		_this.drawOnCanvas = _this.drawOnCanvas.bind(_this);
  		return _this;
  	}

  	_createClass$25(RenkoSeries, [{
  		key: "drawOnCanvas",
  		value: function drawOnCanvas(ctx, moreProps) {
  			var xAccessor = moreProps.xAccessor;
  			var xScale = moreProps.xScale,
  			    yScale = moreProps.chartConfig.yScale,
  			    plotData = moreProps.plotData;
  			var yAccessor = this.props.yAccessor;


  			var candles = getRenko(this.props, plotData, xScale, xAccessor, yScale, yAccessor);

  			_drawOnCanvas$5(ctx, candles);
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var clip = this.props.clip;


  			return React__default.createElement(GenericChartComponent, {
  				clip: clip,
  				svgDraw: this.renderSVG,
  				canvasDraw: this.drawOnCanvas,
  				canvasToDraw: getAxisCanvas,
  				drawOn: ["pan"]
  			});
  		}
  	}, {
  		key: "renderSVG",
  		value: function renderSVG(moreProps) {
  			var xAccessor = moreProps.xAccessor;
  			var xScale = moreProps.xScale,
  			    yScale = moreProps.chartConfig.yScale,
  			    plotData = moreProps.plotData;
  			var yAccessor = this.props.yAccessor;


  			var candles = getRenko(this.props, plotData, xScale, xAccessor, yScale, yAccessor).map(function (each, idx) {
  				return React__default.createElement("rect", { key: idx, className: each.className,
  					fill: each.fill,
  					x: each.x,
  					y: each.y,
  					width: each.width,
  					height: each.height });
  			});

  			return React__default.createElement(
  				"g",
  				null,
  				React__default.createElement(
  					"g",
  					{ className: "candle" },
  					candles
  				)
  			);
  		}
  	}]);

  	return RenkoSeries;
  }(React.Component);

  RenkoSeries.propTypes = {
  	classNames: PropTypes.shape({
  		up: PropTypes.string,
  		down: PropTypes.string
  	}),
  	stroke: PropTypes.shape({
  		up: PropTypes.string,
  		down: PropTypes.string
  	}),
  	fill: PropTypes.shape({
  		up: PropTypes.string,
  		down: PropTypes.string,
  		partial: PropTypes.string
  	}),
  	yAccessor: PropTypes.func.isRequired,
  	clip: PropTypes.bool.isRequired
  };

  RenkoSeries.defaultProps = {
  	classNames: {
  		up: "up",
  		down: "down"
  	},
  	stroke: {
  		up: "none",
  		down: "none"
  	},
  	fill: {
  		up: "#6BA583",
  		down: "#E60000",
  		partial: "#4682B4"
  	},
  	yAccessor: function yAccessor(d) {
  		return { open: d.open, high: d.high, low: d.low, close: d.close };
  	},
  	clip: true
  };

  function _drawOnCanvas$5(ctx, renko) {
  	renko.forEach(function (d) {
  		ctx.beginPath();

  		ctx.strokeStyle = d.stroke;
  		ctx.fillStyle = d.fill;

  		ctx.rect(d.x, d.y, d.width, d.height);
  		ctx.closePath();
  		ctx.fill();
  	});
  }

  function getRenko(props, plotData, xScale, xAccessor, yScale, yAccessor) {
  	var classNames = props.classNames,
  	    fill = props.fill;

  	var width = xScale(xAccessor(plotData[plotData.length - 1])) - xScale(xAccessor(plotData[0]));

  	var candleWidth = width / (plotData.length - 1);
  	var candles = plotData.filter(function (d) {
  		return isDefined(yAccessor(d).close);
  	}).map(function (d) {
  		var ohlc = yAccessor(d);
  		var x = xScale(xAccessor(d)) - 0.5 * candleWidth,
  		    y = yScale(Math.max(ohlc.open, ohlc.close)),
  		    height = Math.abs(yScale(ohlc.open) - yScale(ohlc.close)),
  		    className = ohlc.open <= ohlc.close ? classNames.up : classNames.down;

  		var svgfill = d.fullyFormed ? ohlc.open <= ohlc.close ? fill.up : fill.down : fill.partial;

  		return {
  			className: className,
  			fill: svgfill,
  			x: x,
  			y: y,
  			height: height,
  			width: candleWidth
  		};
  	});
  	return candles;
  }

  var _extends$13 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  var _createClass$26 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$26(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$26(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$26(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var StraightLine = function (_Component) {
  	_inherits$26(StraightLine, _Component);

  	function StraightLine(props) {
  		_classCallCheck$26(this, StraightLine);

  		var _this = _possibleConstructorReturn$26(this, (StraightLine.__proto__ || Object.getPrototypeOf(StraightLine)).call(this, props));

  		_this.renderSVG = _this.renderSVG.bind(_this);
  		_this.drawOnCanvas = _this.drawOnCanvas.bind(_this);
  		return _this;
  	}

  	_createClass$26(StraightLine, [{
  		key: "drawOnCanvas",
  		value: function drawOnCanvas(ctx, moreProps) {
  			var _props = this.props,
  			    type = _props.type,
  			    stroke = _props.stroke,
  			    strokeWidth = _props.strokeWidth,
  			    opacity = _props.opacity,
  			    strokeDasharray = _props.strokeDasharray;
  			var _props2 = this.props,
  			    yValue = _props2.yValue,
  			    xValue = _props2.xValue;
  			var xScale = moreProps.xScale;
  			var _moreProps$chartConfi = moreProps.chartConfig,
  			    yScale = _moreProps$chartConfi.yScale,
  			    width = _moreProps$chartConfi.width,
  			    height = _moreProps$chartConfi.height;


  			ctx.beginPath();

  			ctx.strokeStyle = hexToRGBA(stroke, opacity);
  			ctx.lineWidth = strokeWidth;

  			var _getLineCoordinates = getLineCoordinates(type, xScale, yScale, xValue, yValue, width, height),
  			    x1 = _getLineCoordinates.x1,
  			    y1 = _getLineCoordinates.y1,
  			    x2 = _getLineCoordinates.x2,
  			    y2 = _getLineCoordinates.y2;

  			ctx.setLineDash(getStrokeDasharray(strokeDasharray).split(","));
  			ctx.moveTo(x1, y1);
  			ctx.lineTo(x2, y2);
  			ctx.stroke();
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			return React__default.createElement(GenericChartComponent, {
  				svgDraw: this.renderSVG,
  				canvasDraw: this.drawOnCanvas,
  				canvasToDraw: getAxisCanvas,
  				drawOn: ["pan"]
  			});
  		}
  	}, {
  		key: "renderSVG",
  		value: function renderSVG(moreProps) {
  			var width = moreProps.width,
  			    height = moreProps.height;
  			var xScale = moreProps.xScale,
  			    yScale = moreProps.chartConfig.yScale;
  			var className = this.props.className;
  			var _props3 = this.props,
  			    type = _props3.type,
  			    stroke = _props3.stroke,
  			    strokeWidth = _props3.strokeWidth,
  			    opacity = _props3.opacity,
  			    strokeDasharray = _props3.strokeDasharray;
  			var _props4 = this.props,
  			    yValue = _props4.yValue,
  			    xValue = _props4.xValue;


  			var lineCoordinates = getLineCoordinates(type, xScale, yScale, xValue, yValue, width, height);

  			return React__default.createElement("line", _extends$13({
  				className: className,
  				strokeDasharray: getStrokeDasharray(strokeDasharray),
  				stroke: stroke,
  				strokeWidth: strokeWidth,
  				strokeOpacity: opacity
  			}, lineCoordinates));
  		}
  	}]);

  	return StraightLine;
  }(React.Component);

  function getLineCoordinates(type, xScale, yScale, xValue, yValue, width, height) {
  	return type === "horizontal" ? { x1: 0, y1: Math.round(yScale(yValue)), x2: width, y2: Math.round(yScale(yValue)) } : { x1: Math.round(xScale(xValue)), y1: 0, x2: Math.round(xScale(xValue)), y2: height };
  }

  StraightLine.propTypes = {
  	className: PropTypes.string,
  	type: PropTypes.oneOf(["vertical", "horizontal"]),
  	stroke: PropTypes.string,
  	strokeWidth: PropTypes.number,
  	strokeDasharray: PropTypes.oneOf(strokeDashTypes),
  	opacity: PropTypes.number.isRequired,
  	yValue: function yValue(props, propName /* , componentName */) {
  		if (props.type === "vertical" && isDefined(props[propName])) return new Error("Do not define `yValue` when type is `vertical`, define the `xValue` prop");
  		if (props.type === "horizontal" && isNotDefined(props[propName])) return new Error("when type = `horizontal` `yValue` is required");
  		// if (isDefined(props[propName]) && typeof props[propName] !== "number") return new Error("prop `yValue` accepts a number");
  	},
  	xValue: function xValue(props, propName /* , componentName */) {
  		if (props.type === "horizontal" && isDefined(props[propName])) return new Error("Do not define `xValue` when type is `horizontal`, define the `yValue` prop");
  		if (props.type === "vertical" && isNotDefined(props[propName])) return new Error("when type = `vertical` `xValue` is required");
  		// if (isDefined(props[propName]) && typeof props[propName] !== "number") return new Error("prop `xValue` accepts a number");
  	}
  };

  StraightLine.defaultProps = {
  	className: "line ",
  	type: "horizontal",
  	stroke: "#000000",
  	opacity: 0.5,
  	strokeWidth: 1,
  	strokeDasharray: "Solid"
  };

  var _createClass$27 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$27(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$27(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$27(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var MACDSeries = function (_Component) {
  	_inherits$27(MACDSeries, _Component);

  	function MACDSeries(props) {
  		_classCallCheck$27(this, MACDSeries);

  		var _this = _possibleConstructorReturn$27(this, (MACDSeries.__proto__ || Object.getPrototypeOf(MACDSeries)).call(this, props));

  		_this.yAccessorForMACD = _this.yAccessorForMACD.bind(_this);
  		_this.yAccessorForSignal = _this.yAccessorForSignal.bind(_this);
  		_this.yAccessorForDivergence = _this.yAccessorForDivergence.bind(_this);
  		_this.yAccessorForDivergenceBase = _this.yAccessorForDivergenceBase.bind(_this);
  		return _this;
  	}

  	_createClass$27(MACDSeries, [{
  		key: "yAccessorForMACD",
  		value: function yAccessorForMACD(d) {
  			var yAccessor = this.props.yAccessor;

  			return yAccessor(d) && yAccessor(d).macd;
  		}
  	}, {
  		key: "yAccessorForSignal",
  		value: function yAccessorForSignal(d) {
  			var yAccessor = this.props.yAccessor;

  			return yAccessor(d) && yAccessor(d).signal;
  		}
  	}, {
  		key: "yAccessorForDivergence",
  		value: function yAccessorForDivergence(d) {
  			var yAccessor = this.props.yAccessor;

  			return yAccessor(d) && yAccessor(d).divergence;
  		}
  	}, {
  		key: "yAccessorForDivergenceBase",
  		value: function yAccessorForDivergenceBase(xScale, yScale /* , d */) {
  			return yScale(0);
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var _props = this.props,
  			    className = _props.className,
  			    opacity = _props.opacity,
  			    divergenceStroke = _props.divergenceStroke,
  			    widthRatio = _props.widthRatio,
  			    width = _props.width;
  			var _props2 = this.props,
  			    stroke = _props2.stroke,
  			    fill = _props2.fill;
  			var clip = this.props.clip;
  			var _props3 = this.props,
  			    zeroLineStroke = _props3.zeroLineStroke,
  			    zeroLineOpacity = _props3.zeroLineOpacity;


  			return React__default.createElement(
  				"g",
  				{ className: className },
  				React__default.createElement(BarSeries, {
  					baseAt: this.yAccessorForDivergenceBase,
  					className: "macd-divergence",
  					width: width,
  					widthRatio: widthRatio,
  					stroke: divergenceStroke,
  					fill: fill.divergence,
  					opacity: opacity,
  					clip: clip,
  					yAccessor: this.yAccessorForDivergence }),
  				React__default.createElement(LineSeries, {
  					yAccessor: this.yAccessorForMACD,
  					stroke: stroke.macd,
  					fill: "none" }),
  				React__default.createElement(LineSeries, {
  					yAccessor: this.yAccessorForSignal,
  					stroke: stroke.signal,
  					fill: "none" }),
  				React__default.createElement(StraightLine, {
  					stroke: zeroLineStroke,
  					opacity: zeroLineOpacity,
  					yValue: 0 })
  			);
  		}
  	}]);

  	return MACDSeries;
  }(React.Component);

  MACDSeries.propTypes = {
  	className: PropTypes.string,
  	yAccessor: PropTypes.func.isRequired,
  	opacity: PropTypes.number,
  	divergenceStroke: PropTypes.bool,
  	zeroLineStroke: PropTypes.string,
  	zeroLineOpacity: PropTypes.number,
  	clip: PropTypes.bool.isRequired,
  	stroke: PropTypes.shape({
  		macd: PropTypes.string.isRequired,
  		signal: PropTypes.string.isRequired
  	}).isRequired,
  	fill: PropTypes.shape({
  		divergence: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired
  	}).isRequired,
  	widthRatio: PropTypes.number,
  	width: BarSeries.propTypes.width
  };

  MACDSeries.defaultProps = {
  	className: "react-stockcharts-macd-series",
  	zeroLineStroke: "#000000",
  	zeroLineOpacity: 0.3,
  	opacity: 0.6,
  	divergenceStroke: false,
  	clip: true,
  	widthRatio: 0.5,
  	width: BarSeries.defaultProps.width
  };

  var _createClass$28 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$28(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$28(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$28(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var BollingerSeries = function (_Component) {
  	_inherits$28(BollingerSeries, _Component);

  	function BollingerSeries(props) {
  		_classCallCheck$28(this, BollingerSeries);

  		var _this = _possibleConstructorReturn$28(this, (BollingerSeries.__proto__ || Object.getPrototypeOf(BollingerSeries)).call(this, props));

  		_this.yAccessorForTop = _this.yAccessorForTop.bind(_this);
  		_this.yAccessorForMiddle = _this.yAccessorForMiddle.bind(_this);
  		_this.yAccessorForBottom = _this.yAccessorForBottom.bind(_this);
  		_this.yAccessorForScalledBottom = _this.yAccessorForScalledBottom.bind(_this);
  		return _this;
  	}

  	_createClass$28(BollingerSeries, [{
  		key: "yAccessorForTop",
  		value: function yAccessorForTop(d) {
  			var yAccessor = this.props.yAccessor;

  			return yAccessor(d) && yAccessor(d).top;
  		}
  	}, {
  		key: "yAccessorForMiddle",
  		value: function yAccessorForMiddle(d) {
  			var yAccessor = this.props.yAccessor;

  			return yAccessor(d) && yAccessor(d).middle;
  		}
  	}, {
  		key: "yAccessorForBottom",
  		value: function yAccessorForBottom(d) {
  			var yAccessor = this.props.yAccessor;

  			return yAccessor(d) && yAccessor(d).bottom;
  		}
  	}, {
  		key: "yAccessorForScalledBottom",
  		value: function yAccessorForScalledBottom(scale, d) {
  			var yAccessor = this.props.yAccessor;

  			return scale(yAccessor(d) && yAccessor(d).bottom);
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var _props = this.props,
  			    areaClassName = _props.areaClassName,
  			    className = _props.className,
  			    opacity = _props.opacity;
  			var _props2 = this.props,
  			    stroke = _props2.stroke,
  			    fill = _props2.fill;


  			return React__default.createElement(
  				"g",
  				{ className: className },
  				React__default.createElement(LineSeries, { yAccessor: this.yAccessorForTop,
  					stroke: stroke.top, fill: "none" }),
  				React__default.createElement(LineSeries, { yAccessor: this.yAccessorForMiddle,
  					stroke: stroke.middle, fill: "none" }),
  				React__default.createElement(LineSeries, { yAccessor: this.yAccessorForBottom,
  					stroke: stroke.bottom, fill: "none" }),
  				React__default.createElement(AreaOnlySeries, { className: areaClassName,
  					yAccessor: this.yAccessorForTop,
  					base: this.yAccessorForScalledBottom,
  					stroke: "none", fill: fill,
  					opacity: opacity })
  			);
  		}
  	}]);

  	return BollingerSeries;
  }(React.Component);

  BollingerSeries.propTypes = {
  	yAccessor: PropTypes.func.isRequired,
  	className: PropTypes.string,
  	areaClassName: PropTypes.string,
  	opacity: PropTypes.number,
  	type: PropTypes.string,
  	stroke: PropTypes.shape({
  		top: PropTypes.string.isRequired,
  		middle: PropTypes.string.isRequired,
  		bottom: PropTypes.string.isRequired
  	}).isRequired,
  	fill: PropTypes.string.isRequired
  };

  BollingerSeries.defaultProps = {
  	className: "react-stockcharts-bollinger-band-series",
  	areaClassName: "react-stockcharts-bollinger-band-series-area",
  	opacity: 0.2
  };

  var _createClass$29 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$29(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$29(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$29(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var RSISeries = function (_Component) {
  	_inherits$29(RSISeries, _Component);

  	function RSISeries(props) {
  		_classCallCheck$29(this, RSISeries);

  		var _this = _possibleConstructorReturn$29(this, (RSISeries.__proto__ || Object.getPrototypeOf(RSISeries)).call(this, props));

  		_this.renderClip = _this.renderClip.bind(_this);
  		_this.topAndBottomClip = _this.topAndBottomClip.bind(_this);
  		_this.mainClip = _this.mainClip.bind(_this);

  		var id1 = String(Math.round(Math.random() * 10000 * 10000));
  		_this.clipPathId1 = "rsi-clip-" + id1;

  		var id2 = String(Math.round(Math.random() * 10000 * 10000));
  		_this.clipPathId2 = "rsi-clip-" + id2;
  		return _this;
  	}

  	_createClass$29(RSISeries, [{
  		key: "topAndBottomClip",
  		value: function topAndBottomClip(ctx, moreProps) {
  			var chartConfig = moreProps.chartConfig;
  			var _props = this.props,
  			    overSold = _props.overSold,
  			    overBought = _props.overBought;
  			var yScale = chartConfig.yScale,
  			    width = chartConfig.width;


  			ctx.beginPath();
  			ctx.rect(0, yScale(overSold), width, yScale(overBought) - yScale(overSold));
  			ctx.clip();
  		}
  	}, {
  		key: "mainClip",
  		value: function mainClip(ctx, moreProps) {
  			var chartConfig = moreProps.chartConfig;
  			var _props2 = this.props,
  			    overSold = _props2.overSold,
  			    overBought = _props2.overBought;
  			var yScale = chartConfig.yScale,
  			    width = chartConfig.width,
  			    height = chartConfig.height;


  			ctx.beginPath();
  			ctx.rect(0, 0, width, yScale(overSold));
  			ctx.rect(0, yScale(overBought), width, height - yScale(overBought));
  			ctx.clip();
  		}
  	}, {
  		key: "renderClip",
  		value: function renderClip(moreProps) {
  			var chartConfig = moreProps.chartConfig;
  			var _props3 = this.props,
  			    overSold = _props3.overSold,
  			    overBought = _props3.overBought;
  			var yScale = chartConfig.yScale,
  			    width = chartConfig.width,
  			    height = chartConfig.height;


  			return React__default.createElement(
  				"defs",
  				null,
  				React__default.createElement(
  					"clipPath",
  					{ id: this.clipPathId1 },
  					React__default.createElement("rect", {
  						x: 0,
  						y: yScale(overSold),
  						width: width,
  						height: yScale(overBought) - yScale(overSold)
  					})
  				),
  				React__default.createElement(
  					"clipPath",
  					{ id: this.clipPathId2 },
  					React__default.createElement("rect", {
  						x: 0,
  						y: 0,
  						width: width,
  						height: yScale(overSold)
  					}),
  					React__default.createElement("rect", {
  						x: 0,
  						y: yScale(overBought),
  						width: width,
  						height: height - yScale(overBought)
  					})
  				)
  			);
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var _props4 = this.props,
  			    className = _props4.className,
  			    stroke = _props4.stroke,
  			    opacity = _props4.opacity,
  			    strokeDasharray = _props4.strokeDasharray,
  			    strokeWidth = _props4.strokeWidth;
  			var yAccessor = this.props.yAccessor;
  			var _props5 = this.props,
  			    overSold = _props5.overSold,
  			    middle = _props5.middle,
  			    overBought = _props5.overBought;


  			var style1 = { "clipPath": "url(#" + this.clipPathId1 + ")" };
  			var style2 = { "clipPath": "url(#" + this.clipPathId2 + ")" };

  			return React__default.createElement(
  				"g",
  				{ className: className },
  				React__default.createElement(
  					SVGComponent,
  					null,
  					this.renderClip
  				),
  				React__default.createElement(StraightLine, {
  					stroke: stroke.top,
  					opacity: opacity.top,
  					yValue: overSold,
  					strokeDasharray: strokeDasharray.top,
  					strokeWidth: strokeWidth.top
  				}),
  				React__default.createElement(StraightLine, {
  					stroke: stroke.middle,
  					opacity: opacity.middle,
  					yValue: middle,
  					strokeDasharray: strokeDasharray.middle,
  					strokeWidth: strokeWidth.middle
  				}),
  				React__default.createElement(StraightLine, {
  					stroke: stroke.bottom,
  					opacity: opacity.bottom,
  					yValue: overBought,
  					strokeDasharray: strokeDasharray.bottom,
  					strokeWidth: strokeWidth.bottom
  				}),
  				React__default.createElement(LineSeries, {
  					style: style1,
  					canvasClip: this.topAndBottomClip,

  					className: className,
  					yAccessor: yAccessor,
  					stroke: stroke.insideThreshold || stroke.line,
  					strokeWidth: strokeWidth.insideThreshold,
  					strokeDasharray: strokeDasharray.line
  				}),
  				React__default.createElement(LineSeries, {
  					style: style2,
  					canvasClip: this.mainClip
  					/* baseAt={yScale => yScale(middle)} */
  					, className: className,
  					yAccessor: yAccessor,
  					stroke: stroke.outsideThreshold || stroke.line,
  					strokeWidth: strokeWidth.outsideThreshold,
  					strokeDasharray: strokeDasharray.line
  					/* fill={stroke.outsideThreshold || stroke.line} */
  				})
  			);
  		}
  	}]);

  	return RSISeries;
  }(React.Component);

  RSISeries.propTypes = {
  	className: PropTypes.string,
  	yAccessor: PropTypes.func.isRequired,
  	stroke: PropTypes.shape({
  		top: PropTypes.string.isRequired,
  		middle: PropTypes.string.isRequired,
  		bottom: PropTypes.string.isRequired,
  		outsideThreshold: PropTypes.string.isRequired,
  		insideThreshold: PropTypes.string.isRequired
  	}).isRequired,
  	opacity: PropTypes.shape({
  		top: PropTypes.number.isRequired,
  		middle: PropTypes.number.isRequired,
  		bottom: PropTypes.number.isRequired
  	}).isRequired,
  	strokeDasharray: PropTypes.shape({
  		line: PropTypes.oneOf(strokeDashTypes),
  		top: PropTypes.oneOf(strokeDashTypes),
  		middle: PropTypes.oneOf(strokeDashTypes),
  		bottom: PropTypes.oneOf(strokeDashTypes)
  	}).isRequired,
  	strokeWidth: PropTypes.shape({
  		outsideThreshold: PropTypes.number.isRequired,
  		insideThreshold: PropTypes.number.isRequired,
  		top: PropTypes.number.isRequired,
  		middle: PropTypes.number.isRequired,
  		bottom: PropTypes.number.isRequired
  	}).isRequired,
  	overSold: PropTypes.number.isRequired,
  	middle: PropTypes.number.isRequired,
  	overBought: PropTypes.number.isRequired
  };

  RSISeries.defaultProps = {
  	className: "react-stockcharts-rsi-series",
  	stroke: {
  		line: "#000000",
  		top: "#B8C2CC",
  		middle: "#8795A1",
  		bottom: "#B8C2CC",
  		outsideThreshold: "#b300b3",
  		insideThreshold: "#ffccff"
  	},
  	opacity: {
  		top: 1,
  		middle: 1,
  		bottom: 1
  	},
  	strokeDasharray: {
  		line: "Solid",
  		top: "ShortDash",
  		middle: "ShortDash",
  		bottom: "ShortDash"
  	},
  	strokeWidth: {
  		outsideThreshold: 1,
  		insideThreshold: 1,
  		top: 1,
  		middle: 1,
  		bottom: 1
  	},
  	overSold: 70,
  	middle: 50,
  	overBought: 30
  };

  var _createClass$30 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$30(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$30(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$30(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var StochasticSeries = function (_Component) {
  	_inherits$30(StochasticSeries, _Component);

  	function StochasticSeries(props) {
  		_classCallCheck$30(this, StochasticSeries);

  		var _this = _possibleConstructorReturn$30(this, (StochasticSeries.__proto__ || Object.getPrototypeOf(StochasticSeries)).call(this, props));

  		_this.yAccessorForD = _this.yAccessorForD.bind(_this);
  		_this.yAccessorForK = _this.yAccessorForK.bind(_this);
  		return _this;
  	}

  	_createClass$30(StochasticSeries, [{
  		key: "yAccessorForD",
  		value: function yAccessorForD(d) {
  			var yAccessor = this.props.yAccessor;

  			return yAccessor(d) && yAccessor(d).D;
  		}
  	}, {
  		key: "yAccessorForK",
  		value: function yAccessorForK(d) {
  			var yAccessor = this.props.yAccessor;

  			return yAccessor(d) && yAccessor(d).K;
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var _props = this.props,
  			    className = _props.className,
  			    stroke = _props.stroke,
  			    refLineOpacity = _props.refLineOpacity;
  			var _props2 = this.props,
  			    overSold = _props2.overSold,
  			    middle = _props2.middle,
  			    overBought = _props2.overBought;

  			return React__default.createElement(
  				"g",
  				{ className: className },
  				React__default.createElement(LineSeries, { yAccessor: this.yAccessorForD,
  					stroke: stroke.dLine,
  					fill: "none" }),
  				React__default.createElement(LineSeries, { yAccessor: this.yAccessorForK,
  					stroke: stroke.kLine,
  					fill: "none" }),
  				React__default.createElement(StraightLine, {
  					stroke: stroke.top,
  					opacity: refLineOpacity,
  					yValue: overSold }),
  				React__default.createElement(StraightLine, {
  					stroke: stroke.middle,
  					opacity: refLineOpacity,
  					yValue: middle }),
  				React__default.createElement(StraightLine, {
  					stroke: stroke.bottom,
  					opacity: refLineOpacity,
  					yValue: overBought })
  			);
  		}
  	}]);

  	return StochasticSeries;
  }(React.Component);

  StochasticSeries.propTypes = {
  	className: PropTypes.string,
  	yAccessor: PropTypes.func.isRequired,
  	stroke: PropTypes.shape({
  		top: PropTypes.string.isRequired,
  		middle: PropTypes.string.isRequired,
  		bottom: PropTypes.string.isRequired,
  		dLine: PropTypes.string.isRequired,
  		kLine: PropTypes.string.isRequired
  	}).isRequired,
  	overSold: PropTypes.number.isRequired,
  	middle: PropTypes.number.isRequired,
  	overBought: PropTypes.number.isRequired,
  	refLineOpacity: PropTypes.number.isRequired
  };

  StochasticSeries.defaultProps = {
  	className: "react-stockcharts-stochastic-series",
  	stroke: {
  		top: "#964B00",
  		middle: "#000000",
  		bottom: "#964B00",
  		dLine: "#EA2BFF",
  		kLine: "#74D400"
  	},
  	overSold: 80,
  	middle: 50,
  	overBought: 20,
  	refLineOpacity: 0.3
  };

  var _createClass$31 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$31(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$31(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$31(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var OverlayBarSeries = function (_Component) {
  	_inherits$31(OverlayBarSeries, _Component);

  	function OverlayBarSeries(props) {
  		_classCallCheck$31(this, OverlayBarSeries);

  		var _this = _possibleConstructorReturn$31(this, (OverlayBarSeries.__proto__ || Object.getPrototypeOf(OverlayBarSeries)).call(this, props));

  		_this.renderSVG = _this.renderSVG.bind(_this);
  		_this.drawOnCanvas = _this.drawOnCanvas.bind(_this);
  		return _this;
  	}

  	_createClass$31(OverlayBarSeries, [{
  		key: "drawOnCanvas",
  		value: function drawOnCanvas(ctx, moreProps) {
  			var yAccessor = this.props.yAccessor;

  			var bars = getBars$2(this.props, moreProps, yAccessor);

  			drawOnCanvas2(this.props, ctx, bars);
  		}
  	}, {
  		key: "renderSVG",
  		value: function renderSVG(moreProps) {
  			var yAccessor = this.props.yAccessor;


  			var bars = getBars$2(this.props, moreProps, yAccessor);
  			return React__default.createElement(
  				"g",
  				{ className: "react-stockcharts-bar-series" },
  				getBarsSVG2(this.props, bars)
  			);
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var clip = this.props.clip;


  			return React__default.createElement(GenericChartComponent, {
  				svgDraw: this.renderSVG,
  				canvasToDraw: getAxisCanvas,
  				canvasDraw: this.drawOnCanvas,
  				clip: clip,
  				drawOn: ["pan"]
  			});
  		}
  	}]);

  	return OverlayBarSeries;
  }(React.Component);

  OverlayBarSeries.propTypes = {
  	baseAt: PropTypes.oneOfType([PropTypes.number, PropTypes.func]).isRequired,
  	direction: PropTypes.oneOf(["up", "down"]).isRequired,
  	stroke: PropTypes.bool.isRequired,
  	widthRatio: PropTypes.number.isRequired,
  	opacity: PropTypes.number.isRequired,
  	fill: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
  	className: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
  	xAccessor: PropTypes.func,
  	yAccessor: PropTypes.arrayOf(PropTypes.func),
  	xScale: PropTypes.func,
  	yScale: PropTypes.func,
  	plotData: PropTypes.array,
  	clip: PropTypes.bool.isRequired
  };

  OverlayBarSeries.defaultProps = {
  	baseAt: function baseAt(xScale, yScale /* , d*/) {
  		return first(yScale.range());
  	},
  	direction: "up",
  	className: "bar",
  	stroke: false,
  	fill: "#4682B4",
  	opacity: 1,
  	widthRatio: 0.5,
  	width: plotDataLengthBarWidth$$1,
  	clip: true
  };

  function getBars$2(props, moreProps, yAccessor) {
  	var xScale = moreProps.xScale,
  	    xAccessor = moreProps.xAccessor,
  	    yScale = moreProps.chartConfig.yScale,
  	    plotData = moreProps.plotData;
  	var baseAt = props.baseAt,
  	    className = props.className,
  	    fill = props.fill,
  	    stroke = props.stroke;


  	var getClassName = functor(className);
  	var getFill = functor(fill);
  	var getBase = functor(baseAt);
  	var widthFunctor = functor(props.width);

  	var width = widthFunctor(props, moreProps);
  	var offset = Math.floor(0.5 * width);

  	// console.log(xScale.domain(), yScale.domain());

  	var bars = plotData.map(function (d) {
  		// eslint-disable-next-line prefer-const
  		var innerBars = yAccessor.map(function (eachYAccessor, i) {
  			var yValue = eachYAccessor(d);
  			if (isNotDefined(yValue)) return undefined;

  			var xValue = xAccessor(d);
  			var x = Math.round(xScale(xValue)) - offset;
  			var y = yScale(yValue);
  			// console.log(yValue, y, xValue, x)
  			return {
  				width: offset * 2,
  				x: x,
  				y: y,
  				className: getClassName(d, i),
  				stroke: stroke ? getFill(d, i) : "none",
  				fill: getFill(d, i),
  				i: i
  			};
  		}).filter(function (yValue) {
  			return isDefined(yValue);
  		});

  		var b = getBase(xScale, yScale, d);
  		var h = void 0;
  		for (var i = innerBars.length - 1; i >= 0; i--) {
  			h = b - innerBars[i].y;
  			if (h < 0) {
  				innerBars[i].y = b;
  				h = -1 * h;
  			}
  			innerBars[i].height = h;
  			b = innerBars[i].y;
  		}
  		return innerBars;
  	});

  	return merge(bars);
  }

  var _createClass$32 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$32(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$32(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$32(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var ElderRaySeries = function (_Component) {
  	_inherits$32(ElderRaySeries, _Component);

  	function ElderRaySeries(props) {
  		_classCallCheck$32(this, ElderRaySeries);

  		var _this = _possibleConstructorReturn$32(this, (ElderRaySeries.__proto__ || Object.getPrototypeOf(ElderRaySeries)).call(this, props));

  		_this.fillForEachBar = _this.fillForEachBar.bind(_this);
  		_this.yAccessorTop = _this.yAccessorTop.bind(_this);
  		_this.yAccessorBullTop = _this.yAccessorBullTop.bind(_this);
  		_this.yAccessorBearTop = _this.yAccessorBearTop.bind(_this);
  		_this.yAccessorBullBottom = _this.yAccessorBullBottom.bind(_this);
  		_this.yAccessorBearBottom = _this.yAccessorBearBottom.bind(_this);
  		_this.yAccessorForBarBase = _this.yAccessorForBarBase.bind(_this);
  		return _this;
  	}

  	_createClass$32(ElderRaySeries, [{
  		key: "yAccessorTop",
  		value: function yAccessorTop(d) {
  			var yAccessor = this.props.yAccessor;

  			return yAccessor(d) && Math.max(yAccessor(d).bullPower, 0);
  		}
  	}, {
  		key: "yAccessorBullTop",
  		value: function yAccessorBullTop(d) {
  			var yAccessor = this.props.yAccessor;

  			return yAccessor(d) && (yAccessor(d).bullPower > 0 ? yAccessor(d).bullPower : undefined);
  		}
  	}, {
  		key: "yAccessorBearTop",
  		value: function yAccessorBearTop(d) {
  			var yAccessor = this.props.yAccessor;

  			return yAccessor(d) && (yAccessor(d).bearPower > 0 ? yAccessor(d).bearPower : undefined);
  		}
  	}, {
  		key: "yAccessorBullBottom",
  		value: function yAccessorBullBottom(d) {
  			var yAccessor = this.props.yAccessor;

  			return yAccessor(d) && (yAccessor(d).bullPower < 0 ? 0 : undefined);
  		}
  	}, {
  		key: "yAccessorBearBottom",
  		value: function yAccessorBearBottom(d) {
  			var yAccessor = this.props.yAccessor;

  			return yAccessor(d) && (yAccessor(d).bullPower < 0 || yAccessor(d).bullPower * yAccessor(d).bearPower < 0 // bullPower is +ve and bearPower is -ve
  			? Math.min(0, yAccessor(d).bullPower) : undefined);
  		}
  	}, {
  		key: "yAccessorForBarBase",
  		value: function yAccessorForBarBase(xScale, yScale, d) {
  			var yAccessor = this.props.yAccessor;

  			var y = yAccessor(d) && Math.min(yAccessor(d).bearPower, 0);
  			return yScale(y);
  		}
  	}, {
  		key: "fillForEachBar",
  		value: function fillForEachBar(d, yAccessorNumber) {
  			var _props = this.props,
  			    bullPowerFill = _props.bullPowerFill,
  			    bearPowerFill = _props.bearPowerFill;

  			return yAccessorNumber % 2 === 0 ? bullPowerFill : bearPowerFill;
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var _props2 = this.props,
  			    className = _props2.className,
  			    opacity = _props2.opacity,
  			    stroke = _props2.stroke,
  			    straightLineStroke = _props2.straightLineStroke,
  			    straightLineOpacity = _props2.straightLineOpacity,
  			    widthRatio = _props2.widthRatio;
  			var clip = this.props.clip;


  			return React__default.createElement(
  				"g",
  				{ className: className },
  				React__default.createElement(OverlayBarSeries, {
  					baseAt: this.yAccessorForBarBase,
  					className: "react-stockcharts-elderray-bar",
  					stroke: stroke,
  					fill: this.fillForEachBar,
  					opacity: opacity,
  					widthRatio: widthRatio,
  					clip: clip,
  					yAccessor: [this.yAccessorBullTop, this.yAccessorBearTop, this.yAccessorBullBottom, this.yAccessorBearBottom] }),
  				React__default.createElement(StraightLine, {
  					className: "react-stockcharts-elderray-straight-line",
  					yValue: 0,
  					stroke: straightLineStroke,
  					opacity: straightLineOpacity })
  			);
  		}
  	}]);

  	return ElderRaySeries;
  }(React.Component);

  ElderRaySeries.propTypes = {
  	className: PropTypes.string,
  	yAccessor: PropTypes.func,
  	opacity: PropTypes.number,
  	stroke: PropTypes.bool,
  	bullPowerFill: PropTypes.string,
  	bearPowerFill: PropTypes.string,
  	straightLineStroke: PropTypes.string,
  	straightLineOpacity: PropTypes.number,
  	widthRatio: PropTypes.number,
  	clip: PropTypes.bool.isRequired
  };

  ElderRaySeries.defaultProps = {
  	className: "react-stockcharts-elderray-series",
  	straightLineStroke: "#000000",
  	straightLineOpacity: 0.3,
  	opacity: 0.5,
  	stroke: true,
  	bullPowerFill: "#6BA583",
  	bearPowerFill: "#FF0000",
  	widthRatio: 0.8,
  	clip: true
  };

  var _slicedToArray$13 = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _extends$14 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  var _createClass$33 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$33(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$33(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$33(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var VolumeProfileSeries = function (_Component) {
  	_inherits$33(VolumeProfileSeries, _Component);

  	function VolumeProfileSeries(props) {
  		_classCallCheck$33(this, VolumeProfileSeries);

  		var _this = _possibleConstructorReturn$33(this, (VolumeProfileSeries.__proto__ || Object.getPrototypeOf(VolumeProfileSeries)).call(this, props));

  		_this.renderSVG = _this.renderSVG.bind(_this);
  		_this.drawOnCanvas = _this.drawOnCanvas.bind(_this);
  		return _this;
  	}

  	_createClass$33(VolumeProfileSeries, [{
  		key: "drawOnCanvas",
  		value: function drawOnCanvas(ctx, moreProps) {
  			var xAccessor = moreProps.xAccessor,
  			    width = moreProps.width;

  			var _helper = helper$4(this.props, moreProps, xAccessor, width),
  			    rects = _helper.rects,
  			    sessionBg = _helper.sessionBg;

  			_drawOnCanvas$6(ctx, this.props, rects, sessionBg);
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			return React__default.createElement(GenericChartComponent, {
  				svgDraw: this.renderSVG,
  				canvasDraw: this.drawOnCanvas,
  				canvasToDraw: getAxisCanvas,
  				drawOn: ["pan"]
  			});
  		}
  	}, {
  		key: "renderSVG",
  		value: function renderSVG(moreProps) {
  			var _props = this.props,
  			    className = _props.className,
  			    opacity = _props.opacity;
  			var _props2 = this.props,
  			    showSessionBackground = _props2.showSessionBackground,
  			    sessionBackGround = _props2.sessionBackGround,
  			    sessionBackGroundOpacity = _props2.sessionBackGroundOpacity;
  			var xAccessor = moreProps.xAccessor,
  			    width = moreProps.width;

  			var _helper2 = helper$4(this.props, moreProps, xAccessor, width),
  			    rects = _helper2.rects,
  			    sessionBg = _helper2.sessionBg;

  			var sessionBgSvg = showSessionBackground ? sessionBg.map(function (d, idx) {
  				return React__default.createElement("rect", _extends$14({ key: idx }, d, { opacity: sessionBackGroundOpacity, fill: sessionBackGround }));
  			}) : null;

  			return React__default.createElement(
  				"g",
  				{ className: className },
  				sessionBgSvg,
  				rects.map(function (d, i) {
  					return React__default.createElement(
  						"g",
  						{ key: i },
  						React__default.createElement("rect", { x: d.x, y: d.y,
  							width: d.w1, height: d.height,
  							fill: d.fill1, stroke: d.stroke1, fillOpacity: opacity }),
  						React__default.createElement("rect", { x: d.x + d.w1, y: d.y,
  							width: d.w2, height: d.height,
  							fill: d.fill2, stroke: d.stroke2, fillOpacity: opacity })
  					);
  				})
  			);
  		}
  	}]);

  	return VolumeProfileSeries;
  }(React.Component);

  VolumeProfileSeries.propTypes = {
  	className: PropTypes.string,
  	opacity: PropTypes.number,
  	showSessionBackground: PropTypes.bool,
  	sessionBackGround: PropTypes.string,
  	sessionBackGroundOpacity: PropTypes.number
  };

  VolumeProfileSeries.defaultProps = {
  	className: "line ",
  	bins: 20,
  	opacity: 0.5,
  	maxProfileWidthPercent: 50,
  	fill: function fill(_ref) {
  		var type = _ref.type;
  		return type === "up" ? "#6BA583" : "#FF0000";
  	},
  	stroke: "#FFFFFF",
  	showSessionBackground: false,
  	sessionBackGround: "#4682B4",
  	sessionBackGroundOpacity: 0.3,

  	source: function source(d) {
  		return d.close;
  	},
  	volume: function volume(d) {
  		return d.volume;
  	},
  	absoluteChange: function absoluteChange(d) {
  		return d.absoluteChange;
  	},
  	bySession: false,
  	/* eslint-disable no-unused-vars */
  	sessionStart: function sessionStart(_ref2) {
  		var d = _ref2.d,
  		    i = _ref2.i,
  		    plotData = _ref2.plotData;
  		return i > 0 && plotData[i - 1].date.getMonth() !== d.date.getMonth();
  	},
  	/* eslint-enable no-unused-vars */
  	orient: "left",
  	// // fill: ({ type }) => { var c = type === "up" ? "#6BA583" : "#FF0000"; console.log(type, c); return c },
  	// stroke: ({ type }) =>  type === "up" ? "#6BA583" : "#FF0000",
  	// stroke: "none",
  	partialStartOK: true,
  	partialEndOK: true
  };

  function helper$4(props, moreProps, xAccessor, width) {
  	var realXScale = moreProps.xScale,
  	    yScale = moreProps.chartConfig.yScale,
  	    plotData = moreProps.plotData;
  	var sessionStart = props.sessionStart,
  	    bySession = props.bySession,
  	    partialStartOK = props.partialStartOK,
  	    partialEndOK = props.partialEndOK;
  	var bins = props.bins,
  	    maxProfileWidthPercent = props.maxProfileWidthPercent,
  	    source = props.source,
  	    volume = props.volume,
  	    absoluteChange = props.absoluteChange,
  	    orient = props.orient,
  	    fill = props.fill,
  	    stroke = props.stroke;


  	var sessionBuilder = accumulatingWindow().discardTillStart(!partialStartOK).discardTillEnd(!partialEndOK).accumulateTill(function (d, i) {
  		return sessionStart(_extends$14({ d: d, i: i }, moreProps));
  	}).accumulator(identity$4);

  	var dx = plotData.length > 1 ? realXScale(xAccessor(plotData[1])) - realXScale(xAccessor(head(plotData))) : 0;

  	var sessions = bySession ? sessionBuilder(plotData) : [plotData];

  	var allRects = sessions.map(function (session) {

  		var begin = bySession ? realXScale(xAccessor(head(session))) : 0;
  		var finish = bySession ? realXScale(xAccessor(last(session))) : width;
  		var sessionWidth = finish - begin + dx;

  		// console.log(session)

  		/* var histogram = d3.layout.histogram()
    		.value(source)
    		.bins(bins);*/

  		var histogram2 = d3Histogram()
  		// .domain(xScale.domain())
  		.value(source).thresholds(bins);

  		// console.log(bins, histogram(session))
  		// console.log(bins, histogram2(session))
  		var rollup = nest().key(function (d) {
  			return d.direction;
  		}).sortKeys(orient === "right" ? descending : ascending).rollup(function (leaves) {
  			return sum(leaves, function (d) {
  				return d.volume;
  			});
  		});

  		var values$$1 = histogram2(session);
  		// console.log("values", values)

  		var volumeInBins = values$$1.map(function (arr) {
  			return arr.map(function (d) {
  				return absoluteChange(d) > 0 ? { direction: "up", volume: volume(d) } : { direction: "down", volume: volume(d) };
  			});
  		}).map(function (arr) {
  			return rollup.entries(arr);
  		});

  		// console.log("volumeInBins", volumeInBins)
  		var volumeValues = volumeInBins.map(function (each) {
  			return sum(each.map(function (d) {
  				return d.value;
  			}));
  		});

  		// console.log("volumeValues", volumeValues)
  		var base = function base(xScale) {
  			return head(xScale.range());
  		};

  		var _ref3 = orient === "right" ? [begin, begin + sessionWidth * maxProfileWidthPercent / 100] : [finish, finish - sessionWidth * (100 - maxProfileWidthPercent) / 100],
  		    _ref4 = _slicedToArray$13(_ref3, 2),
  		    start = _ref4[0],
  		    end = _ref4[1];

  		var xScale = linear$1().domain([0, max(volumeValues)]).range([start, end]);

  		// console.log(xScale.domain())

  		var totalVolumes = volumeInBins.map(function (volumes) {

  			var totalVolume = sum(volumes, function (d) {
  				return d.value;
  			});
  			var totalVolumeX = xScale(totalVolume);
  			var width = base(xScale) - totalVolumeX;
  			var x = width < 0 ? totalVolumeX + width : totalVolumeX;

  			var ws = volumes.map(function (d) {
  				return {
  					type: d.key,
  					width: d.value * Math.abs(width) / totalVolume
  				};
  			});

  			return { x: x, ws: ws, totalVolumeX: totalVolumeX };
  		});
  		// console.log("totalVolumes", totalVolumes)

  		var rects = zip(values$$1, totalVolumes).map(function (_ref5) {
  			var _ref6 = _slicedToArray$13(_ref5, 2),
  			    d = _ref6[0],
  			    _ref6$ = _ref6[1],
  			    x = _ref6$.x,
  			    ws = _ref6$.ws;

  			var w1 = ws[0] || { type: "up", width: 0 };
  			var w2 = ws[1] || { type: "down", width: 0 };

  			return {
  				// y: yScale(d.x + d.dx),
  				y: yScale(d.x1),
  				// height: yScale(d.x - d.dx) - yScale(d.x),
  				height: yScale(d.x1) - yScale(d.x0),
  				x: x,
  				width: width,
  				w1: w1.width,
  				w2: w2.width,
  				stroke1: functor(stroke)(w1),
  				stroke2: functor(stroke)(w2),
  				fill1: functor(fill)(w1),
  				fill2: functor(fill)(w2)
  			};
  		});

  		// console.log("rects", rects)

  		var sessionBg = {
  			x: begin,
  			y: last(rects).y,
  			height: head(rects).y - last(rects).y + head(rects).height,
  			width: sessionWidth
  		};

  		return { rects: rects, sessionBg: sessionBg };
  	});

  	return {
  		rects: merge(allRects.map(function (d) {
  			return d.rects;
  		})),
  		sessionBg: allRects.map(function (d) {
  			return d.sessionBg;
  		})
  	};
  }

  function _drawOnCanvas$6(ctx, props, rects, sessionBg) {
  	var opacity = props.opacity,
  	    sessionBackGround = props.sessionBackGround,
  	    sessionBackGroundOpacity = props.sessionBackGroundOpacity,
  	    showSessionBackground = props.showSessionBackground;

  	// var { rects, sessionBg } = helper(props, xScale, yScale, plotData);

  	if (showSessionBackground) {
  		ctx.fillStyle = hexToRGBA(sessionBackGround, sessionBackGroundOpacity);

  		sessionBg.forEach(function (each) {
  			var x = each.x,
  			    y = each.y,
  			    height = each.height,
  			    width = each.width;


  			ctx.beginPath();
  			ctx.rect(x, y, width, height);
  			ctx.closePath();
  			ctx.fill();
  		});
  	}

  	rects.forEach(function (each) {
  		var x = each.x,
  		    y = each.y,
  		    height = each.height,
  		    w1 = each.w1,
  		    w2 = each.w2,
  		    stroke1 = each.stroke1,
  		    stroke2 = each.stroke2,
  		    fill1 = each.fill1,
  		    fill2 = each.fill2;


  		if (w1 > 0) {
  			ctx.fillStyle = hexToRGBA(fill1, opacity);
  			if (stroke1 !== "none") ctx.strokeStyle = stroke1;

  			ctx.beginPath();
  			ctx.rect(x, y, w1, height);
  			ctx.closePath();
  			ctx.fill();

  			if (stroke1 !== "none") ctx.stroke();
  		}

  		if (w2 > 0) {
  			ctx.fillStyle = hexToRGBA(fill2, opacity);
  			if (stroke2 !== "none") ctx.strokeStyle = stroke2;

  			ctx.beginPath();
  			ctx.rect(x + w1, y, w2, height);
  			ctx.closePath();
  			ctx.fill();

  			if (stroke2 !== "none") ctx.stroke();
  		}
  	});
  }

  var _extends$15 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  var _createClass$34 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$34(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$34(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$34(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var SARSeries = function (_Component) {
  	_inherits$34(SARSeries, _Component);

  	function SARSeries(props) {
  		_classCallCheck$34(this, SARSeries);

  		var _this = _possibleConstructorReturn$34(this, (SARSeries.__proto__ || Object.getPrototypeOf(SARSeries)).call(this, props));

  		_this.renderSVG = _this.renderSVG.bind(_this);
  		_this.drawOnCanvas = _this.drawOnCanvas.bind(_this);
  		_this.isHover = _this.isHover.bind(_this);
  		return _this;
  	}

  	_createClass$34(SARSeries, [{
  		key: "isHover",
  		value: function isHover(moreProps) {
  			var mouseXY = moreProps.mouseXY,
  			    currentItem = moreProps.currentItem,
  			    yScale = moreProps.chartConfig.yScale;
  			var yAccessor = this.props.yAccessor;

  			var y = mouseXY[1];
  			var currentY = yScale(yAccessor(currentItem));
  			return y < currentY + 5 && y > currentY - 5;
  		}
  	}, {
  		key: "drawOnCanvas",
  		value: function drawOnCanvas(ctx, moreProps) {
  			var _props = this.props,
  			    yAccessor = _props.yAccessor,
  			    fill = _props.fill,
  			    opacity = _props.opacity;
  			var xAccessor = moreProps.xAccessor,
  			    plotData = moreProps.plotData,
  			    xScale = moreProps.xScale,
  			    yScale = moreProps.chartConfig.yScale,
  			    hovering = moreProps.hovering;


  			var width = xScale(xAccessor(last(plotData))) - xScale(xAccessor(first(plotData)));

  			var d = width / plotData.length * 0.5 / 2;
  			var rx = Math.max(0.5, d / 2) + (hovering ? 2 : 0);
  			var ry = Math.min(2, Math.max(0.5, d)) + (hovering ? 0 : 0);

  			plotData.forEach(function (each) {
  				var centerX = xScale(xAccessor(each));
  				var centerY = yScale(yAccessor(each));
  				var color = yAccessor(each) > each.close ? fill.falling : fill.rising;

  				ctx.fillStyle = hexToRGBA(color, opacity);
  				ctx.strokeStyle = color;

  				ctx.beginPath();
  				ctx.ellipse(centerX, centerY, rx, ry, 0, 0, 2 * Math.PI);
  				ctx.closePath();
  				ctx.fill();
  				ctx.stroke();
  			});
  		}
  	}, {
  		key: "renderSVG",
  		value: function renderSVG(moreProps) {
  			var _props2 = this.props,
  			    className = _props2.className,
  			    yAccessor = _props2.yAccessor;
  			var xAccessor = moreProps.xAccessor,
  			    plotData = moreProps.plotData,
  			    xScale = moreProps.xScale,
  			    yScale = moreProps.chartConfig.yScale;
  			// console.log(moreProps);

  			return React__default.createElement(
  				"g",
  				{ className: className },
  				plotData.filter(function (each) {
  					return isDefined(yAccessor(each));
  				}).map(function (each, idx) {
  					return React__default.createElement("circle", { key: idx, cx: xScale(xAccessor(each)),
  						cy: yScale(yAccessor(each)), r: 3, fill: "green" });
  				})
  			);
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			var highlightOnHover = this.props.highlightOnHover;

  			var hoverProps = highlightOnHover ? {
  				isHover: this.isHover,
  				drawOn: ["mousemove", "pan"],
  				canvasToDraw: getMouseCanvas
  			} : {
  				drawOn: ["pan"],
  				canvasToDraw: getAxisCanvas
  			};

  			return React__default.createElement(GenericChartComponent, _extends$15({
  				svgDraw: this.renderSVG,

  				canvasDraw: this.drawOnCanvas,

  				onClickWhenHover: this.props.onClick,
  				onDoubleClickWhenHover: this.props.onDoubleClick,
  				onContextMenuWhenHover: this.props.onContextMenu
  			}, hoverProps));
  		}
  	}]);

  	return SARSeries;
  }(React.Component);

  SARSeries.propTypes = {
  	className: PropTypes.string,
  	fill: PropTypes.object.isRequired,
  	yAccessor: PropTypes.func.isRequired,
  	opacity: PropTypes.number.isRequired,
  	onClick: PropTypes.func,
  	onDoubleClick: PropTypes.func,
  	onContextMenu: PropTypes.func,
  	highlightOnHover: PropTypes.bool
  };

  SARSeries.defaultProps = {
  	className: "react-stockcharts-sar",
  	fill: {
  		falling: "#4682B4",
  		rising: "#15EC2E"
  	},
  	highlightOnHover: true,
  	opacity: 0.2,
  	onClick: function onClick(e) {
  		console.log("Click", e);
  	},
  	onDoubleClick: function onDoubleClick(e) {
  		console.log("Double Click", e);
  	},
  	onContextMenu: function onContextMenu(e) {
  		console.log("Right Click", e);
  	}
  };

  var defaultFormatters = {
  	yearFormat: "%Y",
  	quarterFormat: "%b %Y",
  	monthFormat: "%b",
  	weekFormat: "%d %b",
  	dayFormat: "%a %d",
  	hourFormat: "%_I %p",
  	minuteFormat: "%I:%M %p",
  	secondFormat: "%I:%M:%S %p",
  	milliSecondFormat: "%L"
  };

  var levelDefinition = [
  /* eslint-disable no-unused-vars */
  /* 19 */function (d, date, i) {
  	return d.startOfYear && date.getFullYear() % 12 === 0 && "yearFormat";
  },
  /* 18 */function (d, date, i) {
  	return d.startOfYear && date.getFullYear() % 4 === 0 && "yearFormat";
  },
  /* 17 */function (d, date, i) {
  	return d.startOfYear && date.getFullYear() % 2 === 0 && "yearFormat";
  },
  /* 16 */function (d, date, i) {
  	return d.startOfYear && "yearFormat";
  },
  /* 15 */function (d, date, i) {
  	return d.startOfQuarter && "quarterFormat";
  },
  /* 14 */function (d, date, i) {
  	return d.startOfMonth && "monthFormat";
  },
  /* 13 */function (d, date, i) {
  	return d.startOfWeek && "weekFormat";
  },
  /* 12 */function (d, date, i) {
  	return d.startOfDay && i % 2 === 0 && "dayFormat";
  },
  /* 11 */function (d, date, i) {
  	return d.startOfDay && "dayFormat";
  },
  /* 10 */function (d, date, i) {
  	return d.startOfHalfDay && "hourFormat";
  }, // 12h
  /*  9 */function (d, date, i) {
  	return d.startOfQuarterDay && "hourFormat";
  }, // 6h
  /*  8 */function (d, date, i) {
  	return d.startOfEighthOfADay && "hourFormat";
  }, // 3h
  /*  7 */function (d, date, i) {
  	return d.startOfHour && date.getHours() % 2 === 0 && "hourFormat";
  }, // 2h -- REMOVE THIS
  /*  6 */function (d, date, i) {
  	return d.startOfHour && "hourFormat";
  }, // 1h
  /*  5 */function (d, date, i) {
  	return d.startOf30Minutes && "minuteFormat";
  },
  /*  4 */function (d, date, i) {
  	return d.startOf15Minutes && "minuteFormat";
  },
  /*  3 */function (d, date, i) {
  	return d.startOf5Minutes && "minuteFormat";
  },
  /*  2 */function (d, date, i) {
  	return d.startOfMinute && "minuteFormat";
  },
  /*  1 */function (d, date, i) {
  	return d.startOf30Seconds && "secondFormat";
  },
  /*  0 */function (d, date, i) {
  	return "secondFormat";
  }];

  var _slicedToArray$14 = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var MAX_LEVEL = levelDefinition.length - 1;

  function financeDiscontinuousScale(index, futureProvider) {
  	var backingLinearScale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : linear$1();


  	if (isNotDefined(index)) throw new Error("Use the discontinuousTimeScaleProvider to create financeDiscontinuousScale");

  	function scale(x) {
  		return backingLinearScale(x);
  	}
  	scale.invert = function (x) {
  		var inverted = backingLinearScale.invert(x);
  		return Math.round(inverted * 10000) / 10000;
  	};
  	scale.domain = function (x) {
  		if (!arguments.length) return backingLinearScale.domain();
  		backingLinearScale.domain(x);
  		return scale;
  	};
  	scale.range = function (x) {
  		if (!arguments.length) return backingLinearScale.range();
  		backingLinearScale.range(x);
  		return scale;
  	};
  	scale.rangeRound = function (x) {
  		return backingLinearScale.range(x);
  	};
  	scale.clamp = function (x) {
  		if (!arguments.length) return backingLinearScale.clamp();
  		backingLinearScale.clamp(x);
  		return scale;
  	};
  	scale.interpolate = function (x) {
  		if (!arguments.length) return backingLinearScale.interpolate();
  		backingLinearScale.interpolate(x);
  		return scale;
  	};
  	scale.ticks = function (m, flexTicks) {
  		var backingTicks = backingLinearScale.ticks(m);
  		var ticksMap = map$1();

  		var _backingLinearScale$d = backingLinearScale.domain(),
  		    _backingLinearScale$d2 = _slicedToArray$14(_backingLinearScale$d, 2),
  		    domainStart = _backingLinearScale$d2[0],
  		    domainEnd = _backingLinearScale$d2[1];

  		var start = Math.max(Math.ceil(domainStart), head(index).index) + Math.abs(head(index).index);
  		var end = Math.min(Math.floor(domainEnd), last(index).index) + Math.abs(head(index).index);

  		var desiredTickCount = Math.ceil((end - start) / (domainEnd - domainStart) * backingTicks.length);

  		for (var i = MAX_LEVEL; i >= 0; i--) {
  			var ticksAtLevel = ticksMap.get(i);
  			var temp = isNotDefined(ticksAtLevel) ? [] : ticksAtLevel.slice();

  			for (var j = start; j <= end; j++) {
  				if (index[j].level === i) {
  					temp.push(index[j]);
  				}
  			}

  			ticksMap.set(i, temp);
  		}

  		var unsortedTicks = [];
  		for (var _i = MAX_LEVEL; _i >= 0; _i--) {
  			if (ticksMap.get(_i).length + unsortedTicks.length > desiredTickCount * 1.5) break;
  			unsortedTicks = unsortedTicks.concat(ticksMap.get(_i).map(function (d) {
  				return d.index;
  			}));
  		}

  		var ticks$$1 = unsortedTicks.sort(ascending);

  		// console.log(backingTicks.length, desiredTickCount, ticks, ticksMap);

  		if (!flexTicks && end - start > ticks$$1.length) {
  			var ticksSet = set(ticks$$1);

  			var d = Math.abs(head(index).index);

  			// ignore ticks within this distance
  			var distance = Math.ceil((backingTicks.length > 0 ? (last(backingTicks) - head(backingTicks)) / backingTicks.length / 4 : 1) * 1.5);

  			for (var _i2 = 0; _i2 < ticks$$1.length - 1; _i2++) {
  				for (var _j = _i2 + 1; _j < ticks$$1.length; _j++) {
  					if (ticks$$1[_j] - ticks$$1[_i2] <= distance) {
  						ticksSet.remove(index[ticks$$1[_i2] + d].level >= index[ticks$$1[_j] + d].level ? ticks$$1[_j] : ticks$$1[_i2]);
  					}
  				}
  			}

  			var tickValues = ticksSet.values().map(function (d) {
  				return parseInt(d, 10);
  			});

  			// console.log(ticks.length, tickValues, level);
  			// console.log(ticks, tickValues, distance);

  			return tickValues;
  		}

  		return ticks$$1;
  	};
  	scale.tickFormat = function () {
  		return function (x) {
  			var d = Math.abs(head(index).index);
  			var _index$Math$floor = index[Math.floor(x + d)],
  			    format = _index$Math$floor.format,
  			    date = _index$Math$floor.date;

  			return format(date);
  		};
  	};
  	scale.value = function (x) {
  		var d = Math.abs(head(index).index);
  		if (isDefined(index[Math.floor(x + d)])) {
  			var date = index[Math.floor(x + d)].date;

  			return date;
  		}
  	};
  	scale.nice = function (m) {
  		backingLinearScale.nice(m);
  		return scale;
  	};
  	scale.index = function (x) {
  		if (!arguments.length) return index;
  		index = x;
  		return scale;
  	};
  	scale.copy = function () {
  		return financeDiscontinuousScale(index, futureProvider, backingLinearScale.copy());
  	};
  	return scale;
  }

  var _slicedToArray$15 = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _extends$16 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  function evaluateLevel(d, date, i, formatters) {
  	return levelDefinition.map(function (eachLevel, idx) {
  		return {
  			level: levelDefinition.length - idx - 1,
  			format: formatters[eachLevel(d, date, i)]
  		};
  	}).find(function (l) {
  		return !!l.format;
  	});
  }

  var discontinuousIndexCalculator = slidingWindow().windowSize(2).undefinedValue(function (d, idx, _ref) {
  	var initialIndex = _ref.initialIndex,
  	    formatters = _ref.formatters;

  	var i = initialIndex;
  	var row = {
  		date: d.getTime(),
  		startOf30Seconds: false,
  		startOfMinute: false,
  		startOf5Minutes: false,
  		startOf15Minutes: false,
  		startOf30Minutes: false,
  		startOfHour: false,
  		startOfEighthOfADay: false,
  		startOfQuarterDay: false,
  		startOfHalfDay: false,
  		startOfDay: true,
  		startOfWeek: false,
  		startOfMonth: false,
  		startOfQuarter: false,
  		startOfYear: false
  	};
  	var level = evaluateLevel(row, d, i, formatters);
  	return _extends$16({}, row, { index: i }, level);
  });

  var discontinuousIndexCalculatorLocalTime = discontinuousIndexCalculator.accumulator(function (_ref2, i, idx, _ref3) {
  	var _ref4 = _slicedToArray$15(_ref2, 2),
  	    prevDate = _ref4[0],
  	    nowDate = _ref4[1];

  	var initialIndex = _ref3.initialIndex,
  	    formatters = _ref3.formatters;

  	var startOf30Seconds = nowDate.getSeconds() % 30 === 0;

  	var startOfMinute = nowDate.getMinutes() !== prevDate.getMinutes();
  	var startOf5Minutes = startOfMinute && nowDate.getMinutes() % 5 <= prevDate.getMinutes() % 5;
  	var startOf15Minutes = startOfMinute && nowDate.getMinutes() % 15 <= prevDate.getMinutes() % 15;
  	var startOf30Minutes = startOfMinute && nowDate.getMinutes() % 30 <= prevDate.getMinutes() % 30;

  	var startOfHour = nowDate.getHours() !== prevDate.getHours();

  	var startOfEighthOfADay = startOfHour && nowDate.getHours() % 3 === 0;
  	var startOfQuarterDay = startOfHour && nowDate.getHours() % 6 === 0;
  	var startOfHalfDay = startOfHour && nowDate.getHours() % 12 === 0;

  	var startOfDay = nowDate.getDay() !== prevDate.getDay();
  	// According to ISO calendar
  	// Sunday = 0, Monday = 1, ... Saturday = 6
  	// day of week of today < day of week of yesterday then today is start of week
  	var startOfWeek = nowDate.getDay() < prevDate.getDay();
  	// month of today != month of yesterday then today is start of month
  	var startOfMonth = nowDate.getMonth() !== prevDate.getMonth();
  	// if start of month and month % 3 === 0 then it is start of quarter
  	var startOfQuarter = startOfMonth && nowDate.getMonth() % 3 <= prevDate.getMonth() % 3;
  	// year of today != year of yesterday then today is start of year
  	var startOfYear = nowDate.getFullYear() !== prevDate.getFullYear();

  	var row = {
  		date: nowDate.getTime(),
  		startOf30Seconds: startOf30Seconds,
  		startOfMinute: startOfMinute,
  		startOf5Minutes: startOf5Minutes,
  		startOf15Minutes: startOf15Minutes,
  		startOf30Minutes: startOf30Minutes,
  		startOfHour: startOfHour,
  		startOfEighthOfADay: startOfEighthOfADay,
  		startOfQuarterDay: startOfQuarterDay,
  		startOfHalfDay: startOfHalfDay,
  		startOfDay: startOfDay,
  		startOfWeek: startOfWeek,
  		startOfMonth: startOfMonth,
  		startOfQuarter: startOfQuarter,
  		startOfYear: startOfYear
  	};
  	var level = evaluateLevel(row, nowDate, i, formatters);
  	if (level == null) {
  		console.log(row);
  	}
  	return _extends$16({}, row, { index: i + initialIndex }, level);
  });

  function doStuff$1(realDateAccessor, inputDateAccessor, initialIndex, formatters) {
  	return function (data) {
  		var dateAccessor = realDateAccessor(inputDateAccessor);
  		var calculate = discontinuousIndexCalculatorLocalTime.source(dateAccessor).misc({ initialIndex: initialIndex, formatters: formatters });

  		var index = calculate(data).map(function (each) {
  			var format = each.format;

  			return {
  				// ...each,
  				index: each.index,
  				level: each.level,
  				date: new Date(each.date),
  				format: timeFormat(format)
  			};
  		});
  		/*
    var map = d3Map();
    for (var i = 0; i < data.length - 1; i++) {
    		var nextDate = dateAccessor(data[i + 1]);
    	var nowDate = dateAccessor(data[i]);
    	var diff = nextDate - nowDate;
    		if (map.has(diff)) {
    		var count = parseInt(map.get(diff), 10) + 1;
    		map.set(diff, count);
    	} else {
    		map.set(diff, 1);
    	}
    }
    	var entries = map.entries().sort((a, b) => a.value < b.value);
    	// For Renko/p&f
    	var interval = entries[0].value === 1
    	? Math.round((dateAccessor(last(data)) - dateAccessor(head(data))) / data.length)
    	: parseInt(entries[0].key, 10); */

  		// return { index, interval };
  		return { index: index };
  	};
  }

  function discontinuousTimeScaleProviderBuilder() {
  	var initialIndex = 0,
  	    realDateAccessor = identity$4;
  	var inputDateAccessor = function inputDateAccessor(d) {
  		return d.date;
  	},
  	    indexAccessor = function indexAccessor(d) {
  		return d.idx;
  	},
  	    indexMutator = function indexMutator(d, idx) {
  		return _extends$16({}, d, { idx: idx });
  	},
  	    withIndex = void 0;

  	var currentFormatters = defaultFormatters;

  	// eslint-disable-next-line prefer-const
  	var discontinuousTimeScaleProvider = function discontinuousTimeScaleProvider(data) {
  		/*
    console.warn("Are you sure you want to use a discontinuousTimeScale?"
    	+ " Use this only if you have discontinuous data which"
    	+ " needs to be displayed as continuous."
    	+ " If you have continuous data use a d3 scale like"
    	+ " `d3.scaleTime`"
    );
    */

  		var index = withIndex;

  		if (isNotDefined(index)) {
  			var response = doStuff$1(realDateAccessor, inputDateAccessor, initialIndex, currentFormatters)(data);

  			index = response.index;
  		}
  		// console.log(interval, entries[0].key);

  		var inputIndex = index;
  		var xScale = financeDiscontinuousScale(inputIndex);

  		var mergedData = zipper().combine(indexMutator);

  		var finalData = mergedData(data, inputIndex);

  		return {
  			data: finalData,
  			xScale: xScale,
  			xAccessor: function xAccessor(d) {
  				return d && indexAccessor(d).index;
  			},
  			displayXAccessor: realDateAccessor(inputDateAccessor)
  		};
  	};

  	discontinuousTimeScaleProvider.initialIndex = function (x) {
  		if (!arguments.length) {
  			return initialIndex;
  		}
  		initialIndex = x;
  		return discontinuousTimeScaleProvider;
  	};
  	discontinuousTimeScaleProvider.inputDateAccessor = function (x) {
  		if (!arguments.length) {
  			return inputDateAccessor;
  		}
  		inputDateAccessor = x;
  		return discontinuousTimeScaleProvider;
  	};
  	discontinuousTimeScaleProvider.indexAccessor = function (x) {
  		if (!arguments.length) {
  			return indexAccessor;
  		}
  		indexAccessor = x;
  		return discontinuousTimeScaleProvider;
  	};
  	discontinuousTimeScaleProvider.indexMutator = function (x) {
  		if (!arguments.length) {
  			return indexMutator;
  		}
  		indexMutator = x;
  		return discontinuousTimeScaleProvider;
  	};
  	discontinuousTimeScaleProvider.withIndex = function (x) {
  		if (!arguments.length) {
  			return withIndex;
  		}
  		withIndex = x;
  		return discontinuousTimeScaleProvider;
  	};
  	discontinuousTimeScaleProvider.utc = function () {
  		realDateAccessor = function realDateAccessor(dateAccessor) {
  			return function (d) {
  				var date = dateAccessor(d);
  				// The getTimezoneOffset() method returns the time-zone offset from UTC, in minutes, for the current locale.
  				var offsetInMillis = date.getTimezoneOffset() * 60 * 1000;
  				return new Date(date.getTime() + offsetInMillis);
  			};
  		};
  		return discontinuousTimeScaleProvider;
  	};
  	discontinuousTimeScaleProvider.setLocale = function (locale) {
  		var formatters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  		if (locale) {
  			defaultLocale$1(locale);
  		}
  		if (formatters) {
  			currentFormatters = formatters;
  		}
  		return discontinuousTimeScaleProvider;
  	};

  	discontinuousTimeScaleProvider.indexCalculator = function () {
  		return doStuff$1(realDateAccessor, inputDateAccessor, initialIndex, currentFormatters);
  	};

  	return discontinuousTimeScaleProvider;
  }

  /* discontinuousTimeScaleProvider.utc = function(data,
  		dateAccessor,
  		indexAccessor,
  		indexMutator) {
  	var utcDateAccessor = d => {
  		var date = dateAccessor(d);
  		// The getTimezoneOffset() method returns the time-zone offset from UTC, in minutes, for the current locale.
  		var offsetInMillis = date.getTimezoneOffset() * 60 * 1000;
  		return new Date(date.getTime() + offsetInMillis);
  	};
  	return discontinuousTimeScaleProvider(data, utcDateAccessor, indexAccessor, indexMutator);
  };*/

  var discontinuousTimeScaleProvider = discontinuousTimeScaleProviderBuilder();

  var _createClass$35 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$35(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$35(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$35(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var TypeChooser = function (_Component) {
  	_inherits$35(TypeChooser, _Component);

  	function TypeChooser(props) {
  		_classCallCheck$35(this, TypeChooser);

  		var _this = _possibleConstructorReturn$35(this, (TypeChooser.__proto__ || Object.getPrototypeOf(TypeChooser)).call(this, props));

  		_this.state = {
  			type: _this.props.type
  		};
  		_this.handleTypeChange = _this.handleTypeChange.bind(_this);
  		return _this;
  	}

  	_createClass$35(TypeChooser, [{
  		key: "handleTypeChange",
  		value: function handleTypeChange(e) {
  			// console.log(e.target.value);
  			this.setState({
  				type: e.target.value
  			});
  		}
  	}, {
  		key: "render",
  		value: function render() {
  			return React__default.createElement(
  				"div",
  				null,
  				React__default.createElement(
  					"label",
  					null,
  					"Type: "
  				),
  				React__default.createElement(
  					"select",
  					{ name: "type", id: "type", onChange: this.handleTypeChange, value: this.state.type },
  					React__default.createElement(
  						"option",
  						{ value: "svg" },
  						"svg"
  					),
  					React__default.createElement(
  						"option",
  						{ value: "hybrid" },
  						"canvas + svg"
  					)
  				),
  				React__default.createElement(
  					"div",
  					{ style: this.props.style },
  					this.props.children(this.state.type)
  				)
  			);
  		}
  	}]);

  	return TypeChooser;
  }(React.Component);

  TypeChooser.propTypes = {
  	type: PropTypes.oneOf(["svg", "hybrid"]),
  	children: PropTypes.func.isRequired,
  	style: PropTypes.object.isRequired
  };

  TypeChooser.defaultProps = {
  	type: "hybrid",
  	style: {}
  };

  var saveSvgAsPng = createCommonjsModule(function (module, exports) {
  (function() {
    const out$ = exports || typeof undefined != 'undefined' && {} || this;
    if (typeof undefined !== 'undefined') undefined(() => out$);

    const xmlns = 'http://www.w3.org/2000/xmlns/';
    const doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" [<!ENTITY nbsp "&#160;">]>';
    const urlRegex = /url\(["']?(.+?)["']?\)/;
    const fontFormats = {
      woff2: 'font/woff2',
      woff: 'font/woff',
      otf: 'application/x-font-opentype',
      ttf: 'application/x-font-ttf',
      eot: 'application/vnd.ms-fontobject',
      sfnt: 'application/font-sfnt',
      svg: 'image/svg+xml'
    };

    const isElement = obj => obj instanceof HTMLElement || obj instanceof SVGElement;
    const requireDomNode = el => {
      if (!isElement(el)) throw new Error(`an HTMLElement or SVGElement is required; got ${el}`);
    };
    const isExternal = url => url && url.lastIndexOf('http',0) === 0 && url.lastIndexOf(window.location.host) === -1;

    const getFontMimeTypeFromUrl = fontUrl => {
      const formats = Object.keys(fontFormats)
        .filter(extension => fontUrl.indexOf(`.${extension}`) > 0)
        .map(extension => fontFormats[extension]);
      if (formats) return formats[0];
      console.error(`Unknown font format for ${fontUrl}. Fonts may not be working correctly.`);
      return 'application/octet-stream';
    };

    const arrayBufferToBase64 = buffer => {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      return window.btoa(binary);
    };

    const getDimension = (el, clone, dim) => {
      const v =
        (el.viewBox && el.viewBox.baseVal && el.viewBox.baseVal[dim]) ||
        (clone.getAttribute(dim) !== null && !clone.getAttribute(dim).match(/%$/) && parseInt(clone.getAttribute(dim))) ||
        el.getBoundingClientRect()[dim] ||
        parseInt(clone.style[dim]) ||
        parseInt(window.getComputedStyle(el).getPropertyValue(dim));
      return typeof v === 'undefined' || v === null || isNaN(parseFloat(v)) ? 0 : v;
    };

    const getDimensions = (el, clone, width, height) => {
      if (el.tagName === 'svg') return {
        width: width || getDimension(el, clone, 'width'),
        height: height || getDimension(el, clone, 'height')
      };
      else if (el.getBBox) {
        const {x, y, width, height} = el.getBBox();
        return {
          width: x + width,
          height: y + height
        };
      }
    };

    const reEncode = data =>
      decodeURIComponent(
        encodeURIComponent(data)
          .replace(/%([0-9A-F]{2})/g, (match, p1) => {
            const c = String.fromCharCode(`0x${p1}`);
            return c === '%' ? '%25' : c;
          })
      );

    const uriToBlob = uri => {
      const byteString = window.atob(uri.split(',')[1]);
      const mimeString = uri.split(',')[0].split(':')[1].split(';')[0];
      const buffer = new ArrayBuffer(byteString.length);
      const intArray = new Uint8Array(buffer);
      for (let i = 0; i < byteString.length; i++) {
        intArray[i] = byteString.charCodeAt(i);
      }
      return new Blob([buffer], {type: mimeString});
    };

    const query = (el, selector) => {
      if (!selector) return;
      try {
        return el.querySelector(selector) || el.parentNode && el.parentNode.querySelector(selector);
      } catch(err) {
        console.warn(`Invalid CSS selector "${selector}"`, err);
      }
    };

    const detectCssFont = rule => {
      // Match CSS font-face rules to external links.
      // @font-face {
      //   src: local('Abel'), url(https://fonts.gstatic.com/s/abel/v6/UzN-iejR1VoXU2Oc-7LsbvesZW2xOQ-xsNqO47m55DA.woff2);
      // }
      const match = rule.cssText.match(urlRegex);
      const url = (match && match[1]) || '';
      if (!url || url.match(/^data:/) || url === 'about:blank') return;
      const fullUrl =
        url.startsWith('../') ? `${rule.href}/../${url}`
        : url.startsWith('./') ? `${rule.href}/.${url}`
        : url;
      return {
        text: rule.cssText,
        format: getFontMimeTypeFromUrl(fullUrl),
        url: fullUrl
      };
    };

    const inlineImages = el => Promise.all(
      Array.from(el.querySelectorAll('image')).map(image => {
        let href = image.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || image.getAttribute('href');
        if (!href) return Promise.resolve(null);
        if (isExternal(href)) {
          href += (href.indexOf('?') === -1 ? '?' : '&') + 't=' + new Date().valueOf();
        }
        return new Promise((resolve, reject) => {
          const canvas = document.createElement('canvas');
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = href;
          img.onerror = () => reject(new Error(`Could not load ${href}`));
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext('2d').drawImage(img, 0, 0);
            image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', canvas.toDataURL('image/png'));
            resolve(true);
          };
        });
      })
    );

    const cachedFonts = {};
    const inlineFonts = fonts => Promise.all(
      fonts.map(font =>
        new Promise((resolve, reject) => {
          if (cachedFonts[font.url]) return resolve(cachedFonts[font.url]);

          const req = new XMLHttpRequest();
          req.addEventListener('load', () => {
            // TODO: it may also be worth it to wait until fonts are fully loaded before
            // attempting to rasterize them. (e.g. use https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet)
            const fontInBase64 = arrayBufferToBase64(req.response);
            const fontUri = font.text.replace(urlRegex, `url("data:${font.format};base64,${fontInBase64}")`)+'\n';
            cachedFonts[font.url] = fontUri;
            resolve(fontUri);
          });
          req.addEventListener('error', e => {
            console.warn(`Failed to load font from: ${font.url}`, e);
            cachedFonts[font.url] = null;
            resolve(null);
          });
          req.addEventListener('abort', e => {
            console.warn(`Aborted loading font from: ${font.url}`, e);
            resolve(null);
          });
          req.open('GET', font.url);
          req.responseType = 'arraybuffer';
          req.send();
        })
      )
    ).then(fontCss => fontCss.filter(x => x).join(''));

    let cachedRules = null;
    const styleSheetRules = () => {
      if (cachedRules) return cachedRules;
      return cachedRules = Array.from(document.styleSheets).map(sheet => {
        try {
          return sheet.cssRules;
        } catch (e) {
          console.warn(`Stylesheet could not be loaded: ${sheet.href}`);
        }
      });
    };

    const inlineCss = (el, options) => {
      const {
        selectorRemap,
        modifyStyle,
        modifyCss,
        fonts
      } = options || {};
      const generateCss = modifyCss || ((selector, properties) => {
        const sel = selectorRemap ? selectorRemap(selector) : selector;
        const props = modifyStyle ? modifyStyle(properties) : properties;
        return `${sel}{${props}}\n`;
      });
      const css = [];
      const detectFonts = typeof fonts === 'undefined';
      const fontList = fonts || [];
      styleSheetRules().forEach(rules => {
        if (!rules) return;
        Array.from(rules).forEach(rule => {
          if (typeof rule.style != 'undefined') {
            if (query(el, rule.selectorText)) css.push(generateCss(rule.selectorText, rule.style.cssText));
            else if (detectFonts && rule.cssText.match(/^@font-face/)) {
              const font = detectCssFont(rule);
              if (font) fontList.push(font);
            } else css.push(rule.cssText);
          }
        });
      });

      return inlineFonts(fontList).then(fontCss => css.join('\n') + fontCss);
    };

    out$.prepareSvg = (el, options, done) => {
      requireDomNode(el);
      const {
        left = 0,
        top = 0,
        width: w,
        height: h,
        scale = 1,
        responsive = false,
      } = options || {};

      return inlineImages(el).then(() => {
        let clone = el.cloneNode(true);
        const {width, height} = getDimensions(el, clone, w, h);

        if (el.tagName !== 'svg') {
          if (el.getBBox) {
            clone.setAttribute('transform', clone.getAttribute('transform').replace(/translate\(.*?\)/, ''));
            const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
            svg.appendChild(clone);
            clone = svg;
          } else {
            console.error('Attempted to render non-SVG element', el);
            return;
          }
        }

        clone.setAttribute('version', '1.1');
        clone.setAttribute('viewBox', [left, top, width, height].join(' '));
        if (!clone.getAttribute('xmlns')) clone.setAttributeNS(xmlns, 'xmlns', 'http://www.w3.org/2000/svg');
        if (!clone.getAttribute('xmlns:xlink')) clone.setAttributeNS(xmlns, 'xmlns:xlink', 'http://www.w3.org/1999/xlink');

        if (responsive) {
          clone.removeAttribute('width');
          clone.removeAttribute('height');
          clone.setAttribute('preserveAspectRatio', 'xMinYMin meet');
        } else {
          clone.setAttribute('width', width * scale);
          clone.setAttribute('height', height * scale);
        }

        Array.from(clone.querySelectorAll('foreignObject > *')).forEach(foreignObject => {
          if (!foreignObject.getAttribute('xmlns'))
            foreignObject.setAttributeNS(xmlns, 'xmlns', 'http://www.w3.org/1999/xhtml');
        });

        return inlineCss(el, options).then(css => {
          const style = document.createElement('style');
          style.setAttribute('type', 'text/css');
          style.innerHTML = `<![CDATA[\n${css}\n]]>`;

          const defs = document.createElement('defs');
          defs.appendChild(style);
          clone.insertBefore(defs, clone.firstChild);

          const outer = document.createElement('div');
          outer.appendChild(clone);
          const outHtml = outer.innerHTML.replace(/NS\d+:href/gi, 'xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href');

          if (done) done(outHtml, width, height);
          else return Promise.resolve({html: outHtml, width, height});
        });
      });
    };

    out$.svgAsDataUri = (el, options, done) => {
      requireDomNode(el);
      const result = out$.prepareSvg(el, options)
        .then(({html}) => `data:image/svg+xml;base64,${window.btoa(reEncode(doctype+html))}`);
      if (done) return result.then(done);
      return result;
    };

    out$.svgAsPngUri = (el, options, done) => {
      requireDomNode(el);
      const {
        encoderType = 'image/png',
        encoderOptions = 0.8,
        backgroundColor,
        canvg
      } = options || {};

      const convertToPng = (src, w, h) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const pixelRatio = window.devicePixelRatio || 1;

        canvas.width = w * pixelRatio;
        canvas.height = h * pixelRatio;
        canvas.style.width = `${canvas.width}px`;
        canvas.style.height = `${canvas.height}px`;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        if (canvg) canvg(canvas, src);
        else context.drawImage(src, 0, 0);

        if (backgroundColor) {
          context.globalCompositeOperation = 'destination-over';
          context.fillStyle = backgroundColor;
          context.fillRect(0, 0, canvas.width, canvas.height);
        }

        let png;
        try {
          png = canvas.toDataURL(encoderType, encoderOptions);
        } catch (e) {
          if ((typeof SecurityError !== 'undefined' && e instanceof SecurityError) || e.name === 'SecurityError') {
            console.error('Rendered SVG images cannot be downloaded in this browser.');
            return;
          } else throw e;
        }
        done(png);
      };

      if (canvg) out$.prepareSvg(el, options, convertToPng);
      else out$.svgAsDataUri(el, options, uri => {
        const image = new Image();
        image.onload = () => convertToPng(image, image.width, image.height);
        image.onerror = () => console.error(`There was an error loading the data URI as an image on the following SVG\n${window.atob(uri.slice(26))}Open the following link to see browser's diagnosis\n${uri}`);
        image.src = uri;
      });
    };

    out$.download = (name, uri) => {
      if (navigator.msSaveOrOpenBlob) navigator.msSaveOrOpenBlob(uriToBlob(uri), name);
      else {
        const saveLink = document.createElement('a');
        if ('download' in saveLink) {
          saveLink.download = name;
          saveLink.style.display = 'none';
          document.body.appendChild(saveLink);
          try {
            const blob = uriToBlob(uri);
            const url = URL.createObjectURL(blob);
            saveLink.href = url;
            saveLink.onclick = () => requestAnimationFrame(() => URL.revokeObjectURL(url));
          } catch (e) {
            console.warn('This browser does not support object URLs. Falling back to string URL.');
            saveLink.href = uri;
          }
          saveLink.click();
          document.body.removeChild(saveLink);
        }
        else {
          window.open(uri, '_temp', 'menubar=no,toolbar=no,status=no');
        }
      }
    };

    out$.saveSvg = (el, name, options) => {
      requireDomNode(el);
      out$.svgAsDataUri(el, options || {}, uri => out$.download(name, uri));
    };

    out$.saveSvgAsPng = (el, name, options) => {
      requireDomNode(el);
      out$.svgAsPngUri(el, options || {}, uri => out$.download(name, uri));
    };
  })();
  });

  var _extends$17 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  var _createClass$36 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$36(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$36(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$36(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  function getDisplayName(Series) {
  	var name = Series.displayName || Series.name || "Series";
  	return name;
  }

  function fitWidth(WrappedComponent) {
  	var withRef = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  	var minWidth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 100;

  	var ResponsiveComponent = function (_Component) {
  		_inherits$36(ResponsiveComponent, _Component);

  		function ResponsiveComponent(props) {
  			_classCallCheck$36(this, ResponsiveComponent);

  			var _this = _possibleConstructorReturn$36(this, (ResponsiveComponent.__proto__ || Object.getPrototypeOf(ResponsiveComponent)).call(this, props));

  			_this.handleWindowResize = _this.handleWindowResize.bind(_this);
  			_this.getWrappedInstance = _this.getWrappedInstance.bind(_this);
  			_this.saveNode = _this.saveNode.bind(_this);
  			_this.setTestCanvas = _this.setTestCanvas.bind(_this);
  			_this.state = {};
  			return _this;
  		}

  		_createClass$36(ResponsiveComponent, [{
  			key: "saveNode",
  			value: function saveNode(node) {
  				this.node = node;
  			}
  		}, {
  			key: "setTestCanvas",
  			value: function setTestCanvas(node) {
  				this.testCanvas = node;
  			}
  		}, {
  			key: "getRatio",
  			value: function getRatio() {
  				if (isDefined(this.testCanvas)) {
  					var context = this.testCanvas.getContext("2d");

  					var devicePixelRatio = window.devicePixelRatio || 1;
  					var backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;

  					var ratio = devicePixelRatio / backingStoreRatio;
  					// console.log("ratio = ", ratio);
  					return ratio;
  				}
  				return 1;
  			}
  		}, {
  			key: "componentDidMount",
  			value: function componentDidMount() {
  				window.addEventListener("resize", this.handleWindowResize);
  				this.handleWindowResize();
  				/* eslint-disable react/no-did-mount-set-state */
  				this.setState({
  					ratio: this.getRatio()
  				});
  				/* eslint-enable react/no-did-mount-set-state */
  			}
  		}, {
  			key: "componentWillUnmount",
  			value: function componentWillUnmount() {
  				window.removeEventListener("resize", this.handleWindowResize);
  			}
  		}, {
  			key: "handleWindowResize",
  			value: function handleWindowResize() {
  				var _this2 = this;

  				this.setState({
  					width: 0
  				}, function () {
  					var el = _this2.node;

  					var _window$getComputedSt = window.getComputedStyle(el.parentNode),
  					    width = _window$getComputedSt.width,
  					    paddingLeft = _window$getComputedSt.paddingLeft,
  					    paddingRight = _window$getComputedSt.paddingRight;

  					var w = parseFloat(width) - (parseFloat(paddingLeft) + parseFloat(paddingRight));

  					_this2.setState({
  						width: Math.round(Math.max(w, minWidth))
  					});
  				});
  			}
  		}, {
  			key: "getWrappedInstance",
  			value: function getWrappedInstance() {
  				return this.node;
  			}
  		}, {
  			key: "render",
  			value: function render() {
  				var ref = withRef ? { ref: this.saveNode } : {};

  				if (this.state.width) {
  					return React__default.createElement(WrappedComponent, _extends$17({ width: this.state.width, ratio: this.state.ratio }, this.props, ref));
  				} else {
  					return React__default.createElement(
  						"div",
  						ref,
  						React__default.createElement("canvas", { ref: this.setTestCanvas })
  					);
  				}
  			}
  		}]);

  		return ResponsiveComponent;
  	}(React.Component);

  	ResponsiveComponent.displayName = "fitWidth(" + getDisplayName(WrappedComponent) + ")";

  	return ResponsiveComponent;
  }

  var _extends$18 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  var _createClass$37 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$37(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$37(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$37(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  function getDisplayName$1(Series) {
  	var name = Series.displayName || Series.name || "Series";
  	return name;
  }

  function fitDimensions(WrappedComponent) {
  	var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  	var _props$minWidth = props.minWidth,
  	    minWidth = _props$minWidth === undefined ? 100 : _props$minWidth,
  	    _props$minHeight = props.minHeight,
  	    minHeight = _props$minHeight === undefined ? 100 : _props$minHeight,
  	    ratio = props.ratio,
  	    width = props.width,
  	    height = props.height;


  	function getDimensions(el) {
  		var w = el.parentNode.clientWidth;
  		var h = el.parentNode.clientHeight;

  		return {
  			width: isDefined(width) ? width : Math.max(w, minWidth),
  			height: isDefined(height) ? height : Math.max(h, minHeight)
  		};
  	}

  	var ResponsiveComponent = function (_Component) {
  		_inherits$37(ResponsiveComponent, _Component);

  		function ResponsiveComponent(props) {
  			_classCallCheck$37(this, ResponsiveComponent);

  			var _this = _possibleConstructorReturn$37(this, (ResponsiveComponent.__proto__ || Object.getPrototypeOf(ResponsiveComponent)).call(this, props));

  			_this.handleWindowResize = _this.handleWindowResize.bind(_this);
  			_this.getWrappedInstance = _this.getWrappedInstance.bind(_this);
  			_this.saveNode = _this.saveNode.bind(_this);
  			_this.setTestCanvas = _this.setTestCanvas.bind(_this);
  			_this.state = {};
  			return _this;
  		}

  		_createClass$37(ResponsiveComponent, [{
  			key: "saveNode",
  			value: function saveNode(node) {
  				this.node = node;
  			}
  		}, {
  			key: "setTestCanvas",
  			value: function setTestCanvas(node) {
  				this.testCanvas = node;
  			}
  		}, {
  			key: "getRatio",
  			value: function getRatio() {
  				if (isDefined(this.testCanvas)) {
  					var context = this.testCanvas.getContext("2d");

  					var devicePixelRatio = window.devicePixelRatio || 1;
  					var backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;

  					var _ratio = devicePixelRatio / backingStoreRatio;
  					// console.log("ratio = ", ratio);
  					return _ratio;
  				}
  				return 1;
  			}
  		}, {
  			key: "componentDidMount",
  			value: function componentDidMount() {
  				window.addEventListener("resize", this.handleWindowResize);
  				var dimensions = getDimensions(this.node);

  				/* eslint-disable react/no-did-mount-set-state */
  				this.setState(_extends$18({}, dimensions, {
  					ratio: isDefined(ratio) ? ratio : this.getRatio()
  				}));
  				/* eslint-enable react/no-did-mount-set-state */
  			}
  		}, {
  			key: "componentWillUnmount",
  			value: function componentWillUnmount() {
  				window.removeEventListener("resize", this.handleWindowResize);
  			}
  		}, {
  			key: "handleWindowResize",
  			value: function handleWindowResize() {
  				var node = ReactDOM.findDOMNode(this.node); // eslint-disable-line react/no-find-dom-node
  				this.setState(getDimensions(node));
  			}
  		}, {
  			key: "getWrappedInstance",
  			value: function getWrappedInstance() {
  				return this.node;
  			}
  		}, {
  			key: "render",
  			value: function render() {
  				var ref = { ref: this.saveNode };

  				if (this.state.width) {
  					return React__default.createElement(WrappedComponent, _extends$18({
  						height: this.state.height,
  						width: this.state.width,
  						ratio: this.state.ratio
  					}, this.props, ref));
  				} else {
  					return React__default.createElement(
  						"div",
  						ref,
  						React__default.createElement("canvas", { ref: this.setTestCanvas })
  					);
  				}
  			}
  		}]);

  		return ResponsiveComponent;
  	}(React.Component);

  	ResponsiveComponent.displayName = "fitDimensions(" + getDisplayName$1(WrappedComponent) + ")";

  	return ResponsiveComponent;
  }

  document.currentScript.exports = {
    ReactStockcharts: Object.assign({}, ReactStockcharts,
      {BarSeries: BarSeries,
      LineSeries: LineSeries,
      CandlestickSeries: CandlestickSeries,
      discontinuousTimeScaleProvider: discontinuousTimeScaleProvider,
      fitWidth: fitWidth,
      fitDimensions: fitDimensions,
      last: last,
      XAxis: XAxis,
      YAxis: YAxis}),
  };

})));
