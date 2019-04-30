const imported = {};

function createId (len = 10) {
  let candidate;

  do {
    candidate = [
      ...crypto.getRandomValues(new Uint16Array(10))
    ].map(v => v.toString(36)).join('');
  // don't overwrite anything and choose another name if necessary
  } while (window[candidate]);

  return candidate;
}

function createUrl (baseURL, key, libraries) {
  const gmapsURL = new URL(baseURL);
  const gmapsParams = gmapsURL.searchParams;
  gmapsParams.set('key', key);
  gmapsParams.set('libraries', libraries.join(','));
  return gmapsURL;
}

export default function loadGmaps ({
  baseURL = 'https://maps.googleapis.com/maps/api/js',
  key,
  libraries = [],
  timeoutMs = 10000
} = {}) {
  const url = createUrl(baseURL, key, libraries);
  return imported[url] = imported[url] || new Promise((y, n) => {
    const callback = createId();
    url.searchParams.set('callback', callback);

    const timeout = setTimeout(() => {
      window[callback] = () => {};
      n(new Error(`Google maps timed out after ${timeoutMs} ms.`));
    }, timeoutMs);

    const script = document.createElement('script');
    script.src = url;

    window[callback] = () => {
      clearTimeout(timeout);
      delete window[callback];
      y(window.google.maps);
    };
    document.body.appendChild(script);
  });
}
