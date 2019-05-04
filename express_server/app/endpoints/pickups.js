const access = require('../db/access');

exports['/api/pickups'] = {
  /**
   * Pick users up.
   *
   * ```yaml
   * schema:
   *  - is: str
   *    desc: List of tokens to "cancel"/"pick up".
   * ```
   */
  async post ({ body = [] }, res) {
    await Promise.all([...new Set(body)].map(access.cancelCheckin));
    return res.sendStatus(204);
  }
};
