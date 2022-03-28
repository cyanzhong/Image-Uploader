const taptic = require("./taptic");
const tools = require("./link");

function copyText(text) {
  taptic.success();
  $clipboard.text = text;
}

function copyURL(item) {
  copyText(tools.itemURL(item));
}

function copyHTML(item) {
  copyText(tools.itemHTML(item));
}

function copyMarkdown(item) {
  copyText(tools.itemMarkdown(item));
}

function copyBBCode(item) {
  copyText(tools.itemBBCode(item));
}

module.exports = {
  copyText,
  copyURL,
  copyHTML,
  copyMarkdown,
  copyBBCode
}