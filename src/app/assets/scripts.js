import { throttle } from './components/_/util';

const _stats = document.querySelector('.stats');

let isSticky;

function update() {
  if (window.innerHeight > 800) {
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

window.addEventListener('resize', throttle(update));
