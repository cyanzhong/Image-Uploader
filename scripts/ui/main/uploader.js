const builder = require("../builder");
const service = require("../../service");
const util = require("../../util");
const tools = require("../../tools/image");
const limiter = require("../../tools/limiter");
const history = require("../../storage/history");
const strings = require("../constants/strings");

function startUploading(views, states, contextActions, images, uploader, context = {}) {
  const mainView = views.main();
  const emptyView = views.empty();
  const failed = [];
  const localUpdates = [];
  const counter = { remaining: images.length };

  images.forEach((image, index) => {
    mainView.hidden = false;
    emptyView.alpha = 0;

    limiter.schedule(resolve => {
      $thread.background(() => {
        const thumb = tools.makeThumb(image);
        const value = builder.makePlaceholder(thumb);
        states.data.unshift(thumb);
        history.save(states.data);

        $thread.main(async() => {
          mainView.insert({ value, index: 0 });
          await $wait(0.4); // Delay to wait insert animation
          const result = await service.uploadFile(image, thumb, uploader);
          history.update(states.data, result);

          // Queue errors, they will be shown after finishing all task
          if (result.error) {
            failed.push(result);
          } else {
            // Queue local updates
            if (context.replacePaths) {
              localUpdates.push({
                local: context.localItems[index],
                uploaded: result
              });
            }
          }

          --counter.remaining;
          if (counter.remaining === 0) {
            if (localUpdates.length > 0) {
              util.replaceIntoDocument(localUpdates);
            }
            if (failed.length > 0) {
              presentFailed(failed);
            }
          }

          contextActions.reloadData();
          if (resolve) {
            // Delay to wait animation
            $delay(0.2, resolve);
          }
        });
      });
    });
  });
}

function presentFailed(failed) {
  $ui.alert({
    title: strings.finished_with_errors,
    message: `${failed.length} ${failed.length === 1 ? strings.failed_to_upload_singular : strings.failed_to_upload_plural}`,
    actions: [
      {
        title: strings.check_out_errors,
        handler: () => {
          const viewer = require("../views/errors-viewer");
          viewer.push(failed);
        }
      },
      {
        title: strings.cancel,
        style: $alertActionType.cancel
      }
    ]
  });
}

module.exports = startUploading;