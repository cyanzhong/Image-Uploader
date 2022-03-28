const name = { "en": "QingCloud QingStor", "zh-Hans": "青云 QingStor" };
const supportsFilePath = true;
const onlineDoc = "https://docs.qingcloud.com/qingstor/api/common/signature.html#%E8%8E%B7%E5%8F%96-access-key";

const keyPaths = {
  region: "qingstor.region",
  bucket: "qingstor.bucket",
  accessKey: "access.key",
  secretKey: "secret.key",
  customDomain: "custom.domain",
  suffix: "url.suffix",
}

const regions = [
  "pek3a", "pek3b", "sh1a", "gd2", "ap3",
]

const regionNames = {
  "pek3a": {
    "en": "Beijing 3 (A)",
    "zh-Hans": "北京 3 区 (A)"
  },
  "pek3b": {
    "en": "Beijing 3 (B)",
    "zh-Hans": "北京 3 区 (B)"
  },
  "sh1a": {
    "en": "Shanghai Zone 1 (A)",
    "zh-Hans": "上海 1 区 (A)"
  },
  "gd2": {
    "en": "Guangdong 2",
    "zh-Hans": "广东 2 区"
  },
  "ap3": {
    "en": "Jakarta",
    "zh-Hans": "雅加达"
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
  const { enc, HmacSHA256 } = util.crypto;
  const method = "PUT";
  const filePath = file.path;
  const contentType = file.type;
  const bucket = options[keyPaths.bucket];
  const region = regions[options[keyPaths.region]];
  const host = `${bucket}.${region}.qingstor.com`;
  const date = (new Date()).toUTCString();

  const stringToSign = [
    method, "",
    contentType,
    date,
    `/${bucket}/${filePath}`
  ].join("\n");

  const signature = enc.Base64.stringify(HmacSHA256(stringToSign, options[keyPaths.secretKey]));
  const authorization = `QS ${options[keyPaths.accessKey]}:${signature}`;

  return {
    method,
    url: `http://${host}/${filePath}`,
    header: {
      "Content-Type": contentType,
      "Authorization": authorization,
      "Date": date
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
      return `${bucket}.${region}.qingstor.com`;
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