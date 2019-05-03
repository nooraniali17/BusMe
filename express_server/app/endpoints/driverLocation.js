const access = require('../db/access');
const { pick } = require('../util');

exports['/api/driverLocation/'] = {
    /**
     * Get Driver Location.
     */
    async get(req, res) {
        res.send(await access.getDrivers());
    }
}

exports['/api/driverLocation/update'] = {
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
    async post ({ body = {} }, res) {
        let args;
        try {
            args = pick(body, ['id', 'lat', 'long']);
        } catch (e) {
            console.log(e.message);
            return res.sendStatus(400);
        }
        try {
            return res.send({ token: await access.updateDriver(...args) });
        } catch (e) {
            console.log(e.message);
            return res.sendStatus(401);
        }
    }
}