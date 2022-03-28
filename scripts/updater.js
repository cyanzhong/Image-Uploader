const util = require("./util");
const strings = require("./ui/constants/strings");

async function check() {
  const { response, data } = await $http.get("https://raw.githubusercontent.com/cyanzhong/Image-Uploader/main/version.conf");
  if (response.statusCode !== 200 || typeof data !== "string") {
    return;
  }

  const current = (() => {
    if (typeof __IMAGE_UPLOADER_VERSION__ === "undefined") {
      return $file.read("version.conf").string;
    } else {
      return __IMAGE_UPLOADER_VERSION__;
    }
  })();

  if (current === data) {
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

  // Only dismiss the view controller,
  // don't tear down the engine yet
  const controller = $ui.controller.ocValue();
  controller.$dismissViewControllerAnimated_completion(true, $block("void, void", () => {
    if (util.onTaio) {
      const url = encodeURIComponent(strings.taio_update_url);
      $app.openURL(`taio://actions?action=import&url=${url}`);
    } else {
      const url = encodeURIComponent("https://raw.githubusercontent.com/cyanzhong/Image-Uploader/main/dist/image-uploader.zip");
      $app.openURL(`jsbox://import?url=${url}&name=${encodeURIComponent($addin.current.name)}`);
    }

    $app.close();
  }));
}

module.exports = {
  check 
}