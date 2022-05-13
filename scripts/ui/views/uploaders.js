const colors = require("../constants/colors");
const strings = require("../constants/strings");
const symbols = require("../constants/symbols");
const builder = require("./config-builder");
const templates = require("../templates");
const uploaders = require("../../uploaders/manifest");
const configs = require("../../storage/configs");
const keychain = require("../../storage/keychain");
const util = require("../../util");

const states = {
  isEditing: false
}

const views = {
  main: () => $("uploader-list"),
  empty: () => $("uploader-empty"),
}

function buildTipsMenu() {
  return {
    asPrimary: true,
    items: [
      {
        title: strings.toggle_editing,
        symbol: symbols.switch,
        handler: () => {
          states.isEditing = !states.isEditing;
          views.main().setEditing(states.isEditing);
        }
      },
      {
        title: strings.tips,
        symbol: symbols.lightbulb,
        handler: () => {
          $ui.alert({
            title: strings.tips,
            message: strings.uploaders_tips
          })
        }
      },
      {
        title: strings.learn_more,
        symbol: symbols.plaintext,
        handler: () => $app.openURL(strings.docs_url)
      }
    ]
  }
}

function buildUploadersMenu() {
  const keys = Object.keys(uploaders);
  return {
    title: strings.add_uploader,
    asPrimary: true,
    items: keys.map(key => {
      const uploader = uploaders[key];
      return {
        title: util.localize(uploader.name),
        symbol: symbols.drive,
        handler: () => createConfig(uploader, key)
      };
    })
  }
}

function reloadConfigs() {
  const data = configs.all().map(config => cellFrom(config));
  reloadViews(data);

  const mainView = views.main();
  if (mainView) {
    mainView.data = data;
  }
}

function reloadViews(data = []) {
  const mainView = views.main();
  if (mainView) {
    mainView.hidden = data.length === 0;
  }

  const emptyView = views.empty();
  if (emptyView) {
    emptyView.hidden = !mainView.hidden;
  }
}

async function createConfig(uploader, identifier) {
  try {
    const created = await builder.create(uploader, identifier);
    reloadViews(configs.all());
    const mainView = views.main();
    mainView.insert({
      index: 0,
      value: cellFrom(created)
    });
  } catch (error) {
    console.error(error);
  }
}

async function editConfig(uploader, config, index) {
  try {
    const edited = await builder.edit(uploader, config);
    const list = configs.all();
    list[index] = edited;
    configs.save(list);
    reloadConfigs();
  } catch (error) {
    console.error(error);
  }
}

function deleteConfig(index) {
  const list = configs.all();
  const config = list[index];
  Object.keys(config).forEach(key => {
    keychain.remove(config[key]);
  });

  list.splice(index, 1);
  configs.save(list);

  if (list.length === 0) {
    $delay(0.4, reloadViews);
  }
}

function cellFrom(config) {
  return {
    title: {
      text: config[configs.nameKey]
    }
  }
}

function moveItemFrom(array, oldIndex, newIndex) {
  if (newIndex >= array.length) {
    let k = newIndex - array.length + 1;
    while (k--) {
      array.push(undefined);
    }
  }
  array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
}

module.exports = {
  props: {
    title: strings.uploaders,
    navButtons: [
      { title: strings.tips, symbol: symbols.ellipsis, menu: buildTipsMenu() },
      { title: strings.add_uploader, symbol: symbols.drive_plus, menu: buildUploadersMenu() },
    ]
  },
  views: [
    {
      type: "list",
      props: {
        id: "uploader-list",
        style: 2,
        reorder: true,
        template: templates.list,
        actions: [
          {
            title: "delete",
            handler: (_, indexPath) => {
              deleteConfig(indexPath.row);
            }
          }
        ]
      },
      layout: $layout.fill,
      events: {
        ready: reloadConfigs,
        didSelect: (_, indexPath) => {
          const index = indexPath.row;
          const config = configs.all()[index];
          const uploader = uploaders[config.identifier];
          editConfig(uploader, config, index);
        },
        reorderMoved: (from, to) => {
          if (from.row !== to.row) {
            const list = configs.all();
            moveItemFrom(list, from.row, to.row);
            configs.save(list);
          }
        }
      }
    },
    {
      type: "label",
      props: {
        id: "uploader-empty",
        text: strings.uploaders_empty_text,
        textColor: colors.lightGray
      },
      layout: (make, view) => {
        make.centerX.equalTo(view.super);
        make.centerY.equalTo(view.super.safeAreaCenterY);
      }
    }
  ]
}