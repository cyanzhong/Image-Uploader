const picker = require("../../picker");
const configs = require("../../storage/configs");
const strings = require("../constants/strings");
const startUploading = require("./uploader");

async function selectImages(source, views, states, contextActions) {
  const uploaders = configs.all();

  if (uploaders.length === 0) {
    $ui.alert({
      title: strings.no_uploader_title,
      message: strings.no_uploader_message,
      actions: [
        {
          title: strings.add_uploader,
          handler: () => {
            const uploaders = require("../views/uploaders");
            $ui.push(uploaders);
          }
        },
        {
          title: strings.cancel,
          style: $alertActionType.cancel
        }
      ]
    });
    return;
  }

  const { images, context } = await picker.selectImages(source);
  if (images.length === 0) {
    return;
  }

  $ui.alert({
    title: strings.select_uploader,
    message: strings.config_uploader_message,
    actions: [
      ...uploaders.map(uploader => {
        return {
          title: uploader[configs.nameKey],
          handler: () => {
            startUploading(views, states, contextActions, images, uploader, context || {});
          }
        }
      }),
      {
        title: strings.cancel,
        style: $alertActionType.cancel
      }
    ]
  });
}

module.exports = {
  selectImages
}