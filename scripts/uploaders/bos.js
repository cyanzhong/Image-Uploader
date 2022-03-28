const name = { "en": "Baidu BOS", "zh-Hans": "百度云 BOS" };
const supportsFilePath = true;
const onlineDoc = {
  "en": "https://intl.cloud.baidu.com/doc/Reference/s/jjwvz2e3p-en",
  "zh-Hans": "https://cloud.baidu.com/doc/Reference/s/jjwvz2e3p"
};

const keyPaths = {
  region: "bos.region",
  bucket: "bos.bucket",
  accessKey: "access.key",
  secretKey: "secret.key",
  customDomain: "custom.domain",
  suffix: "url.suffix",
}

const regions = [
  "bj", "bd", "su", "gz", "hkg", "sin", "fwh", "fsh",
]

const regionNames = {
  "bj": {
    "en": "North China (Beijing)",
    "zh-Hans": "华北 (北京)"
  },
  "bd": {
    "en": "North China (Baoding)",
    "zh-Hans": "华北 (保定)"
  },
  "su": {
    "en": "East China (Suzhou)",
    "zh-Hans": "华东 (苏州)"
  },
  "gz": {
    "en": "South China (Guangzhou)",
    "zh-Hans": "华南 (广州)"
  },
  "hkg": {
    "en": "Hong Kong, China",
    "zh-Hans": "中国香港"
  },
  "sin": {
    "en": "Singapore",
    "zh-Hans": "新加坡"
  },
  "fwh": {
    "en": "Central China Finance (Wuhan)",
    "zh-Hans": "华中金融 (武汉)"
  },
  "fsh": {
    "en": "East China Finance (Shanghai)",
    "zh-Hans": "华东金融 (上海)"
  }
}

function config(util) {
  return [
    {
      "title": {
        "en": "Region",
        "zh-Hans": "地区"
      },
      "type": "list",
      "items": regions.map(region => `${util.localize(regionNames[region])}, ${region}`),
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
      "title": "Access Key",
      "type": "password",
      "key": keyPaths.accessKey
    },
    {
      "title": "Secret Key",
      "type": "password",
      "key": keyPaths.secretKey
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
  const { HmacSHA256 } = util.crypto;
  const method = "PUT";
  const bucket = options[keyPaths.bucket];
  const region = regions[options[keyPaths.region]];
  const host = `${bucket}.${region}.bcebos.com`;
  const filePath = file.path;
  const contentType = file.type;
  const date = `${(new Date()).toISOString().substring(0, 19)}Z`;

  const canonical = [
    method,
    `/${filePath}`, "",
    `host:${host}`
  ].join("\n");

  const prefix = `bce-auth-v1/${options[keyPaths.accessKey]}/${date}/1800`;
  const signingKey = HmacSHA256(prefix, options[keyPaths.secretKey]).toString();
  const signature = HmacSHA256(canonical, signingKey).toString();
  const authorization = `${prefix}/host/${signature}`;

  return {
    method,
    url: `https://${host}/${filePath}`,
    header: {
      "Content-Type": contentType,
      "Authorization": authorization,
      "x-bce-acl": "public-read",
      "x-bce-date": date
    },
    body: file.data
  };
}

function parse(data, path, options) {
  if (data.length > 0) {
    return { error: data };
  }

  return {
    remotePath: remotePath(path, options)
  };
}

function remotePath(path, options) {
  const host = (() => {
    const domain = options[keyPaths.customDomain];
    if (domain && domain.length > 0) {
      return domain;
    } else {
      const bucket = options[keyPaths.bucket];
      const region = regions[options[keyPaths.region]];
      return `${bucket}.${region}.bcebos.com`;
    }
  })();

  const suffix = options[keyPaths.suffix] || "";
  return `https://${host}/${path}${suffix}`;
}

module.exports = {
  name,
  supportsFilePath,
  onlineDoc,
  config,
  request,
  parse
}