const name = { "en": "Qiniu KODO", "zh-Hans": "七牛云 KODO" };
const supportsFilePath = true;
const onlineDoc = "https://developer.qiniu.com/kodo/3702/QiniuToken";

const keyPaths = {
  region: "qiniu.region",
  bucket: "qiniu.bucket",
  accessKey: "access.key",
  secretKey: "secret.key",
  customDomain: "custom.domain",
  suffix: "url.suffix",
}

const regions = [
  "z0", "z1", "z2", "na0", "as0", "cn-east-2",
]

const regionNames = {
  "z0": {
    "en": "East China",
    "zh-Hans": "华东"
  },
  "z1": {
    "en": "North China",
    "zh-Hans": "华北"
  },
  "z2": {
    "en": "South China",
    "zh-Hans": "华南"
  },
  "na0": {
    "en": "North America",
    "zh-Hans": "北美"
  },
  "as0": {
    "en": "Southeast Asia",
    "zh-Hans": "东南亚"
  },
  "cn-east-2": {
    "en": "East China (Zhejiang 2)",
    "zh-Hans": "华东 (浙江 2)"
  },
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
      "key": keyPaths.customDomain
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
  const { enc, HmacSHA1 } = util.crypto;
  const key = decodeURI(file.path);
  const scope = `${options[keyPaths.bucket]}:${key}`;
  const deadline = parseInt(new Date().getTime() / 1000) + 3600;

  const safeBase64 = str => {
    return str.replace(/\//g, "_").replace(/\+/g, "-");
  };

  const policy = safeBase64(util.encode.base64(JSON.stringify({ scope, deadline })));
  const signature = safeBase64(enc.Base64.stringify(HmacSHA1(policy, options[keyPaths.secretKey])));
  const token = `${options[keyPaths.accessKey]}:${signature}:${policy}`;
  const region = (() => {
    const suffix = regions[options[keyPaths.region]];
    return suffix === "z0" ? "" : `-${suffix}`;
  })();

  return {
    method: "POST",
    url: `https://upload${region}.qiniup.com`,
    form: {
      key,
      token,
      file: file.data
    }
  };
}

function parse(data, path, options) {
  if (!data.hash) {
    return {
      error: JSON.stringify(data)
    }
  }

  const host = options[keyPaths.customDomain];
  if (host && host.length > 0) {
    const suffix = options[keyPaths.suffix] || "";
    return {
      remotePath: `https://${host}/${path}${suffix}`
    }
  } else {
    return {
      error: "Missing custom domain."
    }
  }
}

module.exports = {
  name,
  supportsFilePath,
  onlineDoc,
  config,
  request,
  parse
}