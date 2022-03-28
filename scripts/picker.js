const sources = {
  document: 0,
  photos: 1,
  files: 2,
  camera: 3,
  scanner: 4,
  clipboard: 5,
}

async function selectImages(source) {
  try {
    switch (source) {
      case sources.document: return await selectFromDocument();
      case sources.photos: return await selectFromPhotos();
      case sources.files: return await selectFromFiles();
      case sources.camera: return await takePhoto();
      case sources.scanner: return await scanDocuments();
      case sources.clipboard: return imageFromClipboard();
    } 
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function selectFromDocument() {
  return new Promise(resolve => {
    const mover = require("./ui/views/local-mover");
    const util = require("./util");
    mover.push(util.sourceFilePath, resolve);
  });
}

async function selectFromPhotos() {
  const response = await $photo.pick({
    multi: true,
    format: "data"
  });

  if (!response.status) {
    return { images: [] };
  }

  return {
    images: response.results.map(result => {
      const data = result.data;
      data.fileName = result.filename;
      return data;
    })
  };
}

async function selectFromFiles() {
  const files = await $drive.open({
    multi: true,
    types: ["public.image"]
  });
  return {
    images: files || []
  };
}

async function takePhoto() {
  const response = await $photo.take();
  return {
    images: response.status ? [response.image.jpg(1.0)] : []
  };
}

async function scanDocuments() {
  const response = await $photo.scan();
  if (!response.status) {
    return { images: [] };
  }

  return {
    images: response.results.map(image => {
      return image.jpg(1.0);
    })
  };
}

function imageFromClipboard() {
  const data = $clipboard.image;
  if (!data) {
    const taptic = require("./tools/taptic");
    taptic.error();
    return [];
  }

  const util = require("./util");
  if (util.onMac) {
    const image = data.image;
    if (image) {
      return {
        images: [image.jpg(1.0)]
      }
    } else {
      return [];
    }
  }

  return {
    images: [data]
  };
}

module.exports = {
  sources,
  selectImages,
}