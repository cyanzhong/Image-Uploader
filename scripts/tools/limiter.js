const Bottleneck = require("../libs/bottleneck");
const limiter = new Bottleneck({
  maxConcurrent: 5
});

function schedule(task) {
  limiter.schedule(() => new Promise(task));
}

module.exports = {
  schedule
}