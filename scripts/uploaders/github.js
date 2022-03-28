const name = "GitHub";
const supportsFilePath = true;
const onlineDoc = "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token";

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
      "placeholder": "main"
    }
  ]
}

function request(file, options, util) {
  const filePath = file.path;
  return {
    method: "PUT",
    url: `https://api.github.com/repos/${options[keyPaths.accountName]}/${options[keyPaths.repoName]}/contents/${filePath}`,
    header: {
      "Authorization": `token ${options[keyPaths.apiToken]}`,
    },
    body: {
      "branch": options[keyPaths.branchName] || "main",
      "path": filePath,
      "content": util.encode.base64(file.data),
      "message": `Upload ${decodeURI(filePath)}`
    }
  }
}

function parse(data, path, options) {
  if (data.message) {
    return {
      error: JSON.stringify(data)
    }
  }

  return {
    remotePath: `${data.content.html_url}?raw=true`
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