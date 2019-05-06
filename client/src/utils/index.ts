/**
 * Promisify `setTimeout`.
 * 
 * @param timeMs Time to sleep.
 * @param ret Return value.
 */
export function sleep<T>(ret: T, timeMs: number) {
  return new Promise(y => setTimeout(() => y(ret), timeMs));
}

/**
 * Promisify `setInterval`.
 * 
 * @param timeMs Time between each loop.
 * @param step Function to call each loop. (Async functions will be awaited)
 * @param args Arguments to supply each call.
 */
export async function loop<A extends readonly any[]>(
  step: (...args: A) => any,
  timeMs: number,
  ...args: A
) {
  do {
    await Promise.resolve(step(...args));
  } while (await sleep(true, timeMs));
}
