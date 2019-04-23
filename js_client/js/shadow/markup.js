function setAttribute(el, k, v) {
  const attr = document.createAttribute(k);
  attr.value = v;
  el.setAttributeNode(attr);
}

function addEventListener(el, k, fn) {
  if (typeof fn === "function") {
    el.addEventListener(k, fn);
  } else {
    const { on, opts } = fn;
    el.addEventListener(k, on, opts);
  }
}

function addAttributes(el, props) {
  // events
  if (props.events) {
    for (const [k, fn] of Object.entries(props.events)) {
      addEventListener(el, k, fn);
    }
    delete props.events;
  }

  // attributes
  for (const [k, v] of Object.entries(props)) {
    setAttribute(el, k, v)
  }
}

function addChildren(el, ...children) {
  for (let child of children) {
    if (typeof child === "string") {
      child = document.createTextNode(child);
    }
    el.appendChild(child);
  }
}

function htmlElement(tag) {
  return (props, ...children) => {
    const el = document.createElement(tag);

    if (props instanceof HTMLElement || typeof props === "string") {
      addChildren(el, props, ...children);
    } else {
      addAttributes(el, props);
      addChildren(el, ...children);
    }
    return el;
  };
}

const tagSouper = new Proxy({ _: {} }, {
  get: function (obj, k) {
    if (k === "_") {
      return undefined;
    }
    const tagName = k.replace("_", "-")
      .replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
    return obj._[k] = obj._[k] || htmlElement(tagName);
  }
});

export default function tagSoup(cb) {
  return cb(tagSouper);
}
