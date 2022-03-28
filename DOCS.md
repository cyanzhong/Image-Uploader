## Using Custom Uploader

There's a built-in [custom uploader](https://github.com/cyanzhong/Image-Uploader/blob/main/scripts/uploaders/custom.js) that allows you to upload images to any server. To use it, here are a few things to keep in mind.

### HTTP Headers and Body

Both headers and body are JSON encoded, but to simplify the syntax, you should add them via multi-line key value pairs. For example:

```yaml
Authorization: [YOUR_TOKEN]
AnotherKey: [ANOTHER_VALUE]
```

Note that, there's a space after the ":" symbol.

### Form File Name

Use this value to specific file name of the uploaded file, it uses `multipart/form-data` to upload files.

### JSON Result Path

The custom uploader only accepts JSON response, for instance:

```json
{
  "data": {
    "url": "https://foo.bar/image.png"
  }
}
```

To get the `url`, use key paths `data.url`.

### Custom Domain

An optional value to specific the domain, when you can only get a relative path from the response, like:

```json
{
  "data": {
    "path": "/image.png"
  }
}
```

Since `path` is a relative path to a server, you will need to provide a custom domain (`foo.bar` in our case) to build the URL.

## Creating Your Own Uploaders

The custom uploader can do very limited, most cloud services cannot be built using it, due to signature calculation. If you want to create a more flexible uploader to fit your use case, take a look at how [S3](https://github.com/cyanzhong/Image-Uploader/blob/main/scripts/uploaders/s3.js) is built, in this doc we will cover a few things to take care of.

### Manifest

To make sure the [bundler](https://parceljs.org/) work, the first step is to register our uploader modules in [manifest](https://github.com/cyanzhong/Image-Uploader/blob/main/scripts/uploaders/manifest.js).

Otherwise, the bundler won't know those files should be bundled, and in such case we cannot create Taio actions successfully.

### The Definition

An uploader is a JavaScript module that exports:

```js
module.exports = {
  name,             // name, required
  supportsFilePath, // whether to support file path, optional
  onlineDoc,        // online doc link, optional
  config,           // config to build the UI, required
  request,          // generate request payload, required
  parse             // parse the response, required
}
```

You can check out the example mentioned above to understand each value, and implement your own accordingly.

### Configuration Syntax

It uses JSBox's `$prefs` API, check out the documentation [here](https://docs.xteko.com/#/en/foundation/prefs).

### Utilities

Other than using standard JavaScript and all JSBox APIs, there's a `util` object injected, which provides several usefull tools:

```js
{
  crypto,     // https://github.com/brix/crypto-js
  encode: {
    base64,
    sha256,   // hasher for files
    md5       // hasher for files
  },
  localize,   // used to localize strings
}
```

That way, you can use the `util` object to encode strings, calculate hash values, as needed.

### Localization

A string can be either a JavaScript string like "Hello" (not localized), or a JavaScript object like:

```js
{
  "en": "Hello",
  "zh-Hans": "你好"
}
```

Check out the example to get more ideas on how to use it.

### Creating Request Payload

The image is wrapped as a `file` object, it has a few properties:

```js
{
  data, // file data
  size, // file size, in bytes
  type, // MIME type
  path  // generated file path
}
```

There's also an `options` parameter, it contains all user configured options, such as host, token, use them to create your request payload.

### Parsing Result

This is the last step of defining an uploader, what we need to is just return either `error` or `remotePath` in the `parse` function.

When there's an error, return `{ error: "THE_ERROR" }`. Otherwise, return `{ remotePath: "THE_PATH" }` based on the response data, path and options.

------

That's all about it! Do check out built-in [uploaders](https://github.com/cyanzhong/Image-Uploader/tree/main/scripts/uploaders), there are lots of examples already.

By the way, you are more than welcome to share your uploaders by submitting [pull requests](https://github.com/cyanzhong/Image-Uploader/compare).