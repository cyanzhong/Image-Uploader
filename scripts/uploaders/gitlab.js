const name = "GitLab";
const supportsFilePath = true;
const onlineDoc = "https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html";

const keyPaths = {
  projectID: "project.identifier",
  apiToken: "api.token",
  customDomain: "custom.domain",
}

function config(util) {
  return [
    {
      "title": {
        "en": "Project ID",
        "zh-Hans": "项目 ID"
      },
      "type": "string",
      "key": keyPaths.projectID
    },
    {
      "title": "Token",
      "type": "password",
      "key": keyPaths.apiToken
    }
  ]
}

function request(file, options, util) {
  return {
    method: "POST",
    url: `https://gitlab.com/api/v4/projects/${options[keyPaths.projectID]}/uploads`,
    header: {
      "PRIVATE-TOKEN": options[keyPaths.apiToken]
    },
    files: [
      {
        "data": file.data,
        "name": "file",
        "filename": file.path
      }
    ]
  };
}

function parse(data, path, options) {
  if (data.full_path) {
    const host = (() => {
      const domain = options[keyPaths.customDomain];
      if (domain && domain.length > 0) {
        return domain;
      } else {
        return "gitlab.com";
      }
    })();
    return {
      remotePath: `https://${host}${data.full_path}`
    };
  }

  return {
    error: JSON.stringify(data)
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