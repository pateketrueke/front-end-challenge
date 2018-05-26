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

const check = (scroller, type) => {
  if (scroller.enabled[type].oldBegin !== scroller.enabled[type].begin) {
    scroller.enabled[type].oldBegin = scroller.enabled[type].begin;

    if (scroller.enabled[type].begin) {
      scroller.classList.add('at-begin');
    } else {
      scroller.classList.remove('at-begin');
    }
  }

  if (scroller.enabled[type].oldEnd !== scroller.enabled[type].end) {
    scroller.enabled[type].oldEnd = scroller.enabled[type].end;

    if (scroller.enabled[type].end) {
      scroller.classList.add('at-end');
    } else {
      scroller.classList.remove('at-end');
    }
  }
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

    check(scroller, 'vertical');
  } else {
    scroller.enabled.horizontal.begin = target.scrollLeft > 0;
    scroller.enabled.horizontal.end = (target.scrollWidth - target.scrollLeft) > target.offsetWidth;

    check(scroller, 'horizontal');
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

const _stats = document.querySelector('.stats');

let isSticky;

function update() {
  if (window.innerHeight > 800) {
    if (!isSticky) {
      isSticky = true;
      _stats.classList.add('is-sticky');
    }
  } else {
    if (isSticky) {
      isSticky = false;
      _stats.classList.remove('is-sticky');
    }
  }

  _scrollers.forEach(scroller => {
    if (!scroller.target) {
      _scrollers.splice(scroller.offset, 1);
    } else {
      scroller.callback();
    }
  });
}

update();

window.addEventListener('resize', throttle(update, 200));
window.Bitso.bindScrollers(document.querySelectorAll('.h-scroll, .v-scroll'));
