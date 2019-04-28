/**
 * Pick properties from object into array.
 *
 * @param obj Object to pick properties from.
 * @param propNames Mandatory property names.
 * @param optNames Optional property names.
 */
exports.pick = (obj = {}, propNames = [], optNames = []) => {
  const props = propNames.map(k => obj[k]);

  if (!props.every(p => p != null)) {
    throw new TypeError(
      `Object ${JSON.stringify(obj)} must contain non-null properties [${
        propNames}], got [${props}]`);
  }

  return [...props, ...optNames.map(k => obj[k])];
};
