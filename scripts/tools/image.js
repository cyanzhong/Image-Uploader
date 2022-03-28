const storage = require("../storage/thumbnail");
const settings = require("../settings");

function makeThumb(file) {
  const image = file.image;
  const size = (() => {
    const side = settings.thumbSize();
    return $size(side, side);
  })();

  const resized = image.resized(size).jpg(0.8);
  return storage.save(resized);
}

module.exports = {
  makeThumb
}