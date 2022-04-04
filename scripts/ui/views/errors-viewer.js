const templates = require("../templates");
const thumbnail = require("../../storage/thumbnail");
const strings = require("../constants/strings");
const clipboard = require("../../tools/clipboard");

function push(failed) {
  $ui.push({
    props: {
      title: strings.upload_errors
    },
    views: [
      {
        type: "list",
        props: {
          rowHeight: 88,
          template: templates.errors,
          data: failed.map(item => {
            return {
              image: {
                image: thumbnail.imageOf(item)
              },
              label: {
                text: item.error
              }
            }
          })
        },
        layout: $layout.fill,
        events: {
          didSelect: (_, indexPath) => didSelect(failed, indexPath)
        }
      }
    ]
  });
}

function didSelect(failed, indexPath) {
  const error = failed[indexPath.row].error;
  $ui.alert({
    title: strings.upload_errors,
    message: error,
    actions: [
      {
        title: strings.copy,
        handler: () => clipboard.copyText(error)
      },
      {
        title: strings.cancel,
        style: $alertActionType.cancel
      }
    ]
  });
}

module.exports = {
  push
}