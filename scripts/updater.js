const util = require("./util");
const strings = require("./ui/constants/strings");

async function check() {
  const { response, data } = await $http.get("https://raw.githubusercontent.com/cyanzhong/Image-Uploader/main/config.json");
  if (response.statusCode !== 200 || typeof data !== "object") {
    return;
  }

  if (data.info.version === $addin.current.version) {
    return;
  }

  const { index } = await $ui.alert({
    title: strings.found_new_version,
    message: strings.update_to_new_version,
    actions: [
      { title: strings.update },
      { title: strings.cancel, style: $alertActionType.cancel }
    ]
  });

  if (index !== 0) {
    return;
  }

  if (util.onTaio) {
    const url = encodeURIComponent(strings.taio_update_url);
    $app.openURL(`taio://actions?action=import&url=${url}`);
  } else {
    const url = encodeURIComponent("https://raw.githubusercontent.com/cyanzhong/Image-Uploader/main/dist/image-uploader.js");
    $app.openURL(`jsbox://import?url=${url}&name=${encodeURIComponent($addin.current.name)}`);
  }

  $app.close();
}

module.exports = {
  check 
}