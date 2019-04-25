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
      `Object ${obj} must contain properties ${propNames}, got ${props} instead`);
  }

  return [...props, ...optNames.map(k => obj[k])];
};
