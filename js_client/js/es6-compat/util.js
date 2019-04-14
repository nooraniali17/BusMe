export function sleep(time_s, ...result) {
  return new Promise(y => setTimeout(y, time_s * 1000, ...result))
}
