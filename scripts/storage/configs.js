const keychain = require("./keychain");
const util = require("../util");
const nameKey = "uploader.name";
const filePathKey = "uploader.filepath";
const cacheKey = "app.taio.image-uploader.configs";

function all() {
  return $cache.get(cacheKey) || [];
}

function create(config) {
  const list = all();
  list.unshift(config);
  save(list);
}

function save(list) {
  $cache.set(cacheKey, list);
}

function cleanUp() {
  const validKeys = [];
  all().forEach(config => {
    Object.keys(config).forEach(key => {
      const value = config[key];
      if (util.isEncrypted(value)) {
        validKeys.push(value);
      }
    });
  });

  const storedKeys = $keychain.keys(keychain.domain) || [];
  storedKeys.forEach(key => {
    if (!validKeys.includes(key)) {
      keychain.remove(key);
    }
  });
}

module.exports = {
  nameKey,
  filePathKey,
  all,
  create,
  save,
  cleanUp
}