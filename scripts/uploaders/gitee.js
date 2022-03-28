const name = "Gitee";
const supportsFilePath = true;
const onlineDoc = "https://gitee.com/profile/personal_access_tokens";

const keyPaths = {
  accountName: "account.name",
  repoName: "repo.name",
  apiToken: "api.token",
  branchName: "branch.name",
}

function config(util) {
  return [
    {
      "title": {
        "en": "Account Name",
        "zh-Hans": "账号名称"
      },
      "type": "string",
      "key": keyPaths.accountName
    },
    {
      "title": {
        "en": "Repo Name",
        "zh-Hans": "仓库名称"
      },
      "type": "string",
      "key": keyPaths.repoName
    },
    {
      "title": "Token",
      "type": "password",
      "key": keyPaths.apiToken
    },
    {
      "title": {
        "en": "Branch Name",
        "zh-Hans": "分支名称"
      },
      "type": "string",
      "key": keyPaths.branchName,
      "placeholder": "master"
    }
  ]
}

function request(file, options, util) {
  const filePath = file.path;
  return {
    method: "POST",
    url: `https://gitee.com/api/v5/repos/${options[keyPaths.accountName]}/${options[keyPaths.repoName]}/contents/${filePath}`,
    form: {
      "access_token": options[keyPaths.apiToken],
      "branch": options[keyPaths.branchName] || "master",
      "content": util.encode.base64(file.data),
      "message": `Upload ${decodeURI(filePath)}`
    }
  }
}

function parse(data, path, options) {
  if (data.content) {
    return {
      remotePath: encodeURI(data.content.download_url)
    }
  }

  return {
    error: JSON.stringify(data)
  };
}

module.exports = {
  name,
  supportsFilePath,
  onlineDoc,
  config,
  request,
  parse
}