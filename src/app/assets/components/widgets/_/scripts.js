/* global _ */

const _stats = document.querySelector('.stats');

const MAX_HEIGHT = 667;

let isSticky;

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
