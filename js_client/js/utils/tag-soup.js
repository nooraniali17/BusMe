/**
 * Set attribute on `el` such that the element will approximate
 * `<{{ el }} {{ k }}="{{ v }}" />`.
 */
function setAttribute (el, k, v) {
  const attr = document.createAttribute(k);
  attr.value = v;
  el.setAttributeNode(attr);
}

/**
 * Set event listener on `el` such that the element will approximate
 * `<{{ el }} on{{ k }}="{{ fn }}" />`.
 */
function addEventListener (el, k, fn) {
  if (typeof fn === 'function') {
    el.addEventListener(k, fn);
  } else {
    const { on, opts } = fn;
    el.addEventListener(k, on, opts);
  }
}

/**
 * Add all attributes to element.
 * 
 * @param props Property object, with `events` being specially handled.
 */
function addAttributes (el, props) {
  // events
  if (props.events) {
    for (const [k, fn] of Object.entries(props.events)) {
      addEventListener(el, k, fn);
    }
    delete props.events;
  }

  // attributes
  for (const [k, v] of Object.entries(props)) {
    setAttribute(el, k, v);
  }
}

/**
 * Attach children to element.
 * 
 * @param  {...any} children Elements or strings (for text nodes).
 */
function addChildren (el, ...children) {
  for (let child of children) {
    if (typeof child === 'string') {
      child = document.createTextNode(child);
    }
    el.appendChild(child);
  }
}

/**
 * Create HTML element generator.
 * 
 * @param {*} tag Tag name to create.
 */
function htmlElement (tag) {
  return (props = {}, ...children) => {
    const el = document.createElement(tag);

    // remove all falsey children
    children = children.filter(o => o);

    if (props instanceof HTMLElement || typeof props === 'string') {
      addChildren(el, props, ...children);
    } else {
      if (props) {
        addAttributes(el, props);
      }
      addChildren(el, ...children);
    }

    return el;
  };
}

const tagSouper = new Proxy({ _: {} }, {
  get: function ({ _ }, k) {
    if (k === '_') {
      return undefined;
    }
    const tagName = k.replace('_', '-')
      .replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
    return _[k] = _[k] || htmlElement(tagName);
  }
});

/**
 * Create a document fragment like
 *
 * ```js
 * tagSoup(t => t.div(
 *  { ...attrs, events: { ...cbs, eventName: { on: () => {}, opts: {} } } },
 *  t.div(),
 *  t.div(), // children
 *  "text", // text children
 *  t.div(t.div()), // nested children
 * ));
 * ```
 *
 * which yields something effectively equivalent to
 *
 * ```html
 * <div ...attrs ...cbs oneventName="() => {}">
 *  <div></div>
 *  <div></div>
 *  text
 *  <div>
 *    <div></div>
 *  </div>
 * </div>
 * ```
 */
export default function tagSoup (cb) {
  return cb(tagSouper);
}
