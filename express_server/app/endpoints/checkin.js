const access = require('../db/access');
const { pick } = require('../util');

exports['/api/checkin'] = {
  /**
   * Get all checkins (table dump).
   */
  async get (req, res) {
    res.send(await access.getCheckins());
  },

  /**
   * Add new checkin.
   *
   * ```yaml
   * schema:
   *  passengers:
   *    is: int
   *    desc: number of passengers (1..10).
   *  name:
   *    is: str
   *    desc: party name.
   *  placeid:
   *    is: str
   *    desc: google maps place id for the stop.
   *
   * returns:
   *  is: str
   *  desc: |
   *    ID (in opaque ID:token format) for future reference in
   *    `POST /api/checkin/cancel`.
   * ```
   */
  async post ({ body = {} }, res) {
    let args;
    try {
      args = pick(body, ['passengers', 'name', 'placeid']);
    } catch (e) {
      console.log(e.message);
      return res.sendStatus(400);
    }

    try {
      return res.send({ token: await access.createCheckin(...args) });
    } catch (e) {
      if (e.code === 'SQLITE_CONSTRAINT') {
        console.log('constraint violated, probably passenger count.');
        console.log('requires [1..10], got', body.passengers);
        return res.sendStatus(400);
      }
      throw e;
    }
  }
};

exports['/api/checkin/info'] = {
  /**
   * Get checkin info. Returns a single entry of the type of `GET /api/checkin`.
   *
   * ```yaml
   * schema:
   *  token:
   *    is: str
   *    desc: String from `POST /api/checkin` to get info about.
   * ```
   */
  async post ({ body = {} }, res) {
    let token;
    try {
      [token] = pick(body, ['token']);
    } catch (e) {
      console.log(e.message);
      return res.sendStatus(400);
    }

    const checkin = await access.getCheckinForToken(token);
    if (checkin) {
      return res.send(checkin);
    }
    return res.sendStatus(404);
  }
};

exports['/api/checkin/cancel'] = {
  /**
   * Cancel checkin.
   *
   * ```yaml
   * schema:
   *  token:
   *    is: str
   *    desc: String from `POST /api/checkin` to validate cancel.
   * ```
   */
  async post ({ body = {} }, res) {
    let token;
    try {
      [token] = pick(body, ['token']);
    } catch (e) {
      console.log(e.message);
      return res.sendStatus(400);
    }

    if (await access.cancelCheckin(token)) {
      return res.sendStatus(204);
    }
    return res.sendStatus(401);
  }
};
