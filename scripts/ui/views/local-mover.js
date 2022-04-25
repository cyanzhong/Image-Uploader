const builder = require("../builder");
const util = require("../../util");
const regex = require("../../tools/regex");
const colors = require("../constants/colors");
const symbols = require("../constants/symbols");
const strings = require("../constants/strings");
const dimensions = require("../constants/dimensions");
const taptic = require("../../tools/taptic");

const states = {
  folder: null,
  data: [],
  selectedIndices: [],
}

const views = {
  main: () => $("local-images"),
  toolbar: () => $("mover-toolbar"),
  uploadButton: () => $("local-upload"),
  empty: () => $("local-empty"),
}

function push(filePath, resolve) {
  $ui.push({
    props: {
      title: util.lastPath(filePath),
      navButtons: buildMainMenu()
    },
    views: [
      {
        type: "list",
        props: {
          id: "local-images",
          rowHeight: 88,
          contentInset: $insets(0, 0, dimensions.toolbarHeight, 0),
          indicatorInsets: $insets(0, 0, dimensions.toolbarHeight, 0),
          template: [
            {
              type: "image",
              props: {
                id: "image",
                bgcolor: colors.lightBackground,
                contentMode: $contentMode.scaleAspectFit
              },
              layout: (make, view) => {
                make.left.top.bottom.inset(5);
                make.width.equalTo(view.height);
              }
            },
            {
              type: "view",
              props: {
                id: "cycle", // To make a "filled" checkmark
                hidden: true,
                bgcolor: colors.white,
                cornerRadius: 9
              },
              layout: (make, view) => {
                make.centerY.equalTo(view.super).offset(1);
                make.right.inset(18);
                make.size.equalTo($size(18, 18));
              }
            },
            {
              type: "image",
              props: {
                id: "checkmark",
                hidden: true,
                symbol: symbols.selected,
                tintColor: colors.blue,
                contentMode: $contentMode.scaleAspectFit
              },
              layout: (make, view) => {
                make.centerY.equalTo(view.super);
                make.right.inset(15);
                make.size.equalTo($size(25, 25));
              }
            },
            {
              type: "label",
              props: {
                id: "label",
                isAccessibilityElement: true,
                align: $align.left,
                lines: 0
              },
              layout: make => {
                make.left.equalTo($("image").right).offset(15);
                make.right.equalTo($("checkmark").left).offset(-12);
                make.top.bottom.inset(8);
              }
            }
          ]
        },
        layout: $layout.fill,
        events: {
          didSelect: (_, indexPath) => selectItem(indexPath)
        }
      },
      ...builder.makeToolbar("mover-toolbar"),
      {
        type: "button",
        props: {
          id: "local-upload",
          bgcolor: colors.clear,
          menu: buildUploadMenu(resolve)
        },
        layout: (make, view) => {
          make.top.bottom.equalTo(views.toolbar());
          if (util.onMac) {
            make.centerX.equalTo(view.super);
          } else {
            make.left.right.equalTo(view.super);
          }
        }
      },
      {
        type: "label",
        props: {
          id: "local-empty",
          text: strings.no_local_images,
          textColor: colors.lightGray,
          align: $align.center
        },
        layout: (make, view) => {
          make.centerX.equalTo(view.super);
          make.bottom.equalTo(views.toolbar().top);
        }
      }
    ]
  });

  const content = util.onTaio ? $editor.text : $file.read(filePath).string;
  states.folder = filePath.substring(0, filePath.lastIndexOf("/"));

  const pattern = "!\\[.*\\]\\((.+\\.(png|jpg|jpeg|gif))\\)";
  const data = regex.exec(content, pattern).filter(item => {
    const path = item.path;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return false;
    }
    return $file.exists(filePathOf(item));
  });

  states.data = data;
  selectAll(false);
}

function buildMainMenu() {
  return [
    {
      title: strings.bulk_edit, symbol: symbols.bulk_edit, menu: {
        pullDown: true, asPrimary: true,
        items: [
          { title: strings.select_all, symbol: symbols.selected, handler: selectAll },
          { title: strings.deselect_all, symbol: symbols.unselected, handler: deselectAll },
        ]
      }
    }
  ]
}

function buildUploadMenu(resolve) {
  return {
    pullDown: true, asPrimary: true,
    items: (() => {
      const items = [
        { title: strings.upload_and_replace, symbol: symbols.upload, handler: _ => uploadImages(true, resolve) },
        { title: strings.only_upload, symbol: symbols.upload, handler: _ => uploadImages(false, resolve) },
      ]
      if (util.onMac) {
        return items.reverse();
      } else {
        return items;
      }
    })()
  }
}

function reloadData() {
  const mainView = views.main();
  mainView.data = states.data.map((item, index) => {
    const isSelected = states.selectedIndices.includes(index);
    return {
      image: {
        data: readFile(item)
      },
      cycle: {
        hidden: !isSelected
      },
      checkmark: {
        hidden: !isSelected
      },
      label: {
        accessibilityLabel: item.path,
        accessibilityHint: isSelected ? strings.selected : strings.double_tap_to_select,
        styledText: {
          text: item.path,
          markdown: false,
          styles: [
            {
              range: $range(0, item.path.length),
              underlineStyle: 1,
              underlineColor: colors.lightGray
            }
          ]
        }
      }
    }
  })

  mainView.hidden = states.data.length === 0;
  views.empty().hidden = !mainView.hidden;
  reloadUploadButton();
}

function reloadUploadButton() {
  const button = views.uploadButton();
  if (states.selectedIndices.length > 0) {
    button.enabled = true;
    button.title = `${strings.upload_image} (${states.selectedIndices.length})`;
    button.titleColor = colors.tint;
  } else {
    button.enabled = false;
    button.title = strings.upload_image;
    button.titleColor = colors.gray;
  }
}

function readFile(item) {
  const file = $file.read(filePathOf(item));
  file.fileName = util.lastPath(item.path);
  return file;
}

function filePathOf(item) {
  return `${states.folder}/${decodeURI(item.path)}`;
}

function selectItem(indexPath) {
  const selectedIndices = states.selectedIndices;
  const index = selectedIndices.indexOf(indexPath.row);
  if (index === -1) {
    selectedIndices.push(indexPath.row);
  } else {
    selectedIndices.splice(index, 1);
  }

  const cell = views.main().cell(indexPath);
  const checkmark = cell.get("checkmark");
  checkmark.hidden = !checkmark.hidden;

  const cycle = cell.get("cycle");
  cycle.hidden = checkmark.hidden;

  taptic.light();
  reloadUploadButton();
}

function selectAll(userInitiated = true) {
  states.selectedIndices = [];
  for (let index = 0; index < states.data.length; ++index) {
    states.selectedIndices.push(index);
  }

  reloadData();
  if (userInitiated) {
    taptic.light();
  }
}

function deselectAll(userInitiated = true) {
  states.selectedIndices = [];
  reloadData();
  if (userInitiated) {
    taptic.light();
  }
}

function uploadImages(replacePaths, resolve) {
  $ui.pop();
  $delay(0.4, () => {
    const items = states.selectedIndices.map(index => states.data[index]);
    resolve({
      images: items.map(item => readFile(item)),
      context: {
        replacePaths,
        localItems: items.map(item => {
          return {
            ...item,
            fullPath: filePathOf(item)
          }
        })
      }
    })
  });
}

module.exports = {
  push
}