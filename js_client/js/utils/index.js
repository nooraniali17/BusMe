/**
 * Promisified `setTimeout`.
 *
 * @param {number} timeMs Time to sleep, in milliseconds. See `setTimeout`.
 * @param {any} ret Return/continuation value, can be anything.
 */
export function sleep (timeMs, ret) {
  return new Promise(y => setTimeout(() => y(ret), timeMs));
}

/**
 * Wrap function in infinite loop.
 */
export function loop (cb, interval) {
  return async (...args) => {
    do {
      await cb(...args);
    } while (await sleep(interval, true));
  };
}
