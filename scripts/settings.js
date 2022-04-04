const strings = require("./ui/constants/strings");
const util = require("./util");

const keyPaths = {
  thumbColumns: "app.taio.thumb-columns",
  thumbSize: "app.taio.thumb-size",
  compressImages: "app.taio.compress-images",
  compressQuality: "app.taio.compress-quality",
  imageSize: "app.taio.image-size",
}

async function open(reloadData) {
  const thumbColumns = $cache.get(keyPaths.thumbColumns);
  const edited = await $prefs.edit({
    "title": strings.settings,
    "insetGrouped": true,
    "groups": [
      {
        "items": [
          {
            "title": strings.thumbnail_columns,
            "type": "list",
            "items": ["2", "3", "4", "5", "6"],
            "key": keyPaths.thumbColumns,
            "value": thumbColumnsIndex()
          },
          {
            "title": strings.thumbnail_size,
            "type": "list",
            "items": [
              strings.quality_high,
              strings.quality_medium,
              strings.quality_low
            ],
            "key": keyPaths.thumbSize,
            "value": thumbSizeIndex()
          }
        ]
      },
      {
        "items": [
          {
            "title": strings.compress_images,
            "type": "boolean",
            "key": keyPaths.compressImages,
            "value": $cache.get(keyPaths.compressImages) || false
          },
          {
            "title": strings.compress_quality,
            "type": "list",
            "items": [
              strings.quality_high,
              strings.quality_medium,
              strings.quality_low
            ],
            "key": keyPaths.compressQuality,
            "value": $cache.get(keyPaths.compressQuality) || 0
          },
          {
            "title": strings.image_size,
            "type": "list",
            "items": [
              strings.size_raw,
              strings.size_large,
              strings.size_medium,
              strings.size_small
            ],
            "key": keyPaths.imageSize,
            "value": $cache.get(keyPaths.imageSize) || 0
          }
        ]
      },
      {
        "items": [
          {
            "title": strings.about,
            "type": "script",
            "value": `$ui.push({
              props: {
                title: $l10n("ABOUT")
              },
              views: [
                {
                  type: "markdown",
                  props: {
                    content: (() => {
                      const fileName = $l10n("README_FILE");
                      if (typeof __IMAGE_UPLOADER_README__ === "object") {
                        return __IMAGE_UPLOADER_README__[fileName];
                      } else {
                        return $file.read(fileName).string;
                      }
                    })()
                  },
                  layout: $layout.fill
                }
              ]
            })`
          },
          {
            "title": strings.source_code,
            "type": "link",
            "value": "https://github.com/cyanzhong/Image-Uploader"
          }
        ]
      },
      {
        "items": [
          {
            "title": strings.get_latest_version,
            "type": "script",
            "value": (() => {
              if (util.onTaio) {
                return `$app.openURL("${strings.taio_update_url}");`;
              } else {
                return `$app.openURL("jsbox://import?url=${encodeURIComponent('https://github.com/cyanzhong/Image-Uploader/raw/main/dist/image-uploader.zip')}&name=${encodeURIComponent($addin.current.name)}");`;
              }
            })() + "\n\n$app.close();"
          }
        ]
      }
    ]
  });

  edited.groups.forEach(group => {
    const items = group.items;
    items.forEach(item => {
      if (item.key) {
        $cache.set(item.key, item.value);
      }
    });
  });

  if (reloadData && thumbColumns !== $cache.get(keyPaths.thumbColumns)) {
    reloadData();
  }
}

function thumbColumns() {
  return [2, 3, 4, 5, 6][thumbColumnsIndex()];
}

function thumbColumnsIndex() {
  const index = $cache.get(keyPaths.thumbColumns);
  if (index === undefined) {
    return util.onMac ? 3 : 1;
  }

  return index;
}

function thumbSize() {
  return [480, 320, 240][thumbSizeIndex()];
}

function thumbSizeIndex() {
  const index = $cache.get(keyPaths.thumbSize);
  return index === undefined ? 1 : index;
}

function compressImages() {
  return $cache.get(keyPaths.compressImages) || false;
}

function compressQuality() {
  const index = $cache.get(keyPaths.compressQuality) || 0;
  return [0.8, 0.5, 0.3][index];
}

function imageSize() {
  const index = $cache.get(keyPaths.imageSize) || 0;
  return [0, 1920, 1680, 960][index];
}

module.exports = {
  open,
  thumbColumns,
  thumbSize,
  compressImages,
  compressQuality,
  imageSize
}