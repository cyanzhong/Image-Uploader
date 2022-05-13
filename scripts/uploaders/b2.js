const s3 = require("./s3");
const name = "Backblaze B2";
const supportsFilePath = true;
const onlineDoc = "https://secure.backblaze.com/app_keys.htm";

const keyPaths = {
  region: "b2.region",
  bucket: "b2.bucket",
  keyID: "b2.key.id",
  appKey: "b2.app.key",
  customDomain: "custom.domain",
  suffix: "url.suffix",
}

function config(util) {
  return [
    {
      "title": {
        "en": "Region",
        "zh-Hans": "地区"
      },
      "type": "string",
      "key": keyPaths.region
    },
    {
      "title": {
        "en": "Bucket",
        "zh-Hans": "存储桶"
      },
      "type": "string",
      "key": keyPaths.bucket
    },
    {
      "title": "Key ID",
      "type": "password",
      "key": keyPaths.keyID
    },
    {
      "title": "Application Key",
      "type": "password",
      "key": keyPaths.appKey
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
  const region = options[keyPaths.region];
  return s3.compatible(file, {
    region,
    host: buildHost(region, options[keyPaths.bucket]),
    accessKeyID: options[keyPaths.keyID],
    secretAccessKey: options[keyPaths.appKey],
    acl: false
  }, util);
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
  const region = options[keyPaths.region];
  const bucket = options[keyPaths.bucket];
  const domain = options[keyPaths.customDomain];
  const suffix = options[keyPaths.suffix] || "";

  const host = (() => {
    if (domain && domain.length > 0) {
      return domain;
    } else {
      return buildHost(region, bucket);
    }
  })();

  return `https://${host}/${path}${suffix}`;
}

function buildHost(region, bucket) {
  return `${bucket}.s3.${region}.backblazeb2.com`;
}

module.exports = {
  name,
  supportsFilePath,
  onlineDoc,
  config,
  request,
  parse
}