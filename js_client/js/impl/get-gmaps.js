import loadGmaps from '../es6-compat/gmaps/load.js';

export default function load (opts = {}) {
  return loadGmaps({
    key: 'AIzaSyCDg2zhsGJpYuDRbjC_dUOfiT4bJY0IFA8', ...opts
  });
}
