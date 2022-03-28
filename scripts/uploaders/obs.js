const name = { "en": "Huawei OBS", "zh-Hans": "华为云 OBS" };
const supportsFilePath = true;
const onlineDoc = {
  "en": "https://support.huaweicloud.com/intl/en-us/productdesc-obs/obs_03_0208.html",
  "zh-Hans": "https://support.huaweicloud.com/productdesc-obs/obs_03_0208.html"
};

const keyPaths = {
  region: "obs.region",
  bucket: "obs.bucket",
  accessKey: "access.key",
  secretKey: "secret.key",
  customDomain: "custom.domain",
  suffix: "url.suffix",
}

const regions = [
  "cn-north-1", "cn-north-4", "cn-north-9", "cn-east-2", "cn-east-3", "cn-south-1", "cn-southwest-2",
  "af-south-1",
  "na-mexico-1", "la-north-2", "la-south-2", "sa-brazil-1",
  "ap-southeast-1", "ap-southeast-2", "ap-southeast-3",
]

const regionNames = {
  "cn-north-1": {
    "en": "North China (Beijing 1)",
    "zh-Hans": "华北 (北京 1)"
  },
  "cn-north-4": {
    "en": "North China (Beijing 4)",
    "zh-Hans": "华北 (北京 4)"
  },
  "cn-north-9": {
    "en": "North China (Ulanqab 1)",
    "zh-Hans": "华北 (乌兰察布 1)"
  },
  "cn-east-2": {
    "en": "East China (Shanghai 2)",
    "zh-Hans": "华东 (上海 2)"
  },
  "cn-east-3": {
    "en": "East China (Shanghai 1)",
    "zh-Hans": "华东 (上海 1)"
  },
  "cn-south-1": {
    "en": "South China (Guangzhou)",
    "zh-Hans": "华南 (广州)"
  },
  "cn-southwest-2": {
    "en": "Southwest (Guiyang 1)",
    "zh-Hans": "西南 (贵阳 1)"
  },
  "af-south-1": {
    "en": "Africa (Johannesburg)",
    "zh-Hans": "非洲 (约翰内斯堡)"
  },
  "na-mexico-1": {
    "en": "Latin America (Mexico 1)",
    "zh-Hans": "拉美 (墨西哥 1)"
  },
  "la-north-2": {
    "en": "Latin America (Mexico 2)",
    "zh-Hans": "拉美 (墨西哥 2)"
  },
  "la-south-2": {
    "en": "Latin America (Santiago)",
    "zh-Hans": "拉美 (圣地亚哥)"
  },
  "sa-brazil-1": {
    "en": "Latin America (São Paulo 1)",
    "zh-Hans": "拉美 (圣保罗 1)"
  },
  "ap-southeast-1": {
    "en": "China (Hong Kong)",
    "zh-Hans": "中国 (香港)"
  },
  "ap-southeast-2": {
    "en": "Asia Pacific (Bangkok)",
    "zh-Hans": "亚太 (曼谷)"
  },
  "ap-southeast-3": {
    "en": "Asia Pacific (Singapore)",
    "zh-Hans": "亚太 (新加坡)"
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
  const { enc, HmacSHA1 } = util.crypto;
  const method = "PUT";
  const bucket = options[keyPaths.bucket];
  const region = regions[options[keyPaths.region]];
  const filePath = file.path;
  const contentType = file.type;
  const date = (new Date()).toUTCString();

  const stringToSign = [
    method, "",
    contentType,
    date,
    "x-obs-acl:public-read",
    `/${bucket}/${filePath}`
  ].join("\n");

  const signature = enc.Base64.stringify(HmacSHA1(stringToSign, options[keyPaths.secretKey]));

  return {
    method,
    url: `https://${bucket}.obs.${region}.myhuaweicloud.com/${filePath}`,
    header: {
      "Content-Type": contentType,
      "Authorization": `OBS ${options[keyPaths.accessKey]}:${signature}`,
      "Date": date,
      "x-obs-acl": "public-read"
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
      return `${bucket}.obs.${region}.myhuaweicloud.com`;
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