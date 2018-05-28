import { toggle } from '../../_/actions';

export function Highlight(props) {
  const suffix = Array.from({
    length: 11 - String(props.value).length
  }).join('0');

  const matches = String(props.value).match(/^(.+?)(0+)$/);

  if (!matches) {
    return (
      <span>
        <span className='hi'>{props.value}</span>{suffix}
      </span>
    );
  }

  return (
    <span>
      <span className='hi'>{matches[1]}</span>{matches[2]}{suffix}
    </span>
  );
}

export function Table(props) {
  return (
    <div className='md-push v-scroll' data-scrollable='tbody'>
      <table className={`full-width ${props.className || ''}`} cellPadding={0} cellSpacing={0}>{props.children}</table>
    </div>
  );
}

export function Caption({ suffix, caption, loading }) {
  if (suffix) {
    return (
      <caption className='pad align-left'>
        <div className='flex'>
          <span className='caps'>{caption}{loading ? '...' : ''}</span>
          {suffix}
        </div>
      </caption>
    );
  }

  return (
    <caption className='pad caps align-left'>
      {caption}{loading ? '...' : ''}
    </caption>
  );
}

export function Header(props) {
  return (
    <thead>
      <tr className='caps'>{props.fields.map(field => (
        <th key={field.key} className={`pad align-${field.align} ${field.classes || ''}`}>{field.label}</th>
      ))}</tr>
    </thead>
  );
}

export function Value(props) {
  if (props.field.key === 'amount') {
    return (
      <Highlight value={props[props.field.key]} />
    );
  }

  if (props.field.key === 'price') {
    return (
      <span className={props.side === 'sell' ? 'up' : 'down'}>{props[props.field.key]}</span>
    );
  }

  if (props.field.key === 'sum') {
    return (
      <span className='flex'>
        <span className='bar align-left'>
          <span style={{
            width: props.width,
          }}></span>
        </span>
        <span className='hi'>{props[props.field.key]}</span>
      </span>
    );
  }

  return (
    <span className='hi'>{props[props.field.key]}</span>
  );
}

export function Body(props) {
  if (props.loading) {
    return (
      <tbody><tr><td className='pad'>Cargando...</td></tr></tbody>
    );
  }

  return (
    <ReactTransitionGroup.TransitionGroup component='tbody'>
      {props.items.map(item => (
        <ReactTransitionGroup.CSSTransition
          classNames={props.grouping || 'data'}
          key={item.key}
          timeout={700}
        >
        <tr key={item.key} onClick={toggle(props, item)}>{props.fields.map(field => (
          <td
            key={field.key}
            className={`pad align-${field.align} ${props.values.indexOf(item.key) === -1 ? '' : 'sel'}`}
          ><Value {...item} field={field} />
          </td>
        ))}</tr>
        </ReactTransitionGroup.CSSTransition>
      ))}
    </ReactTransitionGroup.TransitionGroup>
  );
}

export default {
  Highlight,
  Table,
  Caption,
  Header,
  Value,
  Body,
};
