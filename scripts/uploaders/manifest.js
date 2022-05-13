// Bundler doesn't work with dynamic require
module.exports = {
  s3: require("./s3"),
  azure: require("./azure"),
  b2: require("./b2"),
  imgur: require("./imgur"),
  github: require("./github"),
  gitlab: require("./gitlab"),
  gitee: require("./gitee"),
  smms: require("./smms"),
  oss: require("./oss"),
  cos: require("./cos"),
  bos: require("./bos"),
  obs: require("./obs"),
  kodo: require("./kodo"),
  uss: require("./uss"),
  qingstor: require("./qingstor"),
  custom: require("./custom"),
}