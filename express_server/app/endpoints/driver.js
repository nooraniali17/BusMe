const access = require('../db/access');
const { pick } = require('../util');

exports['/api/driver'] = {
  /**
   * Get Driver Location.
   */
  async get (req, res) {
    res.send(await access.getDrivers());
  },

  /**
   * Update Driver Location.
   *
   * ```yaml
   * schema:
   *  id:
   *    is: int
   *    desc: id of the driver.
   *  lat:
   *    is: real
   *    desc: latitude of drivers location
   *  long:
   *    is: real
   *    desc: longitude of drivers location
   * ```
   */
  async put ({ body = {} }, res) {
    let args;
    try {
      args = pick(body, ['id', 'lat', 'lng']);
    } catch (e) {
      console.log(e.message);
      return res.sendStatus(400);
    }
    await access.updateDriver(...args);
    return res.sendStatus(204);
  }
};
