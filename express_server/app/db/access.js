const { promisify } = require('util');
const randomBytes = promisify(require('crypto').randomBytes);

const config = require('config');
const SQL = require('sql-template-strings');

const db = require('../db');

/**
 * Convert `[id, token]` tuple into `'${id}:${token}'` string.
 *
 * @see parseToken The reverse operation.
 */
function createToken(id, cancel) {
    const tokenPart = id.toString(config.get('token_radix'));
    return `${tokenPart}:${cancel}`;
}

/**
 * Convert `'${id}:${token}'` string into `[id, token]` tuple.
 *
 * @see createToken The reverse operation.
 */
function parseToken(token) {
    const [id, cancel] = token.split(':');
    return [parseInt(id, config.get('token_radix')), cancel];
}

/**
 * Get all checkins, almost a direct table dump.
 */
exports.getCheckins = async() => {
    const checkins = await db.all(`
    select
      checkin.id,
      checkin.name,
      checkin.passengers,
      checkin.cancel,
      stop.placeid
    from checkin
    inner join stop on stop.id = checkin.fk_stop
    where
      checkin.active
  `);

    return checkins.map(({ id, cancel, ...rest }) => {
        return {...rest, token: createToken(id, cancel) };
    });
};

exports.updateDriver = async(id, lat, long) => {
    await db.run(SQL `
    update driver 
    set long=${long}, lat=${lat} 
    where id=${id}
  `);

    return id;
};

exports.getDrivers = async() => {
    return db.all(`
    SELECT * 
    FROM driver
  `);
};

exports.getCheckinForToken = async (token) => {
  const [id, cancel] = parseToken(token);

  const checkin = await db.get(SQL`
    select
      checkin.name,
      checkin.passengers,
      stop.placeid
    from checkin
    inner join stop on stop.id = checkin.fk_stop
    where
      checkin.active
      and checkin.id = ${id}
      and checkin.cancel = ${cancel}
  `);

  return checkin;
}

/**
 * Convert stop to unique key. (Get or create)
 *
 * @param stop Stop by Google Maps place ID (e.g.
 * `ChIJrSRfGH3pj4ARm2lRTYi8PeI`).
 */
async function getStopFk(stop) {
    await db.run(SQL `
    insert or ignore into stop
      (placeid)
    values (${stop})
  `);

    const { id } = await db.get(SQL `
    select id from stop
    where
      placeid = ${stop}
  `);

    return id;
}

/**
 * @param pass Number of passengers ([1..10]).
 * @param name Party name.
 * @param placeid Stop to check in to.
 */
exports.createCheckin = async(pass, name, placeid) => {
    const cancel = (await randomBytes(18)).toString('base64');
    const { lastID } = await db.run(SQL `
    insert into checkin (name, passengers, fk_stop, cancel)
    values (${name}, ${pass}, ${await getStopFk(placeid)}, ${cancel})
  `);
    const tokenPart = lastID.toString(config.get('token_radix'));
    return `${tokenPart}:${cancel}`;
};

/**
 * @param token `'${id}:${token}'` string.
 * @return Whether or not it is a valid checkin.
 */
exports.cancelCheckin = async(token) => {
    const [id, cancel] = parseToken(token);

    const checkin = await db.get(SQL `
    select cancel from checkin
    where id = ${id}
  `);

    const valid = checkin && checkin.cancel === cancel;
    if (valid) {
        await db.run(SQL `
      update checkin
      set active = false
      where
        id = ${id}
    `);
    } else {
        console.log(token, 'is not a valid checkin');
    }
    return valid;
};