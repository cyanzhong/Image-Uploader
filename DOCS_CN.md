## 使用自定义图床

通过内置的[自定义图床](https://github.com/cyanzhong/Image-Uploader/blob/main/scripts/uploaders/custom.js)，您可以上传图片到任何服务器。要使用它，这里有几件事要说明。

### HTTP 请求头和请求体

请求头和请求体都是 JSON 编码的，但为了简化语法，您需要通过多行键值对来添加它们。例如：

```yaml
Authorization: [YOUR_TOKEN]
AnotherKey: [ANOTHER_VALUE]
```

请注意，在 ":" 符号后面有一个空格。

### 表单文件名

通过这个值来指定上传文件的文件名，文件会通过 `multipart/form-data` 形式上传。

### JSON 结果路径

自定义图床只接受 JSON 结果，例如：

```json
{
  "data": {
    "url": "https://foo.bar/image.png"
  }
}
```

在这种格式下，需使用路径 `data.url` 来获得 `url`。

### 自定义域名

当我们只能从结果中获得一个相对路径时，通过这个可选的值来指定域名，例如：

```json
{
  "data": {
    "path": "/image.png"
  }
}
```

由于 `path` 是一个服务器的相对路径，您将需要提供一个自定义域名（在我们的例子中是 `foo.bar`）来建立完整的 URL。

## 创建自己图床

自定义图床能做的非常有限，大部分的云服务都不能用它来构建，因为需要计算签名。如果您想创建一个更灵活的图床，以适应复杂的情况，建议看看 [S3](https://github.com/cyanzhong/Image-Uploader/blob/main/scripts/uploaders/s3.js) 是如何构建的，在本文档中，我们将介绍一些需要注意的事情。

### 图床清单

为了确保我们的[打包工具](https://parceljs.org/)工作，第一步是在 [manifest](https://github.com/cyanzhong/Image-Uploader/blob/main/scripts/uploaders/manifest.js) 中注册我们的图床模块。

否则，打包工具将不知道这些文件应该被打包，在那种情况下，我们无法成功创建 Taio 文本动作。

### 定义

图床是一个导出的 JavaScript 模块：

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

您可以查看上面提到例子来理解每个属性，并据此实现您自己的。

### 配置语法

内部使用 JSBox 的 `$prefs` 接口来实现，可参考其[文档](https://docs.xteko.com/#/foundation/prefs)来了解更多。

### 可用工具

除了使用标准的 JavaScript 和所有 JSBox 的接口外，我们还注入了一个 `util` 对象，它提供了几个有用的工具：

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

这样，您就可以根据需要使用 `util` 对象对字符串进行编码，计算哈希值等。

### 本地化

字符串可以是像 "Hello" 这样的 JavaScript 字符串（没有被本地化），也可以是像这样的 JavaScript 对象：

```js
{
  "en": "Hello",
  "zh-Hans": "你好"
}
```

请参考提到的例子，以获得更多关于如何使用它的方法。

### 创建请求

图片被包装成一个 `file` 对象，它有几个关键属性：

```js
{
  data, // file data
  size, // file size, in bytes
  type, // MIME type
  path  // generated file path
}
```

除此之外还有一个 `options` 参数，它包含所有用户配置的选项，如地址、密码等，用它们来创建您的 HTTP 请求。

### 解析结果

这是定义上传器的最后一步，我们需要做的是在 `parse` 函数中返回 `error` 或 `remotePath`。

当有错误时，返回 `{ error: "THE_ERROR" }`。否则，基于传入的结果、路径和配置返回 `{ remotePath: "THE_PATH" }`。

------

以上就是全部内容了！请查看内置的 [uploaders](https://github.com/cyanzhong/Image-Uploader/tree/main/scripts/uploaders)，里面已经有很多的例子。

此外，我们非常欢迎您通过提交 [pull requests](https://github.com/cyanzhong/Image-Uploader/compare) 来分享您制作的图床。