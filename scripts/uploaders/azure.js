const name = "Azure Blob";
const supportsFilePath = true;
const onlineDoc = {
  "en": "https://docs.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage",
  "zh-Hans": "https://docs.microsoft.com/zh-cn/azure/storage/common/storage-account-keys-manage"
};

const keyPaths = {
  accountName: "account.name",
  containerName: "container.name",
  sharedKey: "shared.key",
  customDomain: "custom.domain",
  suffix: "url.suffix",
}

function config(util) {
  return [
    {
      "title": {
        "en": "Account Name",
        "zh-Hans": "账号名称"
      },
      "type": "string",
      "key": keyPaths.accountName
    },
    {
      "title": {
        "en": "Container Name",
        "zh-Hans": "容器名称"
      },
      "type": "string",
      "key": keyPaths.containerName
    },
    {
      "title": {
        "en": "Shared Key",
        "zh-Hans": "访问密钥"
      },
      "type": "password",
      "key": keyPaths.sharedKey
    },
    {
      "title": {
        "en": "Custom Domain",
        "zh-Hans": "自定义域名"
      },
      "type": "string",
      "key": keyPaths.customDomain,
      "placeholder": {
        "en": "Optional",
        "zh-Hans": "可选"
      }
    },
    {
      "title": {
        "en": "URL Suffix",
        "zh-Hans": "链接后缀"
      },
      "type": "string",
      "key": keyPaths.suffix,
      "placeholder": {
        "en": "Optional",
        "zh-Hans": "可选"
      }
    }
  ]
}

function request(file, options, util) {
  const { enc, HmacSHA256 } = util.crypto;
  const method = "PUT";
  const filePath = file.path;
  const contentType = file.type;
  const account = options[keyPaths.accountName];
  const container = options[keyPaths.containerName];
  const xMsBlobType = "BlockBlob";
  const xMsDate = (new Date()).toGMTString();
  const xMsVersion = "2020-12-06";

  const stringToSign = [
    method, "", "",
    `${file.size}`, "",
    contentType, "", "", "", "", "", "",
    `x-ms-blob-type:${xMsBlobType}`,
    `x-ms-date:${xMsDate}`,
    `x-ms-version:${xMsVersion}`,
    `/${account}/${container}/${filePath}`
  ].join("\n");

  const signingUtf8 = enc.Utf8.parse(stringToSign);
  const sharedKeyDecoded = enc.Base64.parse(options[keyPaths.sharedKey]);
  const signature = enc.Base64.stringify(HmacSHA256(signingUtf8, sharedKeyDecoded));

  return {
    method,
    url: `https://${account}.blob.core.windows.net/${container}/${filePath}`,
    header: {
      "Authorization": `SharedKey ${account}:${signature}`,
      "Content-Type": contentType,
      "x-ms-blob-type": xMsBlobType,
      "x-ms-date": xMsDate,
      "x-ms-version": xMsVersion
    },
    body: file.data
  }
}

function parse(data, path, options) {
  if (data.length > 0) {
    return { error: data };
  }

  return {
    remotePath: remotePath(path, options)
  }
}

function remotePath(path, options) {
  const account = options[keyPaths.accountName];
  const container = options[keyPaths.containerName];
  const host = (() => {
    const domain = options[keyPaths.customDomain];
    if (domain && domain.length > 0) {
      return domain;
    } else {
      return `${account}.blob.core.windows.net`;
    }
  })();

  const suffix = options[keyPaths.suffix] || "";
  return `https://${host}/${container}/${path}${suffix}`;
}

module.exports = {
  name,
  supportsFilePath,
  onlineDoc,
  config,
  request,
  parse
}