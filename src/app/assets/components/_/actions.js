export function save(target) {
  return ref => {
    target.$el = ref;
  };
}

export function toggle(props, target, className) {
  return e => {
    e.preventDefault();

    const offset = props.values.indexOf(target);

    if (offset !== -1) {
      props.unset(offset).$el.classList.remove(className);
      return;
    }

    props.set(target).$el.classList.add(className);
  };
}

export default {
  save,
  toggle,
};
