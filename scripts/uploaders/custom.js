const name = { "en": "Custom", "zh-Hans": "自定义" };
const onlineDoc = {
  "en": "https://github.com/cyanzhong/Image-Uploader/blob/main/DOCS.md",
  "zh-Hans": "https://github.com/cyanzhong/Image-Uploader/blob/main/DOCS_CN.md"
};

const keyPaths = {
  url: "api.url",
  httpMethod: "http.method",
  httpHeaders: "http.headers",
  httpBody: "http.body",
  formFileName: "form.filename",
  jsonResultPath: "json.result.path",
  customDomain: "custom.domain",
  suffix: "url.suffix",
}

const httpMethods = [
  "POST", "PUT",
]

function config(util) {
  return [
    {
      "title": {
        "en": "API URL",
        "zh-Hans": "API 地址"
      },
      "type": "string",
      "key": keyPaths.url
    },
    {
      "title": {
        "en": "HTTP Method",
        "zh-Hans": "HTTP 方法"
      },
      "type": "list",
      "items": httpMethods,
      "key": keyPaths.httpMethod
    },
    {
      "title": {
        "en": "HTTP Headers",
        "zh-Hans": "HTTP 请求头"
      },
      "type": "string",
      "key": keyPaths.httpHeaders,
      "inline": false,
      "placeholder": "key1: value1\nkey2: value2"
    },
    {
      "title": {
        "en": "HTTP Body",
        "zh-Hans": "HTTP 请求体"
      },
      "type": "string",
      "key": keyPaths.httpBody,
      "inline": false,
      "placeholder": "key1: value1\nkey2: value2"
    },
    {
      "title": {
        "en": "Form File Name",
        "zh-Hans": "表单文件名"
      },
      "type": "string",
      "key": keyPaths.formFileName
    },
    {
      "title": {
        "en": "JSON Result Path",
        "zh-Hans": "JSON 结果路径"
      },
      "type": "string",
      "key": keyPaths.jsonResultPath,
      "placeholder": {
        "en": "E.g., data.url",
        "zh-Hans": "例如 data.url"
      }
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
  return {
    url: options[keyPaths.url],
    method: httpMethods[options[keyPaths.httpMethod]],
    header: keyValues(options[keyPaths.httpHeaders]),
    body: keyValues(options[keyPaths.httpBody]),
    files: [
      {
        "data": file.data,
        "name": options[keyPaths.formFileName]
      }
    ]
  };
}

function parse(data, _, options) {
  const error = { error: JSON.stringify(data) };
  try {
    let path = data;
    const keys = options[keyPaths.jsonResultPath].split(".");
    for (const key of keys) {
      path = path[key];
    }

    if (!path) {
      return error;
    }

    const domain = options[keyPaths.customDomain];
    const prefix = domain ? `https://${domain}` : "";
    const suffix = options[keyPaths.suffix] || "";
    return {
      remotePath: `${prefix}${path}${suffix}`
    }
  } catch (_) {
    return error;
  }
}

function keyValues(text) {
  if (!text || text.length === 0) {
    return null;
  }

  const result = {};
  const fields = text.split("\n");
  fields.forEach(field => {
    const index = field.indexOf(": ");
    if (index >= 0) {
      const key = field.substring(0, index);
      const value = field.substring(index + 2);
      result[key] = value;
    }
  })

  return result;
}

module.exports = {
  name,
  onlineDoc,
  config,
  request,
  parse
}