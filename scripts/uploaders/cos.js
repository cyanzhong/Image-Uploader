const name = { "en": "Tencent COS", "zh-Hans": "腾讯云 COS" };
const supportsFilePath = true;
const onlineDoc = {
  "en": "https://intl.cloud.tencent.com/document/product/628/11782",
  "zh-Hans": "https://cloud.tencent.com/document/product/628/47885"
};

const keyPaths = {
  region: "cos.region",
  bucket: "cos.bucket",
  secretID: "secret.identifier",
  secretKey: "secret.key",
  customDomain: "custom.domain",
  suffix: "url.suffix",
}

const regions = [
  "ap-beijing-1",
  "ap-beijing",
  "ap-nanjing",
  "ap-shanghai",
  "ap-guangzhou",
  "ap-chengdu",
  "ap-chongqing",
  "ap-shenzhen-fsi",
  "ap-shanghai-fsi",
  "ap-beijing-fsi",
  "ap-hongkong",
  "ap-singapore",
  "ap-mumbai",
  "ap-jakarta",
  "ap-seoul",
  "ap-bangkok",
  "ap-tokyo",
  "na-siliconvalley",
  "na-ashburn",
  "na-toronto",
  "sa-saopaulo",
  "eu-frankfurt",
  "eu-moscow",
]

const regionNames = {
  "ap-beijing-1": {
    "en": "Beijing 1",
    "zh-Hans": "北京一区"
  },
  "ap-beijing": {
    "en": "Beijing",
    "zh-Hans": "北京"
  },
  "ap-nanjing": {
    "en": "Nanjing",
    "zh-Hans": "南京"
  },
  "ap-shanghai": {
    "en": "Shanghai",
    "zh-Hans": "上海"
  },
  "ap-guangzhou": {
    "en": "Guangzhou",
    "zh-Hans": "广州"
  },
  "ap-chengdu": {
    "en": "Chengdu",
    "zh-Hans": "成都"
  },
  "ap-chongqing": {
    "en": "Chongqing",
    "zh-Hans": "重庆"
  },
  "ap-shenzhen-fsi": {
    "en": "Shenzhen Finance",
    "zh-Hans": "深圳金融"
  },
  "ap-shanghai-fsi": {
    "en": "Shanghai Finance",
    "zh-Hans": "上海金融"
  },
  "ap-beijing-fsi": {
    "en": "Beijing Finance",
    "zh-Hans": "北京金融"
  },
  "ap-hongkong": {
    "en": "Hong Kong, China",
    "zh-Hans": "中国香港"
  },
  "ap-singapore": {
    "en": "Singapore",
    "zh-Hans": "新加坡"
  },
  "ap-mumbai": {
    "en": "Mumbai",
    "zh-Hans": "孟买"
  },
  "ap-jakarta": {
    "en": "Jakarta",
    "zh-Hans": "雅加达"
  },
  "ap-seoul": {
    "en": "Seoul",
    "zh-Hans": "首尔"
  },
  "ap-bangkok": {
    "en": "Bangkok",
    "zh-Hans": "曼谷"
  },
  "ap-tokyo": {
    "en": "Tokyo",
    "zh-Hans": "东京"
  },
  "na-siliconvalley": {
    "en": "Silicon Valley",
    "zh-Hans": "硅谷 (美西)"
  },
  "na-ashburn": {
    "en": "Virginia",
    "zh-Hans": "弗吉尼亚 (美东)"
  },
  "na-toronto": {
    "en": "Toronto",
    "zh-Hans": "多伦多"
  },
  "sa-saopaulo": {
    "en": "São Paulo",
    "zh-Hans": "圣保罗"
  },
  "eu-frankfurt": {
    "en": "Frankfurt",
    "zh-Hans": "法兰克福"
  },
  "eu-moscow": {
    "en": "Moscow",
    "zh-Hans": "莫斯科"
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
      "title": "Secret ID",
      "type": "password",
      "key": keyPaths.secretID
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
  const { enc, SHA1, HmacSHA1 } = util.crypto;
  const method = "put";
  const filePath = file.path;
  const bucket = options[keyPaths.bucket];
  const region = regions[options[keyPaths.region]];
  const host = `${bucket}.cos.${region}.myqcloud.com`;
  const startTime = parseInt(new Date().getTime() / 1000);
  const endTime = startTime + 7200;
  const keyTime = `${startTime};${endTime}`;
  const canonical = `${method}\n/${decodeURI(filePath)}\n\nhost=${host}\n`;
  const queryHash = SHA1(enc.Utf8.parse(canonical)).toString();
  const stringToSign = `sha1\n${keyTime}\n${queryHash}\n`;
  const signKey = HmacSHA1(keyTime, options[keyPaths.secretKey]).toString();
  const signature = HmacSHA1(stringToSign, signKey).toString();
  const authorization = `q-sign-algorithm=sha1&q-ak=${options[keyPaths.secretID]}&q-sign-time=${keyTime}&q-key-time=${keyTime}&q-header-list=host&q-url-param-list=&q-signature=${signature}`;

  return {
    method,
    url: `https://${host}/${filePath}`,
    header: {
      "Content-Type": file.type,
      "Authorization": authorization,
      "x-cos-acl": "public-read"
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
      return `${bucket}.cos.${region}.myqcloud.com`;
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