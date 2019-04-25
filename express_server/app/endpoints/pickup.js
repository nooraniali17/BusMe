const access = require('../db/access');

exports['/api/pickup'] = {
  /**
   * Pick users up.
   *
   * ```yaml
   * schema:
   *  - is: str
   *    desc: List of tokens to cancel.
   * ```
   */
  post: async ({ body = [] }, res) => {
    await Promise.all([...new Set(body)].map(access.cancelCheckin));
    return res.sendStatus(204);
  }
};
