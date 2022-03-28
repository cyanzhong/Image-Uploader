const paths = require("./paths");
const strings = require("../ui/constants/strings");
const fs = require("../tools/fs");
const taptic = require("../tools/taptic");
const cacheKey = "app.taio.image-uploader.history";

const keyPaths = {
  data: "/data.json",
  thumbnails: "/thumbnails",
  archive: "/backup.zip",
}

function all() {
  return $cache.get(cacheKey) || [];
}

function insert(item) {
  const list = all();
  list.unshift(item);
  save(list);
}

function save(list) {
  $cache.set(cacheKey, list);
}

function update(list, result) {
  if (!result) {
    return;
  }

  for (const item of list) {
    if (item.localPath === result.localPath) {
      Object.assign(item, result);
      break;
    } 
  }

  save(list);
}

async function backup() {
  $ui.loading(true);

  const folder = paths.backup;
  $file.delete(folder);
  $file.mkdir(folder);

  // Copy metadata
  const data = $data({ "string": JSON.stringify(all()) });
  $file.write({
    data,
    path: folder + keyPaths.data
  });

  // Copy thumbnails
  fs.copy(paths.thumbnails, folder + keyPaths.thumbnails);

  // Make archive
  $file.delete(keyPaths.archive);
  const success = await $archiver.zip({
    directory: folder,
    dest: keyPaths.archive
  });

  $file.delete(folder);
  $delay(0.5, () => $ui.loading(false));

  if (success) {
    const saved = await $drive.save({
      data: $file.read(keyPaths.archive),
      name: `${strings.archive}.zip`
    });

    $file.delete(keyPaths.archive);
    if (saved) {
      taptic.success();
    }
  } else {
    taptic.error();
  }
}

async function restore(resolve) {
  // Open file
  const file = await $drive.open({
    types: [
      "com.pkware.zip-archive",
      "org.gnu.gnu-zip-archive",
      "org.gnu.gnu-zip-tar-archive",
    ]
  });

  if (!file) {
    return;
  }

  const folder = paths.backup;
  $file.delete(folder);
  $file.mkdir(folder);

  // Expand zip
  $ui.loading(true);
  const success = await $archiver.unzip({
    file,
    dest: folder
  });

  // Restore
  if (success && $file.exists(folder + keyPaths.data) && $file.isDirectory(folder + keyPaths.thumbnails)) {
    const list = JSON.parse($file.read(folder + keyPaths.data).string);
    if (!$file.isDirectory(paths.thumbnails)) {
      $file.mkdir(paths.thumbnails);
    }

    const merge = () => {
      // Images
      const fileNames = $file.list(folder + keyPaths.thumbnails);
      for (const fileName of fileNames) {
        const filePath = `/${fileName}`;
        const destination = paths.thumbnails + filePath;
        if (!$file.exists(destination)) {
          fs.copy(folder + keyPaths.thumbnails + filePath, destination);
        }
      }

      // Metadata
      const existing = all();
      const identifiers = new Set(existing.map(item => item.localPath));
      const buffer = [];
      for (const item of list) {
        if (!identifiers.has(item.localPath)) {
          buffer.push(item);
        }
      }

      existing.unshift(...buffer);
      save(existing);
      $file.delete(folder);

      if (resolve) {
        resolve();
      }
    }

    const overwrite = () => {
      $file.delete(paths.thumbnails); // Drop all
      fs.copy(folder + keyPaths.thumbnails, paths.thumbnails);

      save(list);
      $file.delete(folder);

      if (resolve) {
        resolve();
      }
    }

    $ui.alert({
      title: strings.restore_images,
      message: strings.restore_images_message,
      actions: [
        {
          title: strings.merge,
          handler: merge
        },
        {
          title: strings.overwrite,
          style: $alertActionType.destructive,
          handler: overwrite
        },
        {
          title: strings.cancel,
          style: $alertActionType.cancel
        }
      ]
    });
  } else {
    taptic.error();
  }

  $delay(0.5, () => $ui.loading(false));
}

module.exports = {
  all,
  insert,
  save,
  update,
  backup,
  restore
}