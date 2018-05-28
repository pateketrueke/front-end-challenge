export function toggle(props, target) {
  return e => {
    e.preventDefault();

    if (props.values.indexOf(target.key) !== -1) {
      props.unset(target);
      return;
    }

    props.set(target);
  };
}

export default {
  toggle,
};
