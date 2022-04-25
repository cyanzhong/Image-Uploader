if ($app.isDebugging) {
  $app.idleTimerDisabled = true;
}

const app = require("./scripts/app");
app.init();

const configs = require("./scripts/storage/configs");
configs.cleanUp();

const updater = require("./scripts/updater");
updater.checkForUpdate();

$actions.finish();