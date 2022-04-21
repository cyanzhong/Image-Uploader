const onMac = !$device.info.model.startsWith("iP");
const onTaio = $app.info.bundleID.includes("taio");
const strings = require("./ui/constants/strings");
const taptic = require("./tools/taptic");

// Dependency injection for uploaders
const injectable = {
  localize,
  crypto: require("./libs/crypto"),
  encode: {
    base64: value => $text.base64Encode(value),
    sha256: value => $text.SHA256(value),
    md5: value => $text.MD5(value),
  }
}

const sourceFilePath = (() => {
  const path = $actions.getVar("sourceFilePath");
  if (path) {
    // Path from Taio's text action
    return path;
  }

  // Debug only path
  return $file.absolutePath("tests/Demo.md");
})();

function localize(text) {
  if (!text || typeof text === "string") {
    return text;
  } else {
    return (text[strings.language_tag] || text["en"]) || `${text}`;
  }
}

function mimeType(data) {
  const suffix = (() => {
    const fileName = data.fileName || "";
    if (fileName.includes(".")) {
      return fileName.split(".").pop();
    } else {
      return "png";
    }
  })();

  return `image/${suffix.toLowerCase()}`; 
}

function fileName(data, pattern) {
  const date = new Date();
  const fileName = data.fileName || randomText(6);

  const leftPad = number => {
    return number >= 10 ? `${number}` : `0${number}`;
  }

  const variables = {
    year: date.getFullYear(),
    month: leftPad(date.getMonth() + 1),
    day: leftPad(date.getDate()),
    hour: leftPad(date.getHours()),
    minute: leftPad(date.getMinutes()),
    second: leftPad(date.getSeconds()),
    timestamp: date.getTime(),
    filename: deleteExtension(fileName),
    suffix: fileName.includes(".") ? fileName.split(".").pop() : lastPath(mimeType(data)), // Either from file name or MIME type
    uuid: $text.uuid,
    random: randomText(6),
  }

  let string = `${pattern}`;
  Object.keys(variables).forEach(key => {
    string = string.replaceAll(`{${key}}`, variables[key]);
  });

  return encodeURI(string);
}

function lastPath(filePath) {
  return filePath.split("/").pop();
}

function deleteExtension(fileName) {
  return fileName.replace(/\.[^/.]+$/, "");
}

function randomText(length) {
  const digits = [];
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let index = 0; index < length; ++index) {
    digits.push(charset.charAt(Math.floor(Math.random() * charset.length)));
  }
  return digits.join("");
}

function isEncrypted(text) {
  if (typeof text === "string") {
    return text.startsWith("id:");
  }
  return false;
}

function insertIntoDocument(text) {
  taptic.success();
  $editor.insertText(text + "\n\n");
  $editor.save();
  $app.close(0.4); // Delay 0.4 to work around keyboard focus issue
}

function replaceIntoDocument(updates) {
  // Descending
  updates.sort((lhs, rhs) => {
    return rhs.local.range.location - lhs.local.range.location;
  });

  let fullText = $editor.text;
  function replaceTextInRange(start, length, text) {
    fullText = fullText.substring(0, start) + text + fullText.substring(start + length);
  }

  for (const update of updates) {
    const range = update.local.range;
    const path = update.uploaded.remotePath;
    replaceTextInRange(range.location, range.length, path);
  }

  // Replace all occurrences altogether
  $editor.text = fullText;
  $editor.save();

  // Ask whether to delete local images
  $ui.alert({
    title: strings.delete_local_images_title,
    message: strings.delete_local_images_message,
    actions: [
      {
        title: strings.delete,
        style: $alertActionType.destructive,
        handler: () => {
          for (const update of updates) {
            $file.delete(update.local.fullPath);
          }
          taptic.success();
        }
      },
      {
        title: strings.cancel,
        style: $alertActionType.cancel
      }
    ]
  });
}

module.exports = {
  injectable,
  sourceFilePath,
  onMac,
  onTaio,
  localize,
  mimeType,
  fileName,
  lastPath,
  deleteExtension,
  isEncrypted,
  insertIntoDocument,
  replaceIntoDocument,
}