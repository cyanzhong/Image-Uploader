const domain = "app.taio.image-uploader.keychain";
const util = require("../util");

function save(text) {
  return update(`id:${$text.uuid}`, text);
}

function update(key, text) {
  $keychain.set(key, text, domain);
  return key;
}

function read(key) {
  if (util.isEncrypted(key)) {
    return $keychain.get(key, domain);
  }
  return key;
}

function remove(key) {
  if (util.isEncrypted(key)) {
    $keychain.remove(key, domain);
  }
}

module.exports = {
  domain,
  save,
  update,
  read,
  remove
}