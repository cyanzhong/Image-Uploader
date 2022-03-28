const util = require("../util");
const strings = require("../ui/constants/strings");
const altDefault = strings.default_image_alt;

function itemURL(item) {
  return item.remotePath;
}

function itemHTML(item) {
  return `<img src="${item.remotePath}" alt="${altDefault}">`;
}

function itemMarkdown(item) {
  return `![${altDefault}](${item.remotePath})`;
}

function itemBBCode(item) {
  return `[img alt="${altDefault}"]${item.remotePath}[/img]`;
}

function itemTitle(item) {
  if (item.remotePath) {
    const path = util.lastPath(item.remotePath);
    return decodeURI(path).split("?")[0];
  } else {
    return "image";
  }
}

module.exports = {
  itemURL,
  itemHTML,
  itemMarkdown,
  itemBBCode,
  itemTitle
}