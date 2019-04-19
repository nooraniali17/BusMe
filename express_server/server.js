const config = require("config");
const app = require("./app");

try {
  require("greenlock-express").create({
    ...config.get("greenlock"),
    app,
  }).listen(80, 443, () => console.log("listening on public (80/443)."));
} catch (e) {
  const port = config.get("port");
  app.listen(port, () => console.log("listening on port", port))
}
