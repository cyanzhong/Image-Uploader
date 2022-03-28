const name = { "en": "Aliyun OSS", "zh-Hans": "阿里云 OSS" };
const supportsFilePath = true;
const onlineDoc = {
  "en": "https://www.alibabacloud.com/help/en/doc-detail/31950.html",
  "zh-Hans": "https://help.aliyun.com/document_detail/31950.html"
};

const keyPaths = {
  region: "oss.region",
  bucket: "oss.bucket",
  accessKey: "access.key",
  secretKey: "secret.key",
  customDomain: "custom.domain",
  suffix: "url.suffix",
}

const regions = [
  "oss-cn-hangzhou",
  "oss-cn-shanghai",
  "oss-cn-qingdao",
  "oss-cn-beijing",
  "oss-cn-zhangjiakou",
  "oss-cn-huhehaote",
  "oss-cn-wulanchabu",
  "oss-cn-shenzhen",
  "oss-cn-heyuan",
  "oss-cn-guangzhou",
  "oss-cn-chengdu",
  "oss-cn-hongkong",
  "oss-us-west-1",
  "oss-us-east-1",
  "oss-ap-southeast-1",
  "oss-ap-southeast-2",
  "oss-ap-southeast-3",
  "oss-ap-southeast-5",
  "oss-ap-northeast-1",
  "oss-ap-south-1",
  "oss-eu-central-1",
  "oss-eu-west-1",
  "oss-me-east-1",
  "oss-ap-southeast-6",
]

const regionNames = {
  "oss-cn-hangzhou": {
    "en": "East China 1 (Hangzhou)",
    "zh-Hans": "华东 1 (杭州)"
  },
  "oss-cn-shanghai": {
    "en": "East China 2 (Shanghai)",
    "zh-Hans": "华东 2 (上海)"
  },
  "oss-cn-qingdao": {
    "en": "North China 1 (Qingdao)",
    "zh-Hans": "华北 1 (青岛)"
  },
  "oss-cn-beijing": {
    "en": "North China 2 (Beijing)",
    "zh-Hans": "华北 2 (北京)"
  },
  "oss-cn-zhangjiakou": {
    "en": "North China 3 (Zhangjiakou)",
    "zh-Hans": "华北 3 (张家口)"
  },
  "oss-cn-huhehaote": {
    "en": "North China 5 (Hohhot)",
    "zh-Hans": "华北 5 (呼和浩特)"
  },
  "oss-cn-wulanchabu": {
    "en": "North China 6 (Ulaanbaatar)",
    "zh-Hans": "华北 6 (乌兰察布)"
  },
  "oss-cn-shenzhen": {
    "en": "South China 1 (Shenzhen)",
    "zh-Hans": "华南 1 (深圳)"
  },
  "oss-cn-heyuan": {
    "en": "South China 2 (Heyuan)",
    "zh-Hans": "华南 2 (河源)"
  },
  "oss-cn-guangzhou": {
    "en": "South China 3 (Guangzhou)",
    "zh-Hans": "华南 3 (广州)"
  },
  "oss-cn-chengdu": {
    "en": "Southwest 1 (Chengdu)",
    "zh-Hans": "西南 1 (成都)"
  },
  "oss-cn-hongkong": {
    "en": "China (Hong Kong)",
    "zh-Hans": "中国 (香港)"
  },
  "oss-us-west-1": {
    "en": "US West (Silicon Valley)",
    "zh-Hans": "美国西部 (硅谷)"
  },
  "oss-us-east-1": {
    "en": "US East (Virginia)",
    "zh-Hans": "美国东部 (弗吉尼亚)"
  },
  "oss-ap-southeast-1": {
    "en": "Singapore",
    "zh-Hans": "新加坡"
  },
  "oss-ap-southeast-2": {
    "en": "Australia (Sydney)",
    "zh-Hans": "澳大利亚 (悉尼)"
  },
  "oss-ap-southeast-3": {
    "en": "Malaysia (Kuala Lumpur)",
    "zh-Hans": "马来西亚 (吉隆坡)"
  },
  "oss-ap-southeast-5": {
    "en": "Indonesia (Jakarta)",
    "zh-Hans": "印度尼西亚 (雅加达)"
  },
  "oss-ap-northeast-1": {
    "en": "Japan (Tokyo)",
    "zh-Hans": "日本 (东京)"
  },
  "oss-ap-south-1": {
    "en": "India (Mumbai)",
    "zh-Hans": "印度 (孟买)"
  },
  "oss-eu-central-1": {
    "en": "Germany (Frankfurt)",
    "zh-Hans": "德国 (法兰克福)"
  },
  "oss-eu-west-1": {
    "en": "United Kingdom (London)",
    "zh-Hans": "英国 (伦敦)"
  },
  "oss-me-east-1": {
    "en": "UAE (Dubai)",
    "zh-Hans": "阿联酋 (迪拜)"
  },
  "oss-ap-southeast-6": {
    "en": "Philippines (Manila)",
    "zh-Hans": "菲律宾 (马尼拉)"
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
  const { enc, HmacSHA1 } = util.crypto;
  const method = "PUT";
  const bucket = options[keyPaths.bucket];
  const region = regions[options[keyPaths.region]];
  const filePath = file.path;
  const contentType = file.type;
  const date = (new Date()).toGMTString();
  const stringToSign = [
    method, "",
    contentType,
    date,
    "x-oss-object-acl:public-read",
    `/${bucket}/${decodeURI(filePath)}`
  ].join("\n");

  const signingUtf8 = enc.Utf8.parse(stringToSign);
  const signature = enc.Base64.stringify(HmacSHA1(signingUtf8, options[keyPaths.secretKey]));

  return {
    method,
    url: `https://${bucket}.${region}.aliyuncs.com/${filePath}`,
    header: {
      "Content-Type": contentType,
      "Authorization": `OSS ${options[keyPaths.accessKey]}:${signature}`,
      "Date": date,
      "x-oss-object-acl": "public-read"
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
  }
}

function remotePath(path, options) {
  const host = (() => {
    const domain = options[keyPaths.customDomain];
    if (domain && domain.length > 0) {
      return domain;
    } else {
      const bucket = options[keyPaths.bucket];
      const region = regions[options[keyPaths.region]];
      return `${bucket}.${region}.aliyuncs.com`;
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