// $file in JSBox was not designed for absolute paths,
// it won't recognize the destination path if it doesn't exist
const manager = $objc("NSFileManager").$defaultManager();

function copy(src, dest) {
  return manager.$copyItemAtPath_toPath_error(src, dest, null);
}

module.exports = {
  copy
}