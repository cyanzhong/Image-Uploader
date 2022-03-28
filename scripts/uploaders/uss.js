const name = { "en": "Upyun USS", "zh-Hans": "又拍云 USS" };
const supportsFilePath = true;
const onlineDoc = "https://help.upyun.com/knowledge-base/quick_start/#e6938de4bd9ce59198";

const keyPaths = {
  serviceName: "service.name",
  operator: "uss.operator",
  password: "uss.password",
  customDomain: "custom.domain",
  suffix: "url.suffix",
}

function config(util) {
  return [
    {
      "title": {
        "en": "Service Name",
        "zh-Hans": "服务名称"
      },
      "type": "string",
      "key": keyPaths.serviceName
    },
    {
      "title": {
        "en": "Operator",
        "zh-Hans": "操作员"
      },
      "type": "string",
      "key": keyPaths.operator
    },
    {
      "title": {
        "en": "Password",
        "zh-Hans": "密码"
      },
      "type": "password",
      "key": keyPaths.password
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
  const bucket = options[keyPaths.serviceName];
  const filePath = file.path;
  const date = (new Date()).toUTCString();
  const uri = `/${bucket}/${filePath}`;
  const stringToSign = `${method}&${uri}&${date}`;
  const password = util.encode.md5(options[keyPaths.password]);
  const signature = enc.Base64.stringify(HmacSHA1(stringToSign, password));

  return {
    method,
    url: `https://v0.api.upyun.com/${bucket}/${filePath}`,
    header: {
      "Content-Type": file.type,
      "Authorization": `UPYUN ${options[keyPaths.operator]}:${signature}`,
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
  const url = (() => {
    const domain = options[keyPaths.customDomain];
    if (domain && domain.length > 0) {
      return `https://${domain}`;
    } else {
      return `http://${options[keyPaths.serviceName]}.test.upcdn.net`;
    }
  })();

  const suffix = options[keyPaths.suffix] || "";
  return `${url}/${path}${suffix}`;
}

module.exports = {
  name,
  supportsFilePath,
  onlineDoc,
  config,
  request,
  parse
}