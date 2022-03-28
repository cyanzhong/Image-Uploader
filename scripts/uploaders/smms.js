const name = "SM.MS";
const onlineDoc = "https://sm.ms/home/apitoken";

const keyPaths = {
  secretToken: "secret.token"
}

function config(util) {
  return [
    {
      "title": "Secret Token",
      "type": "password",
      "key": keyPaths.secretToken
    }
  ]
}

function request(file, options, util) {
  return {
    method: "POST",
    url: "https://sm.ms/api/v2/upload",
    header: {
      "Authorization": options[keyPaths.secretToken]
    },
    files: [
      {
        "data": file.data,
        "name": "smfile"
      }
    ]
  };
}

function parse(data, path, options) {
  if (data.success) {
    return {
      remotePath: data.data.url
    };
  }

  return {
    error: JSON.stringify(data)
  };
}

module.exports = {
  name,
  onlineDoc,
  config,
  request,
  parse
}