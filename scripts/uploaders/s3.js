const name = "Amazon S3";
const supportsFilePath = true;
const onlineDoc = "https://docs.aws.amazon.com/general/latest/gr/aws-security-credentials.html";

const keyPaths = {
  region: "aws.region",
  bucket: "aws.bucket",
  accessKeyID: "access.key.id",
  secretAccessKey: "secret.access.key",
  customDomain: "custom.domain",
  suffix: "url.suffix",
}

const regions = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "af-south-1",
  "ap-east-1", "ap-south-1", "ap-southeast-1", "ap-southeast-2", "ap-southeast-3", "ap-northeast-1", "ap-northeast-2", "ap-northeast-3",
  "ca-central-1",
  "eu-central-1",
  "eu-south-1", "eu-north-1", "eu-west-1", "eu-west-2", "eu-west-3",
  "me-south-1",
  "sa-east-1",
  "cn-north-1", "cn-northwest-1", // China only
]

const regionNames = {
  "us-east-1": {
    "en": "US East (N. Virginia)",
    "zh-Hans": "美国东部 (弗吉尼亚北部)"
  },
  "us-east-2": {
    "en": "US East (Ohio)",
    "zh-Hans": "美国东部 (俄亥俄)"
  },
  "us-west-1": {
    "en": "US West (N. California)",
    "zh-Hans": "美国西部 (加利福尼亚北部)"
  },
  "us-west-2": {
    "en": "US West (Oregon)",
    "zh-Hans": "美国西部 (俄勒冈)"
  },
  "af-south-1": {
    "en": "Africa (Cape Town)",
    "zh-Hans": "非洲 (开普敦)"
  },
  "ap-east-1": {
    "en": "Asia Pacific (Hong Kong)",
    "zh-Hans": "亚太地区 (香港)"
  },
  "ap-south-1": {
    "en": "Asia Pacific (Mumbai)",
    "zh-Hans": "亚太地区 (孟买)"
  },
  "ap-southeast-1": {
    "en": "Asia Pacific (Singapore)",
    "zh-Hans": "亚太地区 (新加坡)"
  },
  "ap-southeast-2": {
    "en": "Asia Pacific (Sydney)",
    "zh-Hans": "亚太地区 (悉尼)"
  },
  "ap-southeast-3": {
    "en": "Asia Pacific (Jakarta)",
    "zh-Hans": "亚太地区 (雅加达)"
  },
  "ap-northeast-1": {
    "en": "Asia Pacific (Tokyo)",
    "zh-Hans": "亚太地区 (东京)"
  },
  "ap-northeast-2": {
    "en": "Asia Pacific (Seoul)",
    "zh-Hans": "亚太地区 (首尔)"
  },
  "ap-northeast-3": {
    "en": "Asia Pacific (Osaka)",
    "zh-Hans": "亚太地区 (大阪)"
  },
  "ca-central-1": {
    "en": "Canada (Central)",
    "zh-Hans": "加拿大 (中部)"
  },
  "eu-central-1": {
    "en": "Europe (Frankfurt)",
    "zh-Hans": "欧洲 (法兰克福)"
  },
  "eu-south-1": {
    "en": "Europe (Milan)",
    "zh-Hans": "欧洲 (米兰)"
  },
  "eu-north-1": {
    "en": "Europe (Stockholm)",
    "zh-Hans": "欧洲 (斯德哥尔摩)"
  },
  "eu-west-1": {
    "en": "Europe (Ireland)",
    "zh-Hans": "欧洲 (爱尔兰)"
  },
  "eu-west-2": {
    "en": "Europe (London)",
    "zh-Hans": "欧洲 (伦敦)"
  },
  "eu-west-3": {
    "en": "Europe (Paris)",
    "zh-Hans": "欧洲 (巴黎)"
  },
  "me-south-1": {
    "en": "Middle East (Bahrain)",
    "zh-Hans": "中东 (巴林)"
  },
  "sa-east-1": {
    "en": "South America (São Paulo)",
    "zh-Hans": "南美洲 (圣保罗)"
  },
  "cn-north-1": {
    "en": "China (Beijing)",
    "zh-Hans": "中国 (北京)"
  },
  "cn-northwest-1": {
    "en": "China (Ningxia)",
    "zh-Hans": "中国 (宁夏)"
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
      "title": "Access Key ID",
      "type": "password",
      "key": keyPaths.accessKeyID
    },
    {
      "title": "Secret Access Key",
      "type": "password",
      "key": keyPaths.secretAccessKey
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
  const serviceName = "s3";
  const filePath = file.path;
  const fileHash = util.encode.sha256(file.data);

  const region = regions[options[keyPaths.region]];
  const bucket = options[keyPaths.bucket];
  const host = buildHost(region, bucket);
  const algorithm = "AWS4-HMAC-SHA256";
  const xAmzDate = `${(new Date()).toISOString().substring(0, 19).replaceAll(/[-:]/g, "")}Z`;
  const shortDate = xAmzDate.substring(0, 8);
  const signedHeaders = "host;x-amz-acl;x-amz-content-sha256;x-amz-date";
  const aws4Name = "aws4_request";
  const scope = `${shortDate}/${region}/${serviceName}/${aws4Name}`;

  const canonical = [
    method,
    `/${filePath}`,
    "",
    `host:${host}`,
    "x-amz-acl:public-read",
    `x-amz-content-sha256:${fileHash}`,
    `x-amz-date:${xAmzDate}`,
    "",
    signedHeaders,
    fileHash
  ].join("\n");
  
  const stringToSign = [
    algorithm,
    xAmzDate,
    scope,
    util.encode.sha256(canonical)
  ].join("\n");

  const signingKey = (() => {
    const kDate = HmacSHA256(shortDate, `AWS4${options[keyPaths.secretAccessKey]}`);
    const kRegion = HmacSHA256(region, kDate);
    const kService = HmacSHA256(serviceName, kRegion);
    const kSigning = HmacSHA256(aws4Name, kService);
    return kSigning;
  })();

  const signature = HmacSHA256(stringToSign, signingKey).toString();

  return {
    method,
    url: `https://${host}/${filePath}`,
    header: {
      "Content-Type": file.type,
      "Authorization": `${algorithm} Credential=${options[keyPaths.accessKeyID]}/${scope},SignedHeaders=${signedHeaders},Signature=${signature}`,
      "x-amz-acl": "public-read",
      "x-amz-content-sha256": fileHash,
      "x-amz-date": xAmzDate
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
  const region = regions[options[keyPaths.region]];
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
  const serviceName = "s3";
  if (region.startsWith("cn-")) {
    return `${serviceName}.${region}.amazonaws.com.cn/${bucket}`;
  } else {
    return `${bucket}.${serviceName}.${region}.amazonaws.com`;
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