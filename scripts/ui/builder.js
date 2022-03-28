const colors = require("./constants/colors");
const symbols = require("./constants/symbols");
const strings = require("./constants/strings");
const dimensions = require("./constants/dimensions");
const thumbnail = require("../storage/thumbnail");
const util = require("../util");
const service = require("../service");
const { readableDateFrom } = require("../tools/date");

function makeToolbar(identifier) {
  return [
    {
      type: "view",
      props: {
        id: identifier
      },
      layout: (make, view) => {
        make.left.right.equalTo(view.super);
        make.height.equalTo(dimensions.toolbarHeight);
        // 2 on Mac to make it "looks" more center-aligned
        make.bottom.equalTo(view.super.safeAreaBottom).inset(util.onMac ? 2 : 0);
      }
    },
    {
      type: "blur",
      props: {
        style: 10
      },
      layout: (make, view) => {
        make.left.right.bottom.equalTo(view.super);
        make.top.equalTo($(identifier));
      }
    },
    {
      type: "view",
      props: {
        bgcolor: colors.toolbarDivider
      },
      layout: (make, view) => {
        make.left.right.equalTo(view.super);
        make.top.equalTo($(identifier));
        make.height.equalTo(dimensions.hairline);
      }
    }
  ]
}

function makePlaceholder(thumb) {
  return {
    ...thumb,
    ...{
      image: {
        alpha: 0.3,
        image: thumbnail.imageOf(thumb)
      },
      cycle: { hidden: true },
      checkmark: { hidden: true },
      spinner: { loading: true },
      failed: { hidden: true }
    }
  }
}

function makeMainCells(states, handlers) {
  return states.data.map((item, index) => {
    const isUploading = service.isUploading(item);
    const isSelected = states.selectedIndices.includes(index);
    const hasFailed = !isUploading && !item.remotePath;
    return {
      image: {
        accessibilityLabel: (() => {
          if (isUploading) {
            return strings.uploading;
          } else if (hasFailed) {
            return strings.upload_failed;
          } else {
            return [
              util.lastPath(item.remotePath),
              readableDateFrom(item.creationDate)
            ].join(", ");
          }
        })(),
        accessibilityHint: (() => {
          if (isSelected) {
            return strings.selected;
          } else if (states.bulkEditing) {
            return strings.double_tap_to_select;
          } else {
            return "";
          }
        })(),
        accessibilityCustomActions: makeAccessibilityActions(handlers($indexPath(0, index))),
        alpha: isUploading ? 0.3 : 1,
        image: thumbnail.imageOf(item)
      },
      cycle: {
        hidden: !isSelected || !states.bulkEditing
      },
      checkmark: {
        hidden: !states.bulkEditing,
        symbol: isSelected ? symbols.selected : symbols.unselected
      },
      spinner: {
        loading: isUploading
      },
      failed: {
        hidden: !hasFailed
      }
    }
  });
}

function makeAccessibilityActions(handlers) {
  // Disable on macOS for now because of a bug where the app hangs
  if (util.onMac) {
    return [];
  }

  // To provide better accessibility actions,
  // use runtime if there's no built-in support
  const actionWith = (title, handler) => {
    if (typeof $accessibilityAction === "function") {
      return $accessibilityAction(title, handler);
    }

    return $objc("UIAccessibilityCustomAction").$alloc().$initWithName_actionHandler(title, $block("BOOL, UIAccessibilityCustomAction *", _ => {
      if (handler) {
        handler();
      }
    })).jsValue()
  }

  return [
    actionWith(strings.delete, handlers.delete),
    actionWith(strings.open_in_browser, handlers.openInBrowser),
    actionWith(strings.copy_bbcode, handlers.copyBBCode),
    actionWith(strings.copy_markdown, handlers.copyMarkdown),
    actionWith(strings.copy_html, handlers.copyHTML),
    actionWith(strings.copy_url, handlers.copyURL),
    ...util.onTaio ? [actionWith(strings.insert_into_document, handlers.insertIntoDocument)] : []
  ];
}

module.exports = {
  makeToolbar,
  makePlaceholder,
  makeMainCells,
  makeAccessibilityActions
}