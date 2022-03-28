const util = require("../../util");
const strings = require("../constants/strings");
const configs = require("../../storage/configs");
const keychain = require("../../storage/keychain");

function create(uploader, identifier) {
  return edit(uploader, { identifier }, true);
}

async function edit(uploader, config, creation = false) {
  const name = config[configs.nameKey] || util.localize(uploader.name);
  const edited = await $prefs.edit({
    "title": name,
    "insetGrouped": true,
    "groups": [
      {
        "items": [
          {
            "title": strings.uploader_name,
            "type": "string",
            "key": configs.nameKey,
            "inline": true,
            "value": name
          },
          ...uploader.supportsFilePath ? [
            {
              "title": strings.file_path,
              "type": "string",
              "key": configs.filePathKey,
              "inline": true,
              "value": config[configs.filePathKey] || "{random}.{suffix}"
            },
            {
              "title": strings.file_path_docs_title,
              "type": "script",
              "value": `$ui.push({
                props: {
                  title: \`${strings.file_path_docs_title}\`
                },
                views: [
                  {
                    type: "markdown",
                    props: {
                      content: \`${strings.file_path_docs_content}\`
                    },
                    layout: $layout.fill
                  }
                ]
              })`
            }
          ] : []
        ]
      },
      {
        "items": [
          ...uploader.config(util.injectable).map(option => {
            return {
              "title": util.localize(option.title),
              "type": option.type,
              "key": option.key,
              "inline": option.hasOwnProperty("inline") ? option.inline : true,
              "value": (() => {
                const value = config[option.key];
                if (value) {
                  return keychain.read(value);
                }
                return option.value;
              })(),
              "items": option.items,
              "placeholder": util.localize(option.placeholder)
            }
          }),
          ...uploader.onlineDoc ? [
            {
              "title": util.localize({ "en": "Documentation", "zh-Hans": "文档" }),
              "type": "link",
              "value": util.localize(uploader.onlineDoc)
            }
          ] : []
        ]
      }
    ]
  });

  const result = { identifier: config.identifier };
  edited.groups.forEach(group => {
    const items = group.items;
    items.forEach(item => {
      if (item.type === "link" || item.type === "script") {
        return;
      }
  
      const value = (() => {
        const value = item.value;
        if (!value) {
          if (item.type === "list") {
            return 0; // List index should default to zero
          } else {
            return value;
          }
        }
  
        if (item.type === "password") {
          const key = config[item.key];
          if (key) {
            return keychain.update(key, value);
          } else {
            return keychain.save(value);
          }
        }
  
        return value;
      })();

      result[item.key] = value;
    });

    if (!result.uuid) {
      result.uuid = $text.uuid;
    }
  });

  if (creation) {
    configs.create(result);
  }

  return result;
}

module.exports = {
  create,
  edit
}