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
        const method = db[k];

        // if method isn't a function, then it's a property. return that instead
        if (typeof method !== 'function') {
          return method;
        }

        // will return promise or object; await will decide if it should
        // continue resolving or return object.
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
  return db.run('delete from pass_info');
});
