const throttle = (func, limit) => {
  let inThrottle;

  return function() {
    const args = arguments;
    const context = this;

    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

const run = (target, scroller, isVertical) => {
  if (!scroller.enabled) {
    scroller.enabled = {
      horizontal: {},
      vertical: {},
    };
  }

  if (isVertical) {
    scroller.enabled.vertical.begin = target.scrollTop > 0;
    scroller.enabled.vertical.end = (target.scrollHeight - target.scrollTop) > target.offsetHeight;

    if (scroller.enabled.vertical.oldBegin !== scroller.enabled.vertical.begin) {
      scroller.enabled.vertical.oldBegin = scroller.enabled.vertical.begin;

      if (scroller.enabled.vertical.begin) {
        scroller.classList.add('at-begin');
      } else {
        scroller.classList.remove('at-begin');
      }
    }

    if (scroller.enabled.vertical.oldEnd !== scroller.enabled.vertical.end) {
      scroller.enabled.vertical.oldEnd = scroller.enabled.vertical.end;

      if (scroller.enabled.vertical.end) {
        scroller.classList.add('at-end');
      } else {
        scroller.classList.remove('at-end');
      }
    }
  } else {
    scroller.enabled.horizontal.begin = target.scrollLeft > 0;
    scroller.enabled.horizontal.end = (target.scrollWidth - target.scrollLeft) > target.offsetWidth;

    if (scroller.enabled.horizontal.oldBegin !== scroller.enabled.horizontal.begin) {
      scroller.enabled.horizontal.oldBegin = scroller.enabled.horizontal.begin;

      if (scroller.enabled.horizontal.begin) {
        scroller.classList.add('at-begin');
      } else {
        scroller.classList.remove('at-begin');
      }
    }

    if (scroller.enabled.horizontal.oldEnd !== scroller.enabled.horizontal.end) {
      scroller.enabled.horizontal.oldEnd = scroller.enabled.horizontal.end;

      if (scroller.enabled.horizontal.end) {
        scroller.classList.add('at-end');
      } else {
        scroller.classList.remove('at-end');
      }
    }
  }

  if (scroller.enabled.vertical.begin || scroller.enabled.vertical.end
  || scroller.enabled.horizontal.begin || scroller.enabled.horizontal.end) {
    if (!scroller.enabled.isEnabled) {
      scroller.enabled.isEnabled = true;
      scroller.classList.add('is-enabled');
    }
  } else {
    if (scroller.enabled.isEnabled) {
      scroller.enabled.isEnabled = null;
      scroller.classList.remove('is-enabled');
    }
  }
};

const _scrollers = [];

window.Bitso = window.Bitso || {};
window.Bitso.updateScroller = target => {
  const scroller = _scrollers
    .find(x => x.target === target || x.source === target);

  if (scroller) {
    scroller.callback();
  }
};

window.Bitso.bindScrollers = sources => {
  sources.forEach(scroller => {
    const target = scroller.querySelector(scroller.dataset.scrollable) || scroller;

    if (target) {
      const isVertical = scroller.classList.contains('v-scroll');
      const callback = () => run(target, scroller, isVertical);

      target.addEventListener('scroll', callback);

      _scrollers.push({
        offset: _scrollers.length,
        source: scroller,
        target,
        callback,
      });

      callback();
    }
  });
};

function update() {
  _scrollers.forEach(scroller => {
    if (!scroller.target) {
      _scrollers.splice(scroller.offset, 1);
    } else {
      scroller.callback();
    }
  });
}

window.addEventListener('resize', throttle(update, 200));
window.Bitso.bindScrollers(document.querySelectorAll('.h-scroll, .v-scroll'));
