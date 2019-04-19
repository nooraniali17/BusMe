const config = require("config");
const app = require("./app");

let greenlockConfig;
try {
  greenlockConfig = config.get("greenlock");
} catch (e) { }

if (greenlockConfig) {
  require("greenlock-express").create({
    ...greenlockConfig,
    store: require("greenlock-store-fs"),
    app,
  }).listen(80, 443, () => console.log("listening on public (80/443)."));
} else {
  const port = config.get("port");
  app.listen(port, () => console.log("listening on port", port));
}