(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () {

  function toggle(props, target) {
    return function (e) {
      e.preventDefault();

      if (props.values.indexOf(target.key) !== -1) {
        props.unset(target);
        return;
      }

      props.set(target);
    };
  }

  function Highlight(props) {
    var suffix = Array.from({
      length: 11 - String(props.value).length
    }).join('0');

    var matches = String(props.value).match(/^(.+?)(0+)$/);

    if (!matches) {
      return (
        React.createElement( 'span', null,
          React.createElement( 'span', { className: 'hi' }, props.value), suffix
        )
      );
    }

    return (
      React.createElement( 'span', null,
        React.createElement( 'span', { className: 'hi' }, matches[1]), matches[2], suffix
      )
    );
  }

  function Table(props) {
    return (
      React.createElement( 'div', { className: 'md-push v-scroll', 'data-scrollable': 'tbody' },
        React.createElement( 'table', { className: ("full-width " + (props.className || '')), cellPadding: 0, cellSpacing: 0 }, props.children)
      )
    );
  }

  function Caption(ref) {
    var suffix = ref.suffix;
    var caption = ref.caption;
    var loading = ref.loading;

    if (suffix) {
      return (
        React.createElement( 'caption', { className: 'pad align-left' },
          React.createElement( 'div', { className: 'flex' },
            React.createElement( 'span', { className: 'caps' }, caption, loading ? '...' : ''),
            suffix
          )
        )
      );
    }

    return (
      React.createElement( 'caption', { className: 'pad caps align-left' },
        caption, loading ? '...' : ''
      )
    );
  }

  function Header(props) {
    return (
      React.createElement( 'thead', null,
        React.createElement( 'tr', { className: 'caps' }, props.fields.map(function (field) { return (
          React.createElement( 'th', {
            key: field.key, 'data-currency': field.currency, className: ("pad align-" + (field.align) + " " + (field.classes || '')) }, field.label)
        ); }))
      )
    );
  }

  function Value(props) {
    if (props.field.key === 'amount') {
      return (
        React.createElement( Highlight, { value: props[props.field.key] })
      );
    }

    if (props.field.key === 'price') {
      return (
        React.createElement( 'span', { className: props.side === 'sell' ? 'up' : 'down' }, props[props.field.key])
      );
    }

    if (props.field.key === 'sum') {
      return (
        React.createElement( 'span', { className: 'flex' },
          React.createElement( 'span', { className: 'bar align-left' },
            React.createElement( 'span', { style: {
              width: props.width,
            } })
          ),
          React.createElement( 'span', { className: 'hi' }, props[props.field.key])
        )
      );
    }

    return (
      React.createElement( 'span', { className: 'hi' }, props[props.field.key])
    );
  }

  function Body(props) {
    if (props.loading) {
      return (
        React.createElement( 'tbody', null, React.createElement( 'tr', null, React.createElement( 'td', { className: 'pad' }, "Cargando...") ) )
      );
    }

    return (
      React.createElement( ReactTransitionGroup.TransitionGroup, { component: 'tbody' },
        props.items.map(function (item) { return (
          React.createElement( ReactTransitionGroup.CSSTransition, {
            classNames: props.grouping || 'data', key: item.key, timeout: 1000 },
          React.createElement( 'tr', {
            key: item.key, onClick: toggle(props, item), className: props.values.indexOf(item.key) === -1 ? null : 'sel' }, props.fields.map(function (field) { return (
            React.createElement( 'td', {
              key: field.key, className: ("pad align-" + (field.align)) }, React.createElement( Value, Object.assign({}, item, { field: field }))
            )
          ); }))
          )
        ); })
      )
    );
  }

  function List(props) {
    if (props.loading) {
      return (
        React.createElement( 'div', null,
          React.createElement( 'h4', { className: 'pad caps reset' }, props.caption, "..."),
          React.createElement( 'div', { className: 'pad' }, "Cargando...")
        )
      );
    }

    return (
      React.createElement( 'div', null,
        React.createElement( 'h4', { className: 'pad caps reset' }, props.caption),
        React.createElement( ReactTransitionGroup.TransitionGroup, { className: 'reset no-type v-scroll', component: 'ul' },
          (props.items || []).map(function (item) { return (
            React.createElement( ReactTransitionGroup.CSSTransition, {
              classNames: props.grouping || 'data', key: item.key, timeout: 1000 },
            React.createElement( 'li', {
              key: item.key, className: ("pad " + (props.values.indexOf(item.key) === -1 ? '' : 'sel')) }, props.render(Object.assign({}, item,
              {itemToggle: toggle(props, item),
              selected: props.values.indexOf(item.key) > -1})))
            )
          ); })
        )
      )
    );
  }

  var CustomTable = (function (superclass) {
    function CustomTable(props) {
      superclass.call(this, props);
      this.state = {
        selected: [],
      };
    }

    if ( superclass ) CustomTable.__proto__ = superclass;
    CustomTable.prototype = Object.create( superclass && superclass.prototype );
    CustomTable.prototype.constructor = CustomTable;

    CustomTable.prototype.unselectItem = function unselectItem (key) {
      var offset = this.state.selected.indexOf(key);
      var copy = this.state.selected;

      copy.splice(offset, 1);

      this.setState({
        selected: copy,
      });
    };

    CustomTable.prototype.selectItem = function selectItem (key) {
      var copy = this.state.selected;

      this.setState({
        selected: copy.concat(copy.indexOf(key) === -1 ? key : []),
      });
    };

    CustomTable.prototype.render = function render () {
      var this$1 = this;

      var ref = this.state;
      var selected = ref.selected;
      var ref$1 = this.props;
      var data = ref$1.data;
      var fields = ref$1.fields;
      var caption = ref$1.caption;
      var loading = ref$1.loading;
      var grouping = ref$1.grouping;
      var className = ref$1.className;
      var titleRender = ref$1.titleRender;

      return (
        React.createElement( Table, { className: ("no-sel " + (className || '')) },
          React.createElement( Caption, { caption: caption, loading: loading, suffix: titleRender }),
          React.createElement( Header, { fields: fields }),
          React.createElement( Body, {
            set: function (item) { return this$1.selectItem(item.key); }, unset: function (item) { return this$1.unselectItem(item.key); }, items: data, fields: fields, values: selected, loading: loading, grouping: grouping })
        )
      );
    };

    return CustomTable;
  }(React.Component));

  var CustomList = (function (superclass) {
    function CustomList(props) {
      superclass.call(this, props);
      this.state = {
        selected: [],
      };
    }

    if ( superclass ) CustomList.__proto__ = superclass;
    CustomList.prototype = Object.create( superclass && superclass.prototype );
    CustomList.prototype.constructor = CustomList;

    CustomList.prototype.unselectItem = function unselectItem (key) {
      var offset = this.state.selected.indexOf(key);
      var copy = this.state.selected;

      copy.splice(offset, 1);

      this.setState({
        selected: copy,
      });
    };

    CustomList.prototype.selectItem = function selectItem (key) {
      var copy = this.state.selected;

      this.setState({
        selected: copy.concat(copy.indexOf(key) === -1 ? key : []),
      });
    };

    CustomList.prototype.render = function render () {
      var this$1 = this;

      var ref = this.state;
      var selected = ref.selected;
      var ref$1 = this.props;
      var data = ref$1.data;
      var caption = ref$1.caption;
      var loading = ref$1.loading;
      var grouping = ref$1.grouping;
      var className = ref$1.className;
      var itemRender = ref$1.itemRender;
      var itemToggle = ref$1.itemToggle;

      return (
        React.createElement( List, {
          toggle: itemToggle, render: itemRender, className: ("no-sel " + (className || '')), set: function (item) { return this$1.selectItem(item.key); }, unset: function (item) { return this$1.unselectItem(item.key); }, items: data, values: selected, caption: caption, loading: loading, grouping: grouping })
      );
    };

    return CustomList;
  }(React.Component));

  

  function parseData(payload) {
    return payload.map(function (item) { return ({
      close: parseFloat(item.close),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      open: parseFloat(item.open),
      date: new Date(item.date),
    }); });
  }

  var ref = Bitso.ReactStockcharts;
  var discontinuousTimeScaleProvider = ref.discontinuousTimeScaleProvider;
  var last = ref.last;
  var fitWidth = ref.fitWidth;
  var LineSeries = ref.LineSeries;
  var ChartCanvas = ref.ChartCanvas;
  var Chart = ref.Chart;

  var LineChart = (function (superclass) {
    function LineChart () {
      superclass.apply(this, arguments);
    }

    if ( superclass ) LineChart.__proto__ = superclass;
    LineChart.prototype = Object.create( superclass && superclass.prototype );
    LineChart.prototype.constructor = LineChart;

    LineChart.prototype.render = function render () {
      var initialData = parseData(this.props.data);
      var xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(function (d) { return d.date; });
      var ref = xScaleProvider(initialData);
      var data = ref.data;
      var xScale = ref.xScale;
      var xAccessor = ref.xAccessor;
      var displayXAccessor = ref.displayXAccessor;

      var lastData = last(data);
      var highest = data[Math.max(0, data.length - 150)];
      var start = xAccessor(lastData);
      var end = xAccessor(highest);
      var xExtents = [start, end];

      return (
        React.createElement( ChartCanvas, {
          type: 'hybrid', seriesName: 'timeline', margin: {left:0,top:10,right:0,bottom:0}, width: this.props.width, height: this.props.height, ratio: this.props.ratio, data: data, xScale: xScale, xExtents: xExtents, xAccessor: xAccessor, displayXAccessor: displayXAccessor, mouseMoveEvent: false, panEvent: false, zoomEvent: false, clamp: true },
          React.createElement( Chart, {
            id: 1, yExtents: [function (d) { return [d.high, d.low]; }], height: 80 },
            React.createElement( LineSeries, {
              yAccessor: function (d) { return d.close; }, stroke: this.props.shown == 'up' ? '#80C156' : '#BA3040' })
          )
        )
      );
    };

    return LineChart;
  }(React.Component));

  LineChart.defaultProps = {
    ratio: 1,
    width: 200,
    height: 90,
  };

  var LineChart$1 = fitWidth(LineChart);

  var DeepChart = (function (superclass) {
    function DeepChart () {
      superclass.apply(this, arguments);
    }

    if ( superclass ) DeepChart.__proto__ = superclass;
    DeepChart.prototype = Object.create( superclass && superclass.prototype );
    DeepChart.prototype.constructor = DeepChart;

    DeepChart.prototype.render = function render () {
      return (
        React.createElement( 'div', null, "TODO" )
      );
    };

    return DeepChart;
  }(React.Component));

  

  var ref$1 = Bitso.ReactStockcharts;
  var discontinuousTimeScaleProvider$1 = ref$1.discontinuousTimeScaleProvider;
  var fitDimensions = ref$1.fitDimensions;
  var last$1 = ref$1.last;
  var BarSeries = ref$1.BarSeries;
  var CandlestickSeries = ref$1.CandlestickSeries;
  var ChartCanvas$1 = ref$1.ChartCanvas;
  var Chart$1 = ref$1.Chart;
  var XAxis = ref$1.XAxis;
  var YAxis = ref$1.YAxis;

  var CandleChart = (function (superclass) {
    function CandleChart () {
      superclass.apply(this, arguments);
    }

    if ( superclass ) CandleChart.__proto__ = superclass;
    CandleChart.prototype = Object.create( superclass && superclass.prototype );
    CandleChart.prototype.constructor = CandleChart;

    CandleChart.prototype.render = function render () {
      var this$1 = this;

      var inputData = this.props.data.slice(-(this.props.days));

      var fixedData = inputData.reduce(function (prev, cur, i) {
        if (!(i % this$1.props.pad)) {
          prev.push(cur);
        }

        return prev;
      }, []);

      var xScaleProvider = discontinuousTimeScaleProvider$1.inputDateAccessor(function (d) { return d.date; });
      var ref = xScaleProvider(fixedData);
      var data = ref.data;
      var xScale = ref.xScale;
      var xAccessor = ref.xAccessor;
      var displayXAccessor = ref.displayXAccessor;

      var lastData = last$1(data);
      var highest = data[Math.max(0, data.length - 150)];
      var start = xAccessor(lastData);
      var end = xAccessor(highest);
      var xExtents = [start, end];

      return (
        React.createElement( ChartCanvas$1, {
          type: 'hybrid', seriesName: 'timeline', margin: {left:0,top:20,right:0,bottom:0}, width: this.props.width, height: this.props.height, ratio: this.props.ratio, data: data, xScale: xScale, xExtents: xExtents, xAccessor: xAccessor, displayXAccessor: displayXAccessor, mouseMoveEvent: false, panEvent: false, zoomEvent: false, clamp: true },
          React.createElement( Chart$1, {
            id: 1, yExtents: [function (d) { return [d.high, d.low]; }], height: this.props.height - 70 },
            React.createElement( XAxis, {
              axisAt: 'top', orient: 'top', stroke: 'rgba(56, 69, 85, .6)', tickStroke: 'rgba(56, 69, 85, .8)', innerTickSize: -this.props.height / 2 }),

            React.createElement( YAxis, {
              axisAt: 'right', orient: 'right', stroke: '#191e23', tickStroke: 'rgba(56, 69, 85, .8)', innerTickSize: -this.props.width }),

            React.createElement( CandlestickSeries, {
              fill: function (d) { return (d.close > d.open ? 'rgba(134, 175, 107, .4)' : 'rgba(186, 48, 64, .4)'); }, stroke: function (d) { return (d.close > d.open ? '#80C156' : '#BA3040'); }, wickStroke: function (d) { return (d.close > d.open ? '#80C156' : '#BA3040'); } })
          ),
          React.createElement( Chart$1, {
            id: 2, yExtents: [function (d) { return d.volume; }], height: 50, origin: function (w, h) { return [0, h - 50]; } },
            React.createElement( BarSeries, {
              yAccessor: function (d) { return d.volume; }, fill: 'rgba(55, 70, 85, .4)' })
          )
        )
      );
    };

    return CandleChart;
  }(React.Component));

  CandleChart.defaultProps = {
    ratio: 1,
    width: 800,
    height: 280,
  };

  var CandleChart$1 = fitDimensions(CandleChart);

  

  var Menu = (function (superclass) {
    function Menu(props) {
      superclass.call(this, props);
      this.state = {
        currentValue: this.props.value || null,
      };
    }

    if ( superclass ) Menu.__proto__ = superclass;
    Menu.prototype = Object.create( superclass && superclass.prototype );
    Menu.prototype.constructor = Menu;

    Menu.prototype.handleItem = function handleItem (e, itemInfo) {
      e.preventDefault();
      this.setState({
        currentValue: itemInfo.value,
      });
    };

    Menu.prototype.render = function render () {
      var this$1 = this;

      var items = this.props.items;

      if (this.props.unique) {
        items = items.filter(function (item) { return item.value !== this$1.state.currentValue; });
      }

      return (
        React.createElement( 'div', { className: 'menu' },
          this.props.label && (
            React.createElement( 'span', { className: 'menu-lb' }, this.props.label)
          ),
          React.createElement( 'span', { className: 'menu-pin no-wrap' },
            this.props.renderValue
              ? this.props.renderValue(this.state.currentValue)
              : this.state.currentValue
          ),
          React.createElement( 'ul', { className: 'menu-sub reset no-type no-wrap' },
          items.map(function (item) { return (
            React.createElement( 'li', { key: item.value, className: this$1.state.currentValue === item.value ? 'sel' : null },
              React.createElement( 'a', { href: '#', onClick: function (e) {
                this$1.handleItem(e, item);

                if (this$1.props.onChange) {
                  this$1.props.onChange(item);
                }
              } }, item.label)
            )
          ); })
          )
        )
      );
    };

    return Menu;
  }(React.Component));

  

  var _stats = document.querySelector('.stats');

  var MAX_HEIGHT = 667;

  var isSticky;

  function update() {
    if (window.innerHeight > MAX_HEIGHT) {
      if (!isSticky) {
        isSticky = true;
        _stats.classList.add('is-sticky');
      }
    } else if (isSticky) {
      isSticky = false;
      _stats.classList.remove('is-sticky');
    }
  }

  update();

  window.addEventListener('resize', _.throttle(update, 200));

  document.currentScript.exports = {
    CustomTable: CustomTable,
    CustomList: CustomList,
    LineChart: LineChart$1,
    DeepChart: DeepChart,
    CandleChart: CandleChart$1,
    Menu: Menu,
  };

})));
