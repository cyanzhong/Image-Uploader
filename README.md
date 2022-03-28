## Image Uploader

The all-in-one image uploader for [Taio](https://taio.app) and [JSBox](https://docs.xteko.com/#/en/).

<img src="https://github.com/cyanzhong/Image-Uploader/raw/main/screenshots/IMG_1.PNG" width="360" alt="Pick Images"/>

<img src="https://github.com/cyanzhong/Image-Uploader/raw/main/screenshots/IMG_2.PNG" width="360" alt="Bulk Editing"/>

<img src="https://github.com/cyanzhong/Image-Uploader/raw/main/screenshots/IMG_3.PNG" width="360" alt="Upload Local Images"/>

<img src="https://github.com/cyanzhong/Image-Uploader/raw/main/screenshots/IMG_4.PNG" width="360" alt="Rich Cloud Services"/>

## Features

- [x] Many cloud services are supported
- [x] Many ways to pick images
- [x] Image tools like resizing and compression
- [x] Designed for Markdown
- [x] Sensitive data is stored in the keychain
- [x] Fully open sourced, trustworthy
- [x] Fully customizable, plugin-like design
- [x] Native UI, feels right at home
- [x] Works for iPhone, iPad, and Mac
- [x] Lightweight, bundled size is only 160 KB

## Customizing Uploaders

There are two ways to customize uploaders, using the custom uploader or creating your own uploaders, please check out the [docs](https://github.com/cyanzhong/Image-Uploader/blob/main/DOCS.md).

## Building Taio Actions

To build Taio [text actions](https://docs.taio.app/#/quick-start/actions) from source, simply run:

```
yarn install && yarn build
```

Generated files are located in the `dist` folder, AirDrop to the device or open the file from Taio to complete the installation.

## TODO

- [ ] Add uploaders from url
- [ ] Delete files from remote

## Third-party Licenses

- [crypto-js](https://github.com/brix/crypto-js/blob/develop/LICENSE)
- [bottleneck](https://github.com/SGrondin/bottleneck/blob/master/LICENSE)
- [filesize.js](https://github.com/avoidwork/filesize.js/blob/master/LICENSE)