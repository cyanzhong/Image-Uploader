const name = "Cloudflare R2";
const supportsFilePath = true;
const onlineDoc = "https://developers.cloudflare.com/r2/";

const keyPaths = {
    AuthKey: "r2.access.key.id",
    customDomain: "custom.domain",
    suffix: "url.suffix",
}

function config(util) {
    return [
        {
            "title": "Custom Auth Key",
            "type": "password",
            "key": keyPaths.AuthKey
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
    return compatible(file, {
        host: options[keyPaths.customDomain],
        AuthKey: options[keyPaths.AuthKey],
    });
}

function compatible(file, options) {
    const method = "PUT";
    const filePath = file.path;

    return {
        method,
        url: `https://${options.host}/${filePath}`,
        header: {
            "Content-Type": file.type,
            "X-Custom-Auth-Key": options.AuthKey
        },
        body: file.data
    };
}

function parse(data, path, options) {
    if (!data.includes('success')) {
        return { error: data };
    }

    return {
        remotePath: remotePath(path, options)
    }
}

function remotePath(path, options) {
    const domain = options[keyPaths.customDomain];
    const suffix = options[keyPaths.suffix] || "";

    return `https://${domain}/${path}${suffix}`;
}

module.exports = {
    name,
    supportsFilePath,
    onlineDoc,
    config,
    request,
    compatible,
    parse
}