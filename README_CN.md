## 图片上传

为 [Taio](https://taio.app/cn/) 和 [JSBox](https://docs.xteko.com) 设计的全功能图片上传工具。

<img src="https://github.com/cyanzhong/Image-Uploader/raw/main/screenshots/IMG_1.PNG" width="360" alt="选择图片"/>

<img src="https://github.com/cyanzhong/Image-Uploader/raw/main/screenshots/IMG_2.PNG" width="360" alt="批量编辑"/>

<img src="https://github.com/cyanzhong/Image-Uploader/raw/main/screenshots/IMG_3.PNG" width="360" alt="上传本地图片"/>

<img src="https://github.com/cyanzhong/Image-Uploader/raw/main/screenshots/IMG_4.PNG" width="360" alt="多种云服务"/>

## 主要特性

- [x] 支持十几种常见云服务
- [x] 多种选择图片的方式
- [x] 图片缩放和压缩等工具
- [x] 为 Markdown 设计
- [x] 敏感数据存放于钥匙串
- [x] 完全开源，值得信赖
- [x] 完全可定制，插件化设计
- [x] 极致的系统原生界面
- [x] 支持 iPhone、iPad 和 Mac
- [x] 轻量，打包文件仅 160 KB

## 自定义图床

有两种方法来定制图床，使用自定义图床或创建您自己的图床，请查看[文档](https://github.com/cyanzhong/Image-Uploader/blob/main/DOCS_CN.md)来了解更多。

## 构建 Taio 动作

从源码构建 Taio [文本动作](https://docs.taio.app/#/cn/quick-start/actions)，只需运行：

```
yarn install && yarn build
```

生成的文件位于 `dist` 目录中，AirDrop 到设备或从 Taio 打开文件来完成安装。

## TODO

- [ ] 支持通过链接扩展图床
- [ ] 支持删除服务器上的文件

## 第三方开源协议

- [crypto-js](https://github.com/brix/crypto-js/blob/develop/LICENSE)
- [bottleneck](https://github.com/SGrondin/bottleneck/blob/master/LICENSE)
- [filesize.js](https://github.com/avoidwork/filesize.js/blob/master/LICENSE)