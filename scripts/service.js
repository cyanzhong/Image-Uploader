const configs = require("./storage/configs");
const keychain = require("./storage/keychain");
const util = require("./util");
const settings = require("./settings");

const states = {
  queued: new Set()
}

async function uploadFile(file, thumb, config) {
  try {
    const localPath = thumb.localPath;
    const identifier = config.identifier;
    const uploader = require("./uploaders/manifest")[identifier];

    // Validate required exports
    for (const key of ["name", "config", "request", "parse"]) {
      if (typeof uploader[key] === "undefined") {
        console.error(`Uploader "${identifier}" is not correctly implemented, missing "${key}".`);
        return null;
      }
    }

    if (!file) {
      console.log("Cancelled.");
      return null;
    }

    const compressImages = settings.compressImages();
    const type = compressImages ? "image/jpeg" : util.mimeType(file);
    const fileName = file.fileName;

    if (compressImages) {
      const image = (() => {
        const image = file.image;
        const side = settings.imageSize();
        if (side > 0 && image.size.width > side && image.size.height > side) {
          return image.resized($size(side, side));
        } else {
          return image;
        }
      })();
      const quality = settings.compressQuality();
      file = image.jpg(quality);
    } else if (type === "image/jpg" || type === "image/jpeg") {
      // Convert possible HEIC to normal JPEG
      const image = file.image;
      file = image.jpg(0.8);
    }

    const extension = util.lastPath(fileName).toLowerCase();
    if (compressImages && extension !== "jpg" && extension !== "jpeg") {
      // Force to use jpeg as file extension
      file.fileName = `${util.deleteExtension(fileName)}.jpeg`;
    } else {
      // Keep original file name
      file.fileName = fileName;
    }
    
    const options = {};
    Object.keys(config).forEach(key => {
      const value = config[key];
      if (key === configs.filePathKey) {
        options[key] = util.fileName(file, value);
      } else {
        options[key] = keychain.read(value);
      }
    });

    const path = options[configs.filePathKey];
    const parameters = uploader.request({
      data: file,
      size: file.info.size,
      type: type,
      path: path
    }, options, util.injectable);

    states.queued.add(localPath);
    const { data, error } = await $http.request(parameters);

    states.queued.delete(localPath);
    if (error) {
      console.error(`HTTP error: ${error.localizedDescription}.`);
      return {
        localPath,
        error: error.localizedDescription
      };
    }
    
    const result = uploader.parse(data, path, options) || {};
    result.config = config.uuid;
    result.localPath = localPath;
    result.creationDate = +new Date();

    const image = file.image;
    result.metadata = {
      "width": image.size.width * image.scale,
      "height": image.size.height * image.scale,
      "size": file.info.size
    }

    if (result.error) {
      console.error(`API error: ${result.error}.`);
    } else {
      console.log(result);
    }

    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
}

function isUploading(item) {
  return states.queued.has(item.localPath);
}

module.exports = {
  uploadFile,
  isUploading
}