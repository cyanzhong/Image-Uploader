const paths = require("./paths");
const folder = paths.thumbnails;

function pathOf(item) {
  return `${folder}/${item.localPath}`;
}

function imageOf(item) {
  const path = pathOf(item);
  const data = $file.read(path);
  return data ? data.image : null;
}

function save(file) {
  if (!$file.isDirectory(folder)) {
    $file.mkdir(folder);
  }

  const fileName = `${$text.uuid}.jpg`;
  const filePath = `${folder}/${fileName}`;

  $file.write({
    data: file,
    path: filePath
  });

  return {
    localPath: fileName
  }
}

function remove(item) {
  $file.delete(pathOf(item));
}

module.exports = {
  pathOf,
  imageOf,
  save,
  remove
}