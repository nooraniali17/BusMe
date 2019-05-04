const config = require('config');
const schedule = require('node-schedule');
const sqlite = require('sqlite');

/**
 * Create a proxy to a sqlite database object so
 *
 * ```js
 * await (await db).method(...args);
 * ```
 *
 * will turn into something more like
 *
 * ```js
 * await db.method(...args);
 * ```
 *
 * @param db Database filename. Require that the directory exists, but the file
 * itself will be created automatically.
 * @param reset Should the database be reset, if it existed already.
 */
function connect (db, reset = false) {
  return new Proxy(
    (async () => {
      const _ = await sqlite.open(db, { Promise });
      // execute migration script in `migrations/*`, in our case it's just to
      // initialize the database in general.
      if (reset) {
        await _.migrate({ force: 'last' });
      }
      return _;
    })(),
    {
      get: (dbPromise, k) => async (...args) => {
        const db = await dbPromise;

        // this "async proxy" stuff is sort of a weird hack so these comments
        // will state some very obvious things just to be safe.

        const method = db[k];

        // `typeof === function` should cover 99% of callables, but there
        // may be a few cases where `typeof === object` is callable. however,
        // unlike python there's no equivalent of `__call__` so this edge case
        // should be much less frequent.

        // this will also return promises, which will be "absorbed" by `await`.
        if (typeof method !== 'function') {
          return method;
        }

        // the function call will return promise or object; await will decide if
        // it should continue resolving or return the object.
        return method.bind(db)(...args);
      }
    }
  );
}

if (!config.has('db')) {
  throw new Error('Please specify a file in the configuration to use as sqlite database.');
}

let db;

module.exports = db = connect(
  config.get('db'),
  config.has('reset') && config.get('reset')
);

// and schedule a reset of all stops every day at midnight
schedule.scheduleJob({ hour: 0, minute: 0 }, () => {
  console.log('resetting stored stops.');
  return db.run('update checkin set active = false');
});
