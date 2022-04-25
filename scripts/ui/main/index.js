const menus = require("./menus");
const actions = require("./actions");
const builder = require("../builder");
const strings = require("../constants/strings");
const colors = require("../constants/colors");
const dimensions = require("../constants/dimensions");
const templates = require("../templates");
const util = require("../../util");
const history = require("../../storage/history");
const service = require("../../service");
const taptic = require("../../tools/taptic");
const settings = require("../../settings");
const symbols = require("../constants/symbols");

const states = {
  data: history.all(),
  bulkEditing: false,
  selectedIndices: []
}

const views = {
  main: () => $("history-view"),
  empty: () => $("history-empty"),
  toolbar: () => $("main-toolbar"),
  numberOfUploads: () => $("number-of-uploads"),
}

const contextActions = {
  reloadData,
  toggleBulkEditing,
  endBulkEditing,
  selectAll,
  deselectAll,
  reloadFooter,
  reloadToolbar,
}

const actionHandlers = indexPath => {
  return {
    insertIntoDocument: () => actions.insertIntoDocument(states, indexPath),
    copyURL: () => actions.copyURL(states, indexPath),
    copyHTML: () => actions.copyHTML(states, indexPath),
    copyMarkdown: () => actions.copyMarkdown(states, indexPath),
    copyBBCode: () => actions.copyBBCode(states, indexPath),
    openInBrowser: () => actions.openInBrowser(states, indexPath),
    deleteItem: () => {
      actions.deleteItem(views, states, indexPath, contextActions);
      $ui.pop();
    }
  }
}

function render() {
  $ui.render({
    props: {
      title: "",
      formSheet: true,
      navButtons: menus.buildMainMenu(states, contextActions),
      keyCommands: [
        {
          input: "V", // cmd-v to paste images
          modifiers: 1 << 20,
          title: strings.source_clipboard,
          handler: () => {
            const { sources } = require("../../picker");
            const { selectImages } = require("./image-picker");
            selectImages(sources.clipboard, views, states, contextActions);
          }
        }
      ]
    },
    views: [
      {
        type: "matrix",
        props: {
          id: "history-view",
          spacing: dimensions.spacingOfCells,
          contentInset: $insets(0, 0, dimensions.toolbarHeight, 0),
          indicatorInsets: $insets(0, 0, dimensions.toolbarHeight, 0),
          menu: menus.buildContextMenu(actionHandlers),
          footer: {
            type: "view",
            props: { height: dimensions.footerHeight } // Just to reserve height
          },
          template: templates.table
        },
        layout: (make, view) => {
          make.left.equalTo(view.super.safeAreaLeft);
          make.right.equalTo(view.super.safeAreaRight);
          make.top.bottom.equalTo(0);
        },
        events: {
          highlighted: () => {}, // Disable the default highlight effect
          layoutSubviews,
          itemSize: sender => {
            const columns = settings.thumbColumns();
            const spacing = dimensions.spacingOfCells;
            const width = Math.floor((sender.frame.width - spacing * (columns + 1)) / columns);
            return $size(width, width);
          },
          didSelect: (_, indexPath) => {
            if (states.bulkEditing) {
              selectItem(indexPath);
            } else {
              showItemDetail(indexPath);
            }
          }
        },
        views: [
          {
            type: "label",
            props: {
              id: "number-of-uploads",
              font: $font(dimensions.footerFontSize),
              align: $align.center
            }
          }
        ]
      },
      ...builder.makeToolbar("main-toolbar"),
      {
        type: "button",
        props: {
          id: "upload-button",
          bgcolor: colors.clear,
          accessibilityLabel: strings.upload_image,
          menu: menus.buildUploadMenu(views, states, contextActions)
        },
        views: [
          {
            type: "image",
            props: {
              id: "upload-image",
              symbol: symbols.plus_fill,
              tintColor: colors.blue,
              frame: $rect(0, 0, 25, 25)
            }
          },
          {
            type: "label",
            props: {
              id: "upload-label",
              text: strings.upload_image,
              textColor: colors.tint
            }
          }
        ]
      },
      {
        type: "button",
        props: {
          id: "bulk-action-button",
          enabled: false,
          hidden: true,
          title: strings.bulk_actions,
          titleColor: colors.gray,
          bgcolor: colors.clear,
          menu: menus.buildBulkMenu(views, states, contextActions)
        },
        layout: (make, view) => {
          make.top.bottom.equalTo(views.toolbar());
          make.left.equalTo(view.super.safeAreaLeft).inset(20);
        }
      },
      {
        type: "button",
        props: {
          id: "bulk-done-button",
          hidden: true,
          title: strings.done,
          titleColor: colors.tint,
          bgcolor: colors.clear
        },
        layout: (make, view) => {
          make.top.bottom.equalTo(views.toolbar());
          make.right.equalTo(view.super.safeAreaRight).inset(20);
        },
        events: {
          tapped: endBulkEditing
        }
      },
      {
        type: "label",
        props: {
          id: "history-empty",
          text: strings.history_empty_text,
          textColor: colors.lightGray,
          align: $align.center
        },
        layout: make => {
          make.left.top.right.equalTo(0);
          make.bottom.equalTo(views.toolbar().top);
        }
      }
    ]
  });

  reloadData();
}

function layoutSubviews(container) {
  // Label for number of uploads
  (() => {
    const label = views.numberOfUploads();
    label.sizeToFit();
    label.center = $point(container.frame.width * 0.5, container.contentSize.height - (dimensions.footerHeight + dimensions.spacingOfCells) * 0.5);
  })();

  // Upload button
  (() => {
    const toolbar = views.toolbar();
    const button = $("upload-button");
    const image = $("upload-image");
    const label = $("upload-label");
    label.sizeToFit();

    const padding = 10;
    const totalWidth = label.frame.width + padding + image.frame.width;
    if (util.onMac) {
      // To avoid super wide contextual menu on Mac
      const rectWidth = totalWidth + 20;
      button.frame = $rect((toolbar.frame.width - rectWidth) * 0.5, toolbar.frame.y, rectWidth, toolbar.frame.height);
    } else {
      // Just fills the entire container
      button.frame = toolbar.frame;
    }

    image.frame = $rect((button.frame.width - totalWidth) * 0.5, (button.frame.height - image.frame.height) * 0.5, image.frame.width, image.frame.height);
    label.frame = $rect(image.frame.x + image.frame.width + padding, (button.frame.height - label.frame.height) * 0.5, label.frame.width, label.frame.height);
  })();
}

function reloadData(animated = false) {
  const mainView = views.main();
  mainView.hidden = states.data.length === 0;
  mainView.data = builder.makeMainCells(states, actionHandlers);

  const emptyView = views.empty();
  const emptyAlpha = mainView.hidden ? 1 : 0;
  if (animated) {
    $ui.animate({
      duration: 0.3,
      animation: () => emptyView.alpha = emptyAlpha
    });
  } else {
    emptyView.alpha = emptyAlpha;
  }

  reloadFooter();
  reloadToolbar();
}

function reloadFooter() {
  const label = views.numberOfUploads();
  const length = states.data.filter(item => !service.isUploading(item)).length;
  label.hidden = length === 0;
  label.text = `${length} ${length == 1 ? strings.number_of_uploads_singular : strings.number_of_uploads_plural}`;
}

function reloadToolbar() {
  const bulkEditing = states.bulkEditing;
  const actionButton = $("bulk-action-button");
  $ui.animate({
    duration: 0.3,
    animation: () => {
      $("upload-button").alpha = bulkEditing ? 0 : 1;
      $("bulk-done-button").hidden = !bulkEditing;
      actionButton.hidden = !bulkEditing;
      actionButton.enabled = states.selectedIndices.length > 0;
      actionButton.title = actionButton.enabled ? `${strings.bulk_actions} (${states.selectedIndices.length})` : strings.bulk_actions;
      actionButton.titleColor = actionButton.enabled ? colors.tint : colors.gray; 
    }
  });
}

function selectItem(indexPath) {
  const selectedIndices = states.selectedIndices;
  const index = selectedIndices.indexOf(indexPath.item);
  if (index === -1) {
    selectedIndices.push(indexPath.item);
  } else {
    selectedIndices.splice(index, 1);
  }

  reloadData();
  taptic.light();
}

function selectAll(matches = null) {
  if (!states.bulkEditing) {
    toggleBulkEditing();
  }

  states.selectedIndices = [];
  for (let index = 0; index < states.data.length; ++index) {
    if (matches == null || matches(index)) {
      states.selectedIndices.push(index);
    }
  }

  reloadData();
  taptic.light();
}

function deselectAll() {
  if (!states.bulkEditing) {
    return;
  }

  states.selectedIndices = [];
  reloadData();
  taptic.light();
}

function showItemDetail(indexPath) {
  const item = states.data[indexPath.item];
  if (service.isUploading(item)) {
    return;
  }

  if (!item.remotePath) {
    $ui.alert({
      title: strings.upload_failed,
      message: item.error,
      actions: [
        {
          title: strings.delete,
          style: $alertActionType.destructive,
          handler: () => actions.deleteItem(views, states, indexPath, contextActions)
        },
        {
          title: strings.cancel,
          style: $alertActionType.cancel
        }
      ]
    });
    return;
  }

  const viewer = require("../views/image-viewer");
  viewer.push(item, views.main(), actionHandlers(indexPath));
}

function toggleBulkEditing() {
  states.bulkEditing = !states.bulkEditing;
  states.selectedIndices = [];
  reloadData();
}

function endBulkEditing(animated = false) {
  states.bulkEditing = false;
  states.selectedIndices = [];
  reloadData(animated);
}

module.exports = render;