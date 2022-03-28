const util = require("../../util");
const clipboard = require("../../tools/clipboard");
const taptic = require("../../tools/taptic");
const thumbnail = require("../../storage/thumbnail");
const history = require("../../storage/history");

function insertIntoDocument(states, indexPath) {
  const item = states.data[indexPath.item];
  if (item.remotePath) {
    const tools = require("../../tools/link");
    util.insertIntoDocument(tools.itemMarkdown(item));
  } else {
    taptic.error();
  }
}

function copyURL(states, indexPath) {
  const item = states.data[indexPath.item];
  if (item.remotePath) {
    clipboard.copyURL(item)
  } else {
    taptic.error();
  }
}

function copyHTML(states, indexPath) {
  const item = states.data[indexPath.item];
  if (item.remotePath) {
    clipboard.copyHTML(item);
  } else {
    taptic.error();
  }
}

function copyMarkdown(states, indexPath) {
  const item = states.data[indexPath.item];
  if (item.remotePath) {
    clipboard.copyMarkdown(item);
  } else {
    taptic.error();
  }
}

function copyBBCode(states, indexPath) {
  const item = states.data[indexPath.item];
  if (item.remotePath) {
    clipboard.copyBBCode(item);
  } else {
    taptic.error();
  }
}

function openInBrowser(states, indexPath) {
  const item = states.data[indexPath.item];
  if (item.remotePath) {
    $app.openURL(item.remotePath);
  } else {
    taptic.error();
  }
}

function deleteItem(views, states, indexPath, contextActions) {
  const { endBulkEditing, reloadData, reloadFooter } = contextActions;

  const performDelete = () => {
    thumbnail.remove(states.data[indexPath.item]);
    states.data.splice(indexPath.item, 1);
    history.save(states.data);
    views.main().delete(indexPath);
    taptic.light();

    if (states.data.length === 0) {
      reloadData();
    } else {
      reloadFooter();
    }
  }

  if (states.bulkEditing) {
    endBulkEditing();
    $delay(0.4, performDelete);
  } else {
    performDelete();
  }
}

module.exports = {
  insertIntoDocument,
  copyURL,
  copyHTML,
  copyMarkdown,
  copyBBCode,
  openInBrowser,
  deleteItem,
}