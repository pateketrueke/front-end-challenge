export function save(target) {
  return ref => {
    target.$el = ref;
  };
}

export function toggle(props, target, className) {
  return e => {
    e.preventDefault();

    if (props.values.indexOf(target.key) !== -1) {
      props.unset(target);
      return;
    }

    props.set(target);
  };
}
