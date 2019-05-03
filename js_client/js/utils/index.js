/**
 * Promisified `setTimeout`.
 *
 * @param {number} timeMs Time to sleep, in milliseconds. See `setTimeout`.
 * @param {any} ret Return/continuation value, can be anything.
 */
export function sleep (timeMs, ret) {
  return new Promise(y => setTimeout(() => y(ret), timeMs));
}
