const util = require("../../util");
const picker = require("../../picker");
const strings = require("../constants/strings");
const symbols = require("../constants/symbols");
const history = require("../../storage/history");
const clipboard = require("../../tools/clipboard");
const taptic = require("../../tools/taptic");

function buildMainMenu(states, contextActions) {
  const { reloadData, toggleBulkEditing, endBulkEditing, selectAll, deselectAll } = contextActions;
  return [
    {
      title: strings.settings, symbol: symbols.ellipsis, handler: _ => {
        const settings = require("../../settings");
        settings.open(reloadData);
      }
    },
    {
      title: strings.backup_images, symbol: symbols.icloud, menu: {
        pullDown: true, asPrimary: true,
        items: [
          { title: strings.backup_images, symbol: symbols.upload, handler: () => history.backup() },
          { title: strings.restore_images, symbol: symbols.download, handler: () => history.restore(() => {
              states.data = history.all();
              endBulkEditing(true);
              taptic.success();
            })
          }
        ]
      }
    },
    {
      title: strings.uploaders, symbol: symbols.drive, handler: _ => {
        const uploaders = require("../views/uploaders");
        $ui.push(uploaders);
      }
    },
    {
      title: strings.bulk_edit, symbol: symbols.bulk_edit, menu: {
        pullDown: true, asPrimary: true,
        items: [
          { title: strings.bulk_edit, symbol: symbols.edit, handler: toggleBulkEditing },
          { title: strings.select_all, symbol: symbols.selected, handler: () => selectAll() },
          { title: strings.select_failed, symbol: symbols.selected, handler: () => selectAll(index => states.data[index].remotePath == null) },
          { title: strings.deselect_all, symbol: symbols.unselected, handler: deselectAll },
        ]
      }
    }
  ]
}

function buildUploadMenu(views, states, contextActions) {
  const selectImages = source => {
    const { selectImages } = require("./image-picker");
    return selectImages(source, views, states, contextActions);
  };

  return {
    pullDown: true, asPrimary: true,
    items: (() => {
      const items = [
        { title: strings.source_clipboard, symbol: symbols.plaintext, handler: () => selectImages(picker.sources.clipboard) },
        { title: strings.source_camera, symbol: symbols.camera, handler: () => selectImages(picker.sources.camera) },
        { title: strings.source_files, symbol: symbols.folder, handler: () => selectImages(picker.sources.files) },
        { title: strings.source_photos, symbol: symbols.photos, handler: () => selectImages(picker.sources.photos) },
      ];

      if (util.onTaio) {
        items.push({
          title: strings.source_document,
          symbol: symbols.plaintext,
          handler: () => selectImages(picker.sources.document)
        });
      }

      if (util.onMac) {
        items.reverse();
      } else {
        items.unshift({
          title: strings.source_scanner,
          symbol: symbols.scanner,
          handler: () => selectImages(picker.sources.scanner)
        });
      }

      return items;
    })()
  }
}

function buildContextMenu(handlers) {
  return [
    ...util.onTaio ? [{ title: strings.insert_into_document, symbol: symbols.text_insert, handler: (_, indexPath) => handlers(indexPath).insertIntoDocument() }] : [],
    { title: strings.copy_url, symbol: symbols.link, handler: (_, indexPath) => handlers(indexPath).copyURL() },
    { title: strings.copy_html, symbol: symbols.html, handler: (_, indexPath) => handlers(indexPath).copyHTML() },
    { title: strings.copy_markdown, symbol: symbols.markdown, handler: (_, indexPath) => handlers(indexPath).copyMarkdown() },
    { title: strings.copy_bbcode, symbol: symbols.bbcode, handler: (_, indexPath) => handlers(indexPath).copyBBCode() },
    { title: strings.open_in_browser, symbol: symbols.safari, handler: (_, indexPath) => handlers(indexPath).openInBrowser() },
    { title: strings.delete, symbol: symbols.trash, destructive: true, handler: (_, indexPath) => handlers(indexPath).deleteItem() },
  ]
}

function buildBulkMenu(views, states, contextActions) {
  const { selectedText, deleteTapped, insertTapped } = require("./bulk-editing");
  const tools = require("../../tools/link");
  const copyText = transformer => clipboard.copyText(selectedText(states, transformer));

  return {
    pullDown: true, asPrimary: true,
    items: (() => {
      const items = [
        { title: strings.delete, symbol: symbols.trash, destructive: true, handler: _ => deleteTapped(views, states, contextActions) },
        { title: strings.copy_bbcode, symbol: symbols.bbcode, handler: _ => copyText(tools.itemBBCode) },
        { title: strings.copy_markdown, symbol: symbols.markdown, handler: _ => copyText(tools.itemMarkdown) },
        { title: strings.copy_html, symbol: symbols.html, handler: _ => copyText(tools.itemHTML) },
        { title: strings.copy_url, symbol: symbols.link, handler: _ => copyText(tools.itemURL) },
      ]

      if (util.onTaio) {
        items.push({ title: strings.insert_into_document, symbol: symbols.text_insert, handler: _ => insertTapped(states) });
      }

      if (util.onMac) {
        return items.reverse();
      } else {
        return items;
      }
    })()
  }
}

module.exports = {
  buildMainMenu,
  buildUploadMenu,
  buildContextMenu,
  buildBulkMenu
}